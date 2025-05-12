import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HistoryIcon from '@mui/icons-material/History';
import MemoryIcon from '@mui/icons-material/Memory';
import { useAuth } from '../context/AuthContext.jsx';
import { getFplManagerHistory } from '../services/apiService';

function ManagerInfoPage() {
  const [managerData, setManagerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token, user } = useAuth();

  useEffect(() => {
    const fetchManagerData = async () => {
      if (!token) {
        setError("Not authenticated. Please log in.");
        setLoading(false);
        return;
      }
      if (!user?.fplTeamId) {
        setError("FPL Team ID not set for this user. Please update it in your profile (feature to be added).");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const response = await getFplManagerHistory(token);
        if (response.data) {
          setManagerData(response.data);
        } else if (response.message && response.source === 'cache_api_error') {
          setManagerData(response.data); 
          setError(`Note: ${response.message}`); 
        } else {
          throw new Error(response.message || "Failed to fetch manager data or data is in unexpected format.");
        }
      } catch (err) {
        setError(err.message || 'An unknown error occurred while fetching manager data.');
        console.error("Manager Info Page Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchManagerData();
  }, [token, user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', p: 3 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading manager information...</Typography>
      </Box>
    );
  }

  if (error && !managerData) { 
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      </Box>
    );
  }
  
  const generalInfo = managerData?.entry;
  const historyInfo = managerData?.history;

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <PersonIcon sx={{ mr: 1, fontSize: '2.5rem' }} />
        FPL Manager Profile
      </Typography>

      {error && managerData && <Alert severity="warning" sx={{mb:2}}>{error}</Alert>}


      {!generalInfo && !historyInfo && !loading && (
         <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6">No manager data available.</Typography>
            <Typography variant="body1">Ensure your FPL Team ID is correctly set in your profile.</Typography>
         </Paper>
      )}

      {generalInfo && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <EmojiEventsIcon sx={{ mr: 1 }} color="primary" />
            Manager Overview
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle1">Manager Name:</Typography>
              <Typography variant="body1" fontWeight="bold">{generalInfo.player_first_name} {generalInfo.player_last_name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle1">Team Name:</Typography>
              <Typography variant="body1" fontWeight="bold">{generalInfo.name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle1">FPL ID:</Typography>
              <Typography variant="body1">{generalInfo.id}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle1">Overall Points:</Typography>
              <Typography variant="h6" color="primary">{generalInfo.summary_overall_points?.toLocaleString() || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle1">Overall Rank:</Typography>
              <Typography variant="h6" color="primary">{generalInfo.summary_overall_rank?.toLocaleString() || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle1">Current GW ({generalInfo.current_event}) Points:</Typography>
              <Typography variant="h6">{generalInfo.summary_event_points?.toLocaleString() || 'N/A'}</Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {historyInfo?.past && historyInfo.past.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <HistoryIcon sx={{ mr: 1 }} color="primary" />
            Past Seasons
          </Typography>
          <Divider sx={{ my: 2 }} />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Season</TableCell>
                  <TableCell align="right">Total Points</TableCell>
                  <TableCell align="right">Overall Rank</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historyInfo.past.map((season) => (
                  <TableRow key={season.season_name}>
                    <TableCell component="th" scope="row">{season.season_name}</TableCell>
                    <TableCell align="right">{season.total_points?.toLocaleString()}</TableCell>
                    <TableCell align="right">{season.rank?.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      
      {historyInfo?.chips && historyInfo.chips.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <MemoryIcon sx={{ mr: 1 }} color="primary" />
            Chips Played (Current Season)
          </Typography>
          <Divider sx={{ my: 2 }} />
          <List dense>
            {historyInfo.chips.map((chip) => (
              <ListItem key={chip.name}>
                <ListItemText 
                  primary={chip.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  secondary={`Played in GW ${chip.event} at ${new Date(chip.time).toLocaleDateString()}`} 
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}


      {historyInfo?.current && historyInfo.current.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>Current Season Performance</Typography>
          <Divider sx={{ my: 2 }} />
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>GW</TableCell>
                  <TableCell align="right">Points</TableCell>
                  <TableCell align="right">Rank</TableCell>
                  <TableCell align="right">Overall Pts</TableCell>
                  <TableCell align="right">Overall Rank</TableCell>
                  <TableCell align="right">Value</TableCell>
                  <TableCell align="right">Bank</TableCell>
                  <TableCell align="right">Transfers</TableCell>
                  <TableCell align="right">Cost</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historyInfo.current.map((gw) => (
                  <TableRow hover key={gw.event}>
                    <TableCell>{gw.event}</TableCell>
                    <TableCell align="right">{gw.points}</TableCell>
                    <TableCell align="right">{gw.rank?.toLocaleString()}</TableCell>
                    <TableCell align="right">{gw.total_points?.toLocaleString()}</TableCell>
                    <TableCell align="right">{gw.overall_rank?.toLocaleString()}</TableCell>
                    <TableCell align="right">£{(gw.value / 10).toFixed(1)}</TableCell>
                    <TableCell align="right">£{(gw.bank / 10).toFixed(1)}</TableCell>
                    <TableCell align="right">{gw.event_transfers}</TableCell>
                    <TableCell align="right" sx={{color: gw.event_transfers_cost < 0 ? 'error.main' : 'inherit'}}>
                      {gw.event_transfers_cost}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}

export default ManagerInfoPage;

