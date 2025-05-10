// src/pages/PredictionsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Stack from '@mui/material/Stack';
import { DataGrid } from '@mui/x-data-grid';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';

import { useAuth } from '../context/AuthContext.jsx';
import { getLatestPredictions, getFplBootstrapData } from '../services/apiService';

const positionMap = { 1: 'GK', 2: 'DEF', 3: 'MID', 4: 'FWD' };
let teamMap = new Map();

// Define columns for the DataGrid
const columnsDefinition = [
  {
    field: 'photo',
    headerName: 'Photo',
    width: 70,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <Avatar
        src={`https://resources.premierleague.com/premierleague/photos/players/110x140/p${params.value?.replace('.jpg', '.png')}`}
        alt={params.row.web_name}
        sx={{ width: 40, height: 40 }}
      />
    ),
  },
  { field: 'web_name', headerName: 'Player', width: 150, filterable: true },
  { field: 'teamName', headerName: 'Team', width: 130, filterable: true },
  {
    field: 'element_type',
    headerName: 'Pos',
    width: 70,
    filterable: true,
    valueFormatter: (value) => positionMap[value] || 'N/A',
  },
  {
    field: 'now_cost',
    headerName: 'Price (£M)',
    type: 'number',
    width: 100,
    valueFormatter: (value) => value ? (value / 10).toFixed(1) : 'N/A',
  },
  // Pred. Pts and Pred. Price Change columns are REMOVED from here
  { field: 'form', headerName: 'Form', type: 'number', width: 80, valueFormatter: (value) => value || 'N/A' },
  { field: 'total_points', headerName: 'Total Pts', type: 'number', width: 100 },
  { field: 'minutes', headerName: 'Mins', type: 'number', width: 80 },
  { field: 'goals_scored', headerName: 'Goals', type: 'number', width: 80 },
  { field: 'assists', headerName: 'Assists', type: 'number', width: 80 },
  { field: 'clean_sheets', headerName: 'CS', type: 'number', width: 70 },
  { field: 'bps', headerName: 'BPS', type: 'number', width: 80 },
  { field: 'influence', headerName: 'Influence', type: 'number', width: 100, valueFormatter: (value) => parseFloat(value).toFixed(1) },
  { field: 'creativity', headerName: 'Creativity', type: 'number', width: 100, valueFormatter: (value) => parseFloat(value).toFixed(1) },
  { field: 'threat', headerName: 'Threat', type: 'number', width: 80, valueFormatter: (value) => parseFloat(value).toFixed(1) },
  { field: 'ict_index', headerName: 'ICT Index', type: 'number', width: 100, valueFormatter: (value) => parseFloat(value).toFixed(1) },
  { field: 'ep_next', headerName: 'EP Next', type: 'number', width: 90, valueFormatter: (value) => value ? parseFloat(value).toFixed(1) : 'N/A' },
  { field: 'selected_by_percent', headerName: 'Selected %', type: 'number', width: 110, valueFormatter: (value) => value ? `${parseFloat(value).toFixed(1)}%` : 'N/A' },
  { field: 'news', headerName: 'News', width: 150, sortable: false, valueFormatter: (value) => value || '' },
  // Ensure 'id' field is present in your data objects for DataGrid row identification
];

