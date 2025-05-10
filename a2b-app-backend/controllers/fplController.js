// backend/controllers/fplController.js
const axios = require('axios');
const User = require('../models/User'); // Adjust path as needed
const { parse } = require('csv-parse'); // For parsing CSV data
const { Readable } = require('stream'); // To convert string to readable stream for parser
const Parser = require('rss-parser'); // For parsing RSS feeds

// Helper function to create a consistent User-Agent and timeout config
const getFplApiConfig = (timeout = 7000) => ({
  headers: { 'User-Agent': 'FPL-Assistant-App/1.0' },
  timeout: timeout,
});

// Initialize RSS Parser
const rssParser = new Parser({
    customFields: {
        item: ['image', ['media:content', 'mediaContent', {keepArray: false}]],
    }
});

// --- Cache for bootstrap-static data (teams map) ---
let teamNameMapCache = null;
let teamCacheTimestamp = null;
const TEAM_CACHE_DURATION_MS = 60 * 60 * 1000; // Cache team names for 1 hour

const getTeamNameMap = async () => {
    if (teamNameMapCache && teamCacheTimestamp && (new Date() - teamCacheTimestamp < TEAM_CACHE_DURATION_MS)) {
        console.log('Internal: Serving team name map from cache.');
        return teamNameMapCache;
    }
    console.log('Internal: Fetching fresh team name map from bootstrap-static...');
    try {
        const bootstrapResponse = await axios.get('https://fantasy.premierleague.com/api/bootstrap-static/', getFplApiConfig());
        const teams = bootstrapResponse.data.teams;
        const newTeamNameMap = new Map();
        teams.forEach(team => {
            newTeamNameMap.set(team.id, team.name); // Using full name
        });
        teamNameMapCache = newTeamNameMap;
        teamCacheTimestamp = new Date();
        console.log('Internal: Team name map cached.');
        return newTeamNameMap;
    } catch (error) {
        console.error('Internal: Failed to fetch or build team name map:', error.message);
        // If fetching fails but we have an old cache, return it, otherwise throw
        if (teamNameMapCache) {
            console.warn('Internal: Serving stale team name map due to fetch error.');
            return teamNameMapCache;
        }
        throw error;
    }
};


// Internal helper to get current gameweek number
const fetchCurrentGameweekNumber = async () => {
  const fplBootstrapUrl = 'https://fantasy.premierleague.com/api/bootstrap-static/';
  console.log('Internal: Fetching current gameweek number from FPL API...');
  try {
    const response = await axios.get(fplBootstrapUrl, getFplApiConfig());
    const events = response.data.events;
    if (!events || !Array.isArray(events)) {
      throw new Error('Could not parse gameweek data from FPL API ("events" array not found).');
    }
    // Prioritize is_current
    const currentEvent = events.find(event => event.is_current === true);
    if (currentEvent && typeof currentEvent.id === 'number') {
      console.log(`Internal: Current event found: GW${currentEvent.id}`);
      return currentEvent.id;
    }
    // Fallback to is_next
    const nextEvent = events.find(event => event.is_next === true);
    if (nextEvent && typeof nextEvent.id === 'number') {
      console.log(`Internal: No current event, next event found: GW${nextEvent.id}`);
      return nextEvent.id;
    }
    // Fallback to latest finished event if no current/next (e.g., end of season)
    const finishedEvents = events.filter(event => event.finished === true).sort((a,b) => b.id - a.id); // Sort descending
    if (finishedEvents.length > 0 && typeof finishedEvents[0].id === 'number') {
        console.log(`Internal: No current/next event, latest finished event found: GW${finishedEvents[0].id}`);
        return finishedEvents[0].id;
    }
    // Fallback to earliest future unplayed (e.g. pre-season for next season)
    const futureEvents = events.filter(event => event.finished === false && event.data_checked === false).sort((a,b) => a.id - b.id);
    if (futureEvents.length > 0 && typeof futureEvents[0].id === 'number') {
        console.log(`Internal: No current/next/finished, using earliest future GW: ${futureEvents[0].id}`);
        return futureEvents[0].id;
    }
    throw new Error('Current, next, latest finished, or earliest future FPL gameweek not found in API response.');
  } catch (error) {
    console.error('Internal: Error fetching current FPL gameweek:', error.message);
    throw error;
  }
};

