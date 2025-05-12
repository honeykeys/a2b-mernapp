import React, { useEffect, useState, useContext } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack'; // 
import EventIcon from '@mui/icons-material/Event'; 
import ShieldIcon from '@mui/icons-material/Shield'; 
import { useAuth } from '../context/AuthContext.jsx';
import {
    getFplManagerHistory,
    getCurrentGameweekNumber,
    getPreviousGameweekFixtures,
    getUpcomingFixtures,
    getNewsFeed
} from '../services/apiService'; 

const ManagerNameIdWidget = ({ name, id, isLoading }) => (
  <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 140, textAlign: 'center' }}>
    <Typography component="h2" variant="subtitle1" color="text.secondary" gutterBottom>
      Manager
    </Typography>
    {isLoading ? <CircularProgress size={30} /> : (
      <>
        <Typography component="p" variant="h5" sx={{wordBreak: 'break-word'}}>
          {name || 'N/A'}
        </Typography>
        <Typography color="text.secondary" sx={{ flex: 1, fontSize: '0.8rem' }}>
          ID: {id || 'N/A'}
        </Typography>
      </>
    )}
  </Paper>
);

const OverallPointsWidget = ({ points, isLoading }) => (
  <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 140, textAlign: 'center' }}>
    <Typography component="h2" variant="subtitle1" color="text.secondary" gutterBottom>
      Overall Points
    </Typography>
    {isLoading ? <CircularProgress size={30} /> : (
      <Typography component="p" variant="h4" color="primary">
        {points !== null && points !== undefined ? points.toLocaleString() : 'N/A'}
      </Typography>
    )}
  </Paper>
);

const OverallRankWidget = ({ rank, isLoading }) => (
  <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 140, textAlign: 'center' }}>
    <Typography component="h2" variant="subtitle1" color="text.secondary" gutterBottom>
      Overall Rank
    </Typography>
    {isLoading ? <CircularProgress size={30} /> : (
      <Typography component="p" variant="h4" color="primary">
        {rank !== null && rank !== undefined ? rank.toLocaleString() : 'N/A'}
      </Typography>
    )}
  </Paper>
);

