const axios = require('axios');
const User = require('../models/User');
const { parse } = require('csv-parse');
const { Readable } = require('stream');
const Parser = require('rss-parser');

const getFplApiConfig = (timeout = 7000) => ({
  headers: { 'User-Agent': 'FPL-Assistant-App/1.0' },
  timeout,
});

const rssParser = new Parser({
  customFields: {
    item: ['image', ['media:content', 'mediaContent', { keepArray: false }]],
  },
});

let teamNameMapCache = null;
let teamCacheTimestamp = null;
const TEAM_CACHE_DURATION_MS = 60 * 60 * 1000;

const getTeamNameMap = async () => {
  if (teamNameMapCache && teamCacheTimestamp && (new Date() - teamCacheTimestamp < TEAM_CACHE_DURATION_MS)) {
    return teamNameMapCache;
  }
  try {
    const res = await axios.get('https://fantasy.premierleague.com/api/bootstrap-static/', getFplApiConfig());
    const map = new Map();
    res.data.teams.forEach(team => map.set(team.id, team.name));
    teamNameMapCache = map;
    teamCacheTimestamp = new Date();
    return map;
  } catch (error) {
    if (teamNameMapCache) return teamNameMapCache;
    throw error;
  }
};

const fetchCurrentGameweekNumber = async () => {
  try {
    const { data } = await axios.get('https://fantasy.premierleague.com/api/bootstrap-static/', getFplApiConfig());
    const events = data.events || [];

    const current = events.find(e => e.is_current);
    if (current?.id) return current.id;

    const next = events.find(e => e.is_next);
    if (next?.id) return next.id;

    const finished = events.filter(e => e.finished).sort((a, b) => b.id - a.id);
    if (finished.length) return finished[0].id;

    const future = events.filter(e => !e.finished && !e.data_checked).sort((a, b) => a.id - b.id);
    if (future.length) return future[0].id;

    throw new Error('Gameweek not found');
  } catch (error) {
    throw error;
  }
};

const getFplManagerHistory = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'Not authorized' });

    const user = await User.findById(req.user.id).select('+fplTeamId +fplManagerHistory +fplHistoryLastUpdated');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.fplTeamId) return res.status(400).json({ message: 'FPL Team ID not set' });

    const id = user.fplTeamId;
    const urls = [
      axios.get(`https://fantasy.premierleague.com/api/entry/${id}/history/`, getFplApiConfig()),
      axios.get(`https://fantasy.premierleague.com/api/entry/${id}/`, getFplApiConfig())
    ];

    try {
      const [historyRes, entryRes] = await Promise.all(urls);
      const data = {
        history: historyRes.data,
        entry: {
          id: entryRes.data.id,
          player_first_name: entryRes.data.player_first_name,
          player_last_name: entryRes.data.player_last_name,
          name: entryRes.data.name,
          summary_overall_points: entryRes.data.summary_overall_points,
          summary_overall_rank: entryRes.data.summary_overall_rank,
          summary_event_points: entryRes.data.summary_event_points,
          summary_event_rank: entryRes.data.summary_event_rank,
          current_event: entryRes.data.current_event,
          leagues: entryRes.data.leagues,
          player_region_name: entryRes.data.player_region_name,
          player_region_iso_code_long: entryRes.data.player_region_iso_code_long,
          favourite_team: entryRes.data.favourite_team,
        },
      };
      user.fplManagerHistory = data;
      user.fplHistoryLastUpdated = new Date();
      await user.save();
      return res.json({ source: 'live_api', data });
    } catch (apiError) {
      if (user.fplManagerHistory) {
        return res.json({
          source: 'cache_api_error',
          message: 'FPL API unavailable. Serving cached data.',
          lastUpdated: user.fplHistoryLastUpdated,
          data: user.fplManagerHistory,
        });
      }
      return res.status(503).json({
        message: 'FPL API unavailable and no cached data.',
        error: apiError.message,
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching manager history.' });
  }
};

const getCurrentGameweekNumber = async (req, res) => {
  try {
    const currentGameweek = await fetchCurrentGameweekNumber();
    res.json({ currentGameweek });
  } catch (error) {
    res.status(502).json({ message: 'Failed to fetch gameweek.' });
  }
};

const getPreviousGameweekFixtures = async (req, res) => {
  try {
    const currentGW = await fetchCurrentGameweekNumber();
    const previousGW = currentGW === 1 ? 38 : currentGW - 1;
    const season = process.env.CURRENT_FPL_SEASON || '2023-24';

    const csvUrl = `https://raw.githubusercontent.com/vaastav/Fantasy-Premier-League/master/data/${season}/fixtures.csv`;
    const [csvResponse, teamNameMap] = await Promise.all([
      axios.get(csvUrl, { timeout: 10000 }),
      getTeamNameMap()
    ]);

    const parser = Readable.from(csvResponse.data).pipe(parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: (value, context) => {
        const nums = ['event', 'team_h_score', 'team_a_score', 'team_h', 'team_a', 'id'];
        if (nums.includes(context.column)) return parseInt(value, 10) || null;
        if (context.column === 'finished') return value.toLowerCase() === 'true';
        return value;
      }
    }));

    const records = [];
    for await (const record of parser) records.push(record);

    const fixtures = records
      .filter(f => f.event === previousGW && f.finished)
      .map(f => ({
        fixture_id: f.id,
        kickoff_time: f.kickoff_time,
        home_team_id: f.team_h,
        home_team_name: teamNameMap.get(f.team_h) || 'Unknown Team',
        away_team_id: f.team_a,
        away_team_name: teamNameMap.get(f.team_a) || 'Unknown Team',
        home_team_score: f.team_h_score,
        away_team_score: f.team_a_score,
        gameweek: f.event,
      }));

    if (!fixtures.length) {
      return res.status(404).json({ message: `No finished fixtures found for GW${previousGW}` });
    }

    res.json({ gameweek: previousGW, season, fixtures });
  } catch (error) {
    res.status(502).json({ message: 'Failed to fetch previous fixtures.' });
  }
};