// @desc    Get FPL manager data (general info + history) for the authenticated user
const getFplManagerHistory = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Not authorized, no token or user ID found' });
    }
    const user = await User.findById(req.user.id).select('+fplTeamId +fplManagerHistory +fplHistoryLastUpdated');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (!user.fplTeamId) {
      return res.status(400).json({ message: 'FPL Team ID not set for this user.' });
    }

    const fplManagerId = user.fplTeamId;
    const fplHistoryUrl = `https://fantasy.premierleague.com/api/entry/${fplManagerId}/history/`;
    const fplEntryUrl = `https://fantasy.premierleague.com/api/entry/${fplManagerId}/`;

    let combinedData;
    let responseSource = 'cache';

    try {
      console.log(`Attempting to fetch fresh FPL data for manager ID: ${fplManagerId}`);
      const [historyResponse, entryResponse] = await Promise.all([
        axios.get(fplHistoryUrl, getFplApiConfig()),
        axios.get(fplEntryUrl, getFplApiConfig())
      ]);
      const historyData = historyResponse.data;
      const entryData = entryResponse.data;
      combinedData = {
        history: historyData,
        entry: {
          id: entryData.id,
          player_first_name: entryData.player_first_name,
          player_last_name: entryData.player_last_name,
          name: entryData.name,
          summary_overall_points: entryData.summary_overall_points,
          summary_overall_rank: entryData.summary_overall_rank,
          summary_event_points: entryData.summary_event_points,
          summary_event_rank: entryData.summary_event_rank,
          current_event: entryData.current_event,
          leagues: entryData.leagues,
          player_region_name: entryData.player_region_name,
          player_region_iso_code_long: entryData.player_region_iso_code_long,
          favourite_team: entryData.favourite_team,
        },
      };
      responseSource = 'live_api';
      user.fplManagerHistory = combinedData;
      user.fplHistoryLastUpdated = new Date();
      await user.save();
      console.log(`Successfully fetched and cached combined FPL data for manager ID: ${fplManagerId}`);
      return res.json({ source: responseSource, data: combinedData });

    } catch (apiError) {
      console.warn(`Failed to fetch fresh FPL data for manager ID ${fplManagerId}: ${apiError.message}`);
      if (apiError.isAxiosError && apiError.response) {
        console.warn(`FPL API Error Status: ${apiError.response.status}`);
      }
      console.warn(`Attempting to serve from cache for user ${req.user.id}`);
      if (user.fplManagerHistory && Object.keys(user.fplManagerHistory).length > 0) {
        console.log(`Serving combined FPL data from cache for manager ID: ${fplManagerId}`);
        return res.json({
          source: 'cache_api_error',
          message: 'FPL API is currently unavailable. Serving last known data.',
          lastUpdated: user.fplHistoryLastUpdated,
          data: user.fplManagerHistory,
        });
      } else {
        console.error(`No cached FPL data found for manager ID ${fplManagerId} after API failure.`);
        return res.status(503).json({
          message: 'FPL API is unavailable and no cached data found.',
          error: apiError.message,
        });
      }
    }
  } catch (error) {
    console.error('Error in getFplManagerHistory controller:', error.message, error.stack);
    res.status(500).json({ message: 'Server error while processing FPL manager data.' });
  }
};

// @desc    Get the current FPL gameweek number
const getCurrentGameweekNumber = async (req, res) => {
  console.log('API Call: Attempting to fetch current gameweek number...');
  try {
    const currentGameweek = await fetchCurrentGameweekNumber();
    console.log(`API Call: Effective current FPL Gameweek determined as: ${currentGameweek}`);
    res.json({ currentGameweek });
  } catch (error) {
    console.error('API Call Error: Error fetching current FPL gameweek:', error.message);
    res.status(502).json({ message: 'Failed to fetch current gameweek data from FPL API.' });
  }
};

