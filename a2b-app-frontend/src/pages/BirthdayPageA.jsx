// src/pages/BirthdayPageA.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; // Using the custom hook

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
// import CardContent from '@mui/material/CardContent'; // No longer needed
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography'; // Still needed for loading/error
import CircularProgress from '@mui/material/CircularProgress';
import { keyframes } from '@mui/system';

// A simple animation for fun (can be kept or removed)
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

  // If user is not "A" (or not logged in), redirect to dashboard.
  if (!user || !user.isSpecialUserA) {
    console.warn("BirthdayPageA: User is not authorized or not User A. Redirecting.");
    return <Navigate to="/dashboard" replace />;
  }

  // Corrected path relative to the public folder
  const imageUrl = "/icons/strength.svg"; // Updated path

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)', // Adjust based on AppBar/Toolbar height if present in layout
        p: { xs: 2, sm: 3 }, // Responsive padding
      }}
    >
      <Card
        sx={{
          maxWidth: 700, // Increased maxWidth to make the card bigger
          width: '100%', 
          boxShadow: (theme) => theme.shadows[8],
          borderRadius: 0, // Set borderRadius to 0 for sharp edges
          animation: `${celebratoryPop} 0.8s ease-out`,
          overflow: 'hidden', // Ensures CardMedia respects border radius (though now it's 0)
        }}
      >
        <CardMedia
          component="img"
          image={imageUrl} 
          alt="A Special Image for A!" // Alt text is still important
          sx={{
            width: '100%', // Make image responsive to card width
            height: 'auto', // Let height adjust based on image aspect ratio
            maxHeight: '80vh', // Prevent image from being excessively tall, increased slightly
            objectFit: 'contain', // 'contain' will ensure the whole image is visible
            display: 'block', // Removes extra space below img sometimes
          }}
        />
        {/* CardContent and Typography elements for messages have been removed */}
      </Card>
    </Box>
  );
}

export default BirthdayPageA;