function PredictionsPage() {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [allPlayersData, setAllPlayersData] = useState([]);
  const [filteredPlayersData, setFilteredPlayersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { token } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("Not authenticated. Please log in.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const [bootstrapResponse, predictionsResponse] = await Promise.all([
          getFplBootstrapData(),
          getLatestPredictions(token)
        ]);

        if (!bootstrapResponse || !bootstrapResponse.elements || !bootstrapResponse.teams) {
            throw new Error("Failed to load essential FPL bootstrap data (elements or teams missing).");
        }
        if (!predictionsResponse || !Array.isArray(predictionsResponse)) {
            throw new Error("Failed to load player predictions or data is not an array.");
        }
        
        bootstrapResponse.teams.forEach(team => {
            teamMap.set(team.id, team.name); 
        });

        const predictionsMap = new Map();
        predictionsResponse.forEach(pred => {
          const playerId = pred.id || pred.player_id || pred.element; 
          if (playerId !== undefined) {
            predictionsMap.set(playerId, {
              predictedPointsNextGW: pred.predicted_points,
              predictedPriceChange: pred.predicted_price_change,
            });
          }
        });

        const mergedData = bootstrapResponse.elements.map(player => {
          const playerPredictions = predictionsMap.get(player.id) || {};
          return {
            ...player, 
            teamName: teamMap.get(player.team) || 'Unknown',
            predictedPointsNextGW: playerPredictions.predictedPointsNextGW,
            predictedPriceChange: playerPredictions.predictedPriceChange,
          };
        });

        setAllPlayersData(mergedData);
        setFilteredPlayersData(mergedData);

      } catch (err) {
        setError(err.message || 'Failed to fetch or process player data.');
        console.error("Predictions Page Data Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredPlayersData(allPlayersData);
      return;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = allPlayersData.filter(player =>
      player.web_name?.toLowerCase().includes(lowerSearchTerm) ||
      player.teamName?.toLowerCase().includes(lowerSearchTerm)
    );
    setFilteredPlayersData(filtered);
  }, [searchTerm, allPlayersData]);

  const handlePlayerSelection = (params) => {
    setSelectedPlayer(params.row);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const memoizedColumns = useMemo(() => columnsDefinition, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }
  if (error) {
    return <Alert severity="error" sx={{m:3}}>{error}</Alert>;
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 1 }}>
        Player Predictions & Stats
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Explore player statistics and our model's predictions for the upcoming gameweek. Click a player for details.
      </Typography>
      
      {/* Prediction Info Boxes - Moved Above the Table */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 180, justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="subtitle1" gutterBottom component="div" sx={{textAlign: 'center', fontWeight:'medium'}}>
              Predicted Points (Next GW)
            </Typography>
            {selectedPlayer ? (
              <Typography variant="h2" component="p" sx={{ textAlign: 'center', color: 'primary.main', fontWeight: 'bold' }}>
                {selectedPlayer.predictedPointsNextGW?.toFixed(1) ?? 'N/A'}
              </Typography>
            ) : ( <Typography variant="h5" sx={{ textAlign: 'center', my: 'auto', color: 'text.secondary' }}> - </Typography> )}
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 180, justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="subtitle1" gutterBottom component="div" sx={{textAlign: 'center', fontWeight:'medium'}}>
              Predicted Price Change (£M)
            </Typography>
            {selectedPlayer ? (
              <Typography variant="h2" component="p" sx={{ 
                  textAlign: 'center', 
                  color: selectedPlayer.predictedPriceChange > 0 ? 'success.main' : selectedPlayer.predictedPriceChange < 0 ? 'error.main' : 'text.primary', 
                  fontWeight: 'bold' 
              }}>
                {selectedPlayer.predictedPriceChange > 0 ? '+' : ''}{selectedPlayer.predictedPriceChange?.toFixed(1) ?? 'N/A'}
              </Typography>
            ) : ( <Typography variant="h5" sx={{ textAlign: 'center', my: 'auto', color: 'text.secondary' }}> - </Typography> )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Selected Player Info Box (Optional, can be integrated differently or removed if redundant) */}
      {selectedPlayer && (
            <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                {selectedPlayer.photo && (
                    <Avatar 
                        src={`https://resources.premierleague.com/premierleague/photos/players/110x140/p${selectedPlayer.photo.replace('.jpg', '.png')}`} 
                        alt={selectedPlayer.web_name} 
                        sx={{width: 60, height: 60 }}
                    />
                )}
                <Box>
                    <Typography variant="h6">{selectedPlayer.web_name}</Typography>
                    <Typography variant="body1">{selectedPlayer.teamName || 'N/A'} - {positionMap[selectedPlayer.element_type] || 'N/A'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Price: £{(selectedPlayer.now_cost / 10)?.toFixed(1) || 'N/A'}M
                    </Typography>
                </Box>
            </Paper>
      )}

      {/* Main Table Area */}
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            label="Search Players (Name, Team)"
            placeholder="E.g., Salah or Liverpool"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: ( <InputAdornment position="start"> <SearchIcon /> </InputAdornment> ),
            }}
          />
        </Box>
        <Box sx={{ height: 'calc(100vh - 450px)', minHeight: 400, width: '100%' }}> {/* Adjusted height */}
          <DataGrid
            rows={filteredPlayersData}
            columns={memoizedColumns}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
            }}
            onRowClick={handlePlayerSelection}
            getRowId={(row) => row.id}
            density="compact"
            sx={{
              '& .MuiDataGrid-root': { border: 'none' },
              '& .MuiDataGrid-columnHeaders': { backgroundColor: (theme) => theme.palette.action.hover, fontWeight: 'bold' },
              '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none' },
              '& .MuiDataGrid-row': { cursor: 'pointer', '&:hover': { backgroundColor: (theme) => theme.palette.action.selected } },
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}

export default PredictionsPage;