// @desc    Get fixtures and results for the previously completed FPL gameweek
const getPreviousGameweekFixtures = async (req, res) => {
  console.log('API Call: Attempting to fetch previous gameweek fixtures...');
  try {
    const effectiveCurrentGameweek = await fetchCurrentGameweekNumber();
    console.log(`API Call: Effective current GW for previous fixtures logic: ${effectiveCurrentGameweek}`);

    let previousGameweek;
    const season = process.env.CURRENT_FPL_SEASON || '2023-24'; // Use env var or fallback
    const lastGameweekOfSeason = 38; 

    if (!effectiveCurrentGameweek) {
        return res.status(500).json({ message: 'Could not determine current gameweek to calculate previous one.' });
    }

    if (effectiveCurrentGameweek === 1) {
        previousGameweek = lastGameweekOfSeason;
        console.log(`Current GW is 1, setting previous GW to ${lastGameweekOfSeason} of season ${season}`);
    } else {
        previousGameweek = effectiveCurrentGameweek - 1;
    }
    
    if (previousGameweek < 1) {
         return res.status(404).json({ message: `Calculated previous gameweek (${previousGameweek}) is invalid.` });
    }

    const vaastavFixturesUrl = `https://raw.githubusercontent.com/vaastav/Fantasy-Premier-League/master/data/${season}/fixtures.csv`;

    console.log(`Fetching past fixtures CSV from: ${vaastavFixturesUrl} for GW${previousGameweek}`);
    const [csvResponse, teamNameMap] = await Promise.all([
        axios.get(vaastavFixturesUrl, { timeout: 10000 }),
        getTeamNameMap()
    ]);
    const csvData = csvResponse.data;

    const records = [];
    const parser = Readable.from(csvData).pipe(parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: (value, context) => {
        const numColumns = ['event', 'team_h_score', 'team_a_score', 'team_h', 'team_a', 'id'];
        if (numColumns.includes(context.column)) {
          const num = parseInt(value, 10);
          return isNaN(num) ? null : num;
        }
        if (context.column === 'finished') {
            return value.toLowerCase() === 'true';
        }
        return value;
      }
    }));

    for await (const record of parser) {
      records.push(record);
    }

    if (records.length === 0) {
      return res.status(404).json({ message: `No fixture data found in CSV for season ${season}.` });
    }

    const previousGameweekFixtures = records
      .filter(fixture => fixture.event === previousGameweek && fixture.finished === true)
      .map(fixture => ({
        fixture_id: fixture.id,
        kickoff_time: fixture.kickoff_time,
        home_team_id: fixture.team_h,
        home_team_name: teamNameMap.get(fixture.team_h) || 'Unknown Team',
        away_team_id: fixture.team_a,
        away_team_name: teamNameMap.get(fixture.team_a) || 'Unknown Team',
        home_team_score: fixture.team_h_score,
        away_team_score: fixture.team_a_score,
        gameweek: fixture.event
      }));

    if (previousGameweekFixtures.length === 0) {
        return res.status(404).json({ message: `No finished fixtures found for GW${previousGameweek} in season ${season}. (Filter check)`});
    }
    
    console.log(`Processed ${previousGameweekFixtures.length} unique fixtures for GW${previousGameweek}.`);
    res.json({ gameweek: previousGameweek, season, fixtures: previousGameweekFixtures });

  } catch (error) {
    console.error('Error fetching previous gameweek fixtures:', error.message, error.stack);
    if (error.isAxiosError && error.response && error.response.status === 404) {
        return res.status(404).json({ message: `Data for previous gameweek not found at source (404). ${error.config?.url}` });
    }
    res.status(502).json({ message: 'Failed to fetch or process previous gameweek fixture data.' });
  }
};