const getUpcomingFixtures = async (req, res) => {
  try {
    const currentGameweek = await fetchCurrentGameweekNumber();
    const fplFixturesUrl = `https://fantasy.premierleague.com/api/fixtures/?event=${currentGameweek}`;
    const [response, teamNameMap] = await Promise.all([
      axios.get(fplFixturesUrl, getFplApiConfig()),
      getTeamNameMap()
    ]);
    const fixtures = response.data;

    const data = fixtures.map(f => ({
      id: f.id,
      kickoff_time: f.kickoff_time,
      gameweek: f.event,
      home_team_id: f.team_h,
      home_team_name: teamNameMap.get(f.team_h) || 'Unknown',
      away_team_id: f.team_a,
      away_team_name: teamNameMap.get(f.team_a) || 'Unknown',
      finished: f.finished,
      home_team_score: f.team_h_score,
      away_team_score: f.team_a_score,
      team_h_difficulty: f.team_h_difficulty,
      team_a_difficulty: f.team_a_difficulty,
    }));

    res.json({ gameweek: currentGameweek, fixtures: data });
  } catch (error) {
    res.status(502).json({ message: 'Failed to fetch upcoming fixtures.' });
  }
};

const getBootstrapStaticData = async (req, res) => {
  try {
    const { data } = await axios.get('https://fantasy.premierleague.com/api/bootstrap-static/', getFplApiConfig());
    res.json(data);
  } catch (error) {
    res.status(502).json({ message: 'Failed to fetch bootstrap-static data.' });
  }
};

const newsFeedCache = { items: [], lastFetched: null, cacheDurationMs: 30 * 60 * 1000 };
const feedSources = [
  { name: "BBC Sport - Football", url: "https://feeds.bbci.co.uk/sport/football/rss.xml" },
  { name: "Football News Views - PL", url: "https://www.football-news-views.co.uk/premier-league-rss.xml" },
  { name: "Football News Views - Spurs", url: "https://www.football-news-views.co.uk/tottenham-hotspurrss.xml" },
];

const getAggregatedNews = async (req, res) => {
  if (newsFeedCache.lastFetched && (new Date() - newsFeedCache.lastFetched < newsFeedCache.cacheDurationMs)) {
    return res.json(newsFeedCache.items);
  }

  let allItems = [];
  for (const source of feedSources) {
    try {
      const feed = await rssParser.parseURL(source.url);
      feed.items.forEach(item => {
        allItems.push({
          title: item.title || 'No Title',
          link: item.link || '',
          publication_date: item.pubDate ? new Date(item.pubDate).toISOString() : null,
          source_name: source.name,
          snippet: item.contentSnippet || item.content || '',
        });
      });
    } catch (_) { }
  }

  const deduplicatedItems = [];
  const seen = new Set();
  allItems.sort((a, b) => new Date(b.publication_date) - new Date(a.publication_date));
  allItems.forEach(item => {
    if (!seen.has(item.link)) {
      seen.add(item.link);
      deduplicatedItems.push(item);
    }
  });

  newsFeedCache.items = deduplicatedItems;
  newsFeedCache.lastFetched = new Date();

  res.json(deduplicatedItems);
};

module.exports = {
  getFplManagerHistory,
  getCurrentGameweekNumber,
  getPreviousGameweekFixtures,
  getUpcomingFixtures,
  getAggregatedNews,
  getBootstrapStaticData,
};