const CurrentGameweekInfoWidget = ({ gameweek, points, rank, isLoading }) => (
 <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 140, textAlign: 'center' }}>
    <Typography component="h2" variant="subtitle1" color="text.secondary" gutterBottom>
      Current GW {isLoading && !gameweek ? '' : (gameweek || '')}
    </Typography>
    {isLoading ? <CircularProgress size={30} /> : (
      <>
        <Typography component="p" variant="h5">
          {points !== null && points !== undefined ? `${points} pts` : 'N/A'}
        </Typography>
        <Typography color="text.secondary" sx={{ flex: 1, fontSize: '0.8rem' }}>
          GW Rank: {rank ? rank.toLocaleString() : 'N/A'}
        </Typography>
      </>
    )}
  </Paper>
);
const PastFixturesWidget = ({ fixtures, gameweek, isLoading, error }) => (
  <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
    <Typography variant="h6" gutterBottom>Results GW{gameweek || ''}</Typography>
    {isLoading && <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1}}><CircularProgress /></Box>}
    {error && <Alert severity="error">{error}</Alert>}
    {!isLoading && !error && fixtures && fixtures.length > 0 ? (
      <Box sx={{maxHeight: 240, overflowY: 'auto', pr: 1}}>
        {fixtures.map(fixture => (
          <Box key={fixture.fixture_id || fixture.id} sx={{ mb: 1, pb: 1, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {fixture.home_team_name} 
              <Typography component="span" variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main', mx: 0.5 }}>
                {fixture.home_team_score}
              </Typography>
              - 
              <Typography component="span" variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main', mx: 0.5 }}>
                {fixture.away_team_score}
              </Typography>
              {fixture.away_team_name}
            </Typography>
            {fixture.kickoff_time && (
              <Typography variant="caption" color="text.secondary" sx={{display: 'flex', alignItems: 'center'}}>
                <EventIcon fontSize="inherit" sx={{mr: 0.5}} /> {new Date(fixture.kickoff_time).toLocaleString([], {dateStyle: 'short', timeStyle: 'short'})}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    ) : !isLoading && !error && <Typography variant="body2">No past results to display.</Typography>}
  </Paper>
);

const UpcomingFixturesWidget = ({ fixtures, gameweek, isLoading, error }) => (
  <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
    <Typography variant="h6" gutterBottom>Fixtures GW{gameweek || ''}</Typography>
    {isLoading && <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1}}><CircularProgress /></Box>}
    {error && <Alert severity="error">{error}</Alert>}
    {!isLoading && !error && fixtures && fixtures.length > 0 ? (
       <Box sx={{maxHeight: 240, overflowY: 'auto', pr: 1}}>
        {fixtures.map(fixture => (
          <Box key={fixture.id} sx={{ mb: 1, pb: 1, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {fixture.home_team_name} vs {fixture.away_team_name}
            </Typography>
            {fixture.kickoff_time && (
              <Typography variant="caption" color="text.secondary" sx={{display: 'flex', alignItems: 'center', mb: 0.5}}>
                <EventIcon fontSize="inherit" sx={{mr: 0.5}} /> {new Date(fixture.kickoff_time).toLocaleString([], {weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
              </Typography>
            )}
            <Stack direction="row" spacing={1} alignItems="center">
                <ShieldIcon fontSize="inherit" sx={{color: `difficulty.${fixture.team_h_difficulty}`}} /> 
                <Typography variant="caption">H: {fixture.team_h_difficulty}</Typography>
                <ShieldIcon fontSize="inherit" sx={{color: `difficulty.${fixture.team_a_difficulty}`}} /> 
                <Typography variant="caption">A: {fixture.team_a_difficulty}</Typography>
            </Stack>
          </Box>
        ))}
      </Box>
    ) : !isLoading && !error && <Typography variant="body2">No upcoming games to display.</Typography>}
  </Paper>
);

const NewsFeedWidget = ({ newsItems, isLoading, error }) => (
  <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', minHeight: 400, maxHeight: 500 }}>
    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
      Latest Football News
    </Typography>
    {isLoading && (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
        <CircularProgress />
      </Box>
    )}
    {error && <Alert severity="error">{error}</Alert>}
    {!isLoading && !error && newsItems && newsItems.length > 0 ? (
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {newsItems.slice(0, 15).map((item, index) => (
          <React.Fragment key={item.link || index}>
            <Box sx={{ mb: 2, pb: 2 }}>
              <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                <Link href={item.link} target="_blank" rel="noopener noreferrer" underline="hover" color="text.primary">
                  {item.title}
                </Link>
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                {item.source_name} - {item.publication_date ? new Date(item.publication_date).toLocaleDateString() : 'Date N/A'}
              </Typography>
              {item.snippet && (
                <Typography variant="body2" color="text.secondary" sx={{
                    maxHeight: '3.6em', 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2, 
                    WebkitBoxOrient: 'vertical',
                }}>
                  {item.snippet}
                </Typography>
              )}
            </Box>
            {index < newsItems.slice(0, 15).length - 1 && <Divider sx={{ mb: 2 }} />}
          </React.Fragment>
        ))}
      </Box>
    ) : !isLoading && !error && (
      <Typography variant="body2" sx={{ textAlign: 'center', mt: 3 }}>
        No news items currently available.
      </Typography>
    )}
  </Paper>
);


function HomePageContent() {
  const { user, token } = useAuth();

  const [managerInfo, setManagerInfo] = useState({ name: '', id: null, overallPoints: null, overallRank: null });
  const [currentGwPerformance, setCurrentGwPerformance] = useState({ gameweek: null, points: null, rank: null });
  const [loadingManagerData, setLoadingManagerData] = useState(true);
  const [managerDataError, setManagerDataError] = useState('');

  const [pastFixtures, setPastFixtures] = useState({ gameweek: null, fixtures: [], isLoading: true, error: '' });
  const [upcomingFixtures, setUpcomingFixtures] = useState({ gameweek: null, fixtures: [], isLoading: true, error: '' });
  
  const [newsItems, setNewsItems] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [newsError, setNewsError] = useState('');
  useEffect(() => {
    if (token && user?.fplTeamId) {
      setLoadingManagerData(true);
      setManagerDataError('');
      getFplManagerHistory(token)
        .then(response => {
          const data = response.data;
          if (data && data.entry && data.history) {
            setManagerInfo({
              name: data.entry.name || user.username,
              id: data.entry.id,
              overallPoints: data.entry.summary_overall_points,
              overallRank: data.entry.summary_overall_rank,
            });
            const currentSeasonHistory = data.history.current;
            if (currentSeasonHistory && currentSeasonHistory.length > 0) {
              const latestGwEntry = currentSeasonHistory[currentSeasonHistory.length - 1];
              setCurrentGwPerformance({
                gameweek: latestGwEntry.event,
                points: latestGwEntry.points,
                rank: latestGwEntry.rank,
              });
            }
          } else {
            throw new Error("Manager data structure from API is not as expected.");
          }
        })
        .catch(err => {
          console.error("Failed to fetch manager data:", err);
          setManagerDataError(err.message || "Could not load manager data.");
        })
        .finally(() => setLoadingManagerData(false));
    } else if (token && !user?.fplTeamId) {
        setManagerDataError("FPL Team ID not set. Please update in your profile.");
        setLoadingManagerData(false);
    } else {
        setLoadingManagerData(false);
    }
  }, [token, user]);

  const [currentSystemGameweek, setCurrentSystemGameweek] = useState(null);
  useEffect(() => {
    getCurrentGameweekNumber()
        .then(data => setCurrentSystemGameweek(data.currentGameweek))
        .catch(err => console.error("Failed to fetch current system GW:", err));
  }, []);

  useEffect(() => {
    setPastFixtures(prev => ({ ...prev, isLoading: true, error: '' }));
    getPreviousGameweekFixtures()
        .then(data => {
            setPastFixtures({ gameweek: data.gameweek, fixtures: data.fixtures, isLoading: false, error: '' });
        })
        .catch(err => {
            console.error("Failed to fetch past fixtures:", err);
            setPastFixtures({ gameweek: null, fixtures: [], isLoading: false, error: err.message || "Could not load past fixtures." });
        });
  }, []);

  useEffect(() => {
    if (currentSystemGameweek) {
        setUpcomingFixtures(prev => ({ ...prev, isLoading: true, error: '' }));
        getUpcomingFixtures()
            .then(data => {
                setUpcomingFixtures({ gameweek: data.gameweek, fixtures: data.fixtures, isLoading: false, error: '' });
            })
            .catch(err => {
                console.error("Failed to fetch upcoming fixtures:", err);
                setUpcomingFixtures({ gameweek: currentSystemGameweek, fixtures: [], isLoading: false, error: err.message || "Could not load upcoming fixtures." });
            });
    }
  }, [currentSystemGameweek]);

  useEffect(() => {
    setLoadingNews(true);
    setNewsError('');
    getNewsFeed()
      .then(data => {
        setNewsItems(data);
      })
      .catch(err => {
        console.error("Failed to fetch news:", err);
        setNewsError(err.message || "Could not load news feed.");
      })
      .finally(() => setLoadingNews(false));
  }, []);


  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        FPL Predictions + Machine Learning
      </Typography>

      {managerDataError && <Alert severity="warning" sx={{mb:2}}>{managerDataError}</Alert>}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <ManagerNameIdWidget name={managerInfo.name} id={managerInfo.id} isLoading={loadingManagerData} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <OverallPointsWidget points={managerInfo.overallPoints} isLoading={loadingManagerData} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <OverallRankWidget rank={managerInfo.overallRank} isLoading={loadingManagerData} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <CurrentGameweekInfoWidget 
            gameweek={currentGwPerformance.gameweek} 
            points={currentGwPerformance.points}
            rank={currentGwPerformance.rank}
            isLoading={loadingManagerData}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <PastFixturesWidget 
            fixtures={pastFixtures.fixtures} 
            gameweek={pastFixtures.gameweek} 
            isLoading={pastFixtures.isLoading}
            error={pastFixtures.error}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <UpcomingFixturesWidget 
            fixtures={upcomingFixtures.fixtures} 
            gameweek={upcomingFixtures.gameweek}
            isLoading={upcomingFixtures.isLoading}
            error={upcomingFixtures.error}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <NewsFeedWidget newsItems={newsItems} isLoading={loadingNews} error={newsError}/>
        </Grid>
      </Grid>
    </Box>
  );
}

export default HomePageContent;