// @desc    Get fixtures for the current/upcoming FPL gameweek
const getUpcomingFixtures = async (req, res) => {
  console.log('API Call: Attempting to fetch upcoming/live gameweek fixtures...');
  try {
    const currentGameweek = await fetchCurrentGameweekNumber();
    if (!currentGameweek) {
      return res.status(404).json({ message: 'Current gameweek could not be determined.' });
    }

    const fplFixturesUrl = `https://fantasy.premierleague.com/api/fixtures/?event=${currentGameweek}`;
    console.log(`Fetching upcoming fixtures from: ${fplFixturesUrl}`);

    const [response, teamNameMap] = await Promise.all([
        axios.get(fplFixturesUrl, getFplApiConfig()),
        getTeamNameMap()
    ]);
    const fixturesData = response.data;

    if (!fixturesData || !Array.isArray(fixturesData)) {
      console.error('FPL API Error: Fixtures data not found or not an array.');
      return res.status(500).json({ message: 'Could not parse fixtures data from FPL API.' });
    }

    const processedFixtures = fixturesData.map(fixture => ({
      id: fixture.id,
      kickoff_time: fixture.kickoff_time,
      gameweek: fixture.event,
      home_team_id: fixture.team_h,
      home_team_name: teamNameMap.get(fixture.team_h) || 'Unknown',
      away_team_id: fixture.team_a,
      away_team_name: teamNameMap.get(fixture.team_a) || 'Unknown',
      finished: fixture.finished,
      home_team_score: fixture.team_h_score,
      away_team_score: fixture.team_a_score,
      team_h_difficulty: fixture.team_h_difficulty,
      team_a_difficulty: fixture.team_a_difficulty,
    }));

    console.log(`Processed ${processedFixtures.length} upcoming fixtures for GW${currentGameweek}.`);
    res.json({ gameweek: currentGameweek, fixtures: processedFixtures });

  } catch (error) {
    console.error('Error fetching upcoming fixtures:', error.message, error.stack);
    if (error.isAxiosError && error.response) {
      console.error('FPL API Response Status:', error.response.status);
    }
    res.status(502).json({ message: 'Failed to fetch upcoming fixture data from FPL API.' });
  }
};

// @desc    Get general FPL bootstrap-static data
// @route   GET /api/fpl/bootstrap-static
// @access  Public
const getBootstrapStaticData = async (req, res) => {
  const fplBootstrapUrl = 'https://fantasy.premierleague.com/api/bootstrap-static/';
  console.log('API Call: Attempting to fetch bootstrap-static data from FPL API...');
  try {
    const response = await axios.get(fplBootstrapUrl, getFplApiConfig());
    console.log('Successfully fetched bootstrap-static data.');
    res.json(response.data); // Send the whole bootstrap data
  } catch (error) {
    console.error('Error fetching bootstrap-static data:', error.message);
    if (error.isAxiosError && error.response) {
      console.error('FPL API Response Status:', error.response.status);
    }
    res.status(502).json({ message: 'Failed to fetch general FPL data.' });
  }
};


// --- Node.js News Aggregator ---
const newsFeedCache = { items: [], lastFetched: null, cacheDurationMs: 30 * 60 * 1000 };
const feedSources = [
    { name: "BBC Sport - Football", url: "https://feeds.bbci.co.uk/sport/football/rss.xml" },
    { name: "Football News Views - PL", url: "https://www.football-news-views.co.uk/premier-league-rss.xml" },
    { name: "Football News Views - Spurs", url: "https://www.football-news-views.co.uk/tottenham-hotspurrss.xml" },
];
const getAggregatedNews = async (req, res) => {
    console.log('API Call: Attempting to fetch aggregated news...');
    if (newsFeedCache.lastFetched && (new Date() - newsFeedCache.lastFetched < newsFeedCache.cacheDurationMs)) {
        console.log('Serving news from cache.');
        return res.json(newsFeedCache.items);
    }
    console.log('Cache stale or empty. Fetching fresh news...');
    let allItems = [];
    for (const source of feedSources) {
        try {
            console.log(`Fetching news from: ${source.name} (${source.url})`);
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
        } catch (error) {
            console.error(`Error fetching or parsing feed from ${source.name} (${source.url}):`, error.message);
        }
    }
    allItems.sort((a, b) => {
        if (a.publication_date && b.publication_date) {
            return new Date(b.publication_date) - new Date(a.publication_date);
        }
        if (a.publication_date) return -1;
        if (b.publication_date) return 1;
        return 0;
    });
    const uniqueLinks = new Set();
    const deduplicatedItems = allItems.filter(item => {
        if (!item.link || uniqueLinks.has(item.link)) return false;
        uniqueLinks.add(item.link);
        return true;
    });
    newsFeedCache.items = deduplicatedItems;
    newsFeedCache.lastFetched = new Date();
    console.log(`Fetched and cached ${deduplicatedItems.length} news items.`);
    res.json(deduplicatedItems);
};

module.exports = {
  getFplManagerHistory,
  getCurrentGameweekNumber,
  getPreviousGameweekFixtures,
  getUpcomingFixtures,
  getAggregatedNews,
  getBootstrapStaticData, // Export the new function
};
