import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { keyframes } from '@mui/system';


const celebratoryPop = keyframes`
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;

function BirthdayPageA() {
  const { user, loadingAuthState } = useAuth();

  if (loadingAuthState) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !user.isSpecialUserA) {
    console.warn("BirthdayPageA: User is not authorized or not User A. Redirecting.");
    return <Navigate to="/dashboard" replace />;
  }

  const imageUrl = "/icons/strength.svg";

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)',
        p: { xs: 2, sm: 3 }, 
      }}
    >
      <Card
        sx={{
          maxWidth: 700, 
          width: '100%', 
          boxShadow: (theme) => theme.shadows[8],
          borderRadius: 0, 
          animation: `${celebratoryPop} 0.8s ease-out`,
          overflow: 'hidden', 
        }}
      >
        <CardMedia
          component="img"
          image={imageUrl} 
          alt="A Special Image for A!" 
          sx={{
            width: '100%', 
            height: 'auto', 
            maxHeight: '80vh', 
            objectFit: 'contain',
            display: 'block', 
          }}
        />
        {}
      </Card>
    </Box>
  );
}

export default BirthdayPageA;
