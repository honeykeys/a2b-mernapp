// src/App.jsx
import React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Routes, Route, Navigate, Link as RouterLink } from 'react-router-dom'; // Added RouterLink for 404
import ProtectedRoute from './components/ProtectedRoute'; // Ensure path is correct
import DashboardLayout from './components/DashboardLayout'; // Ensure path is correct

// Import Page Components
import LoginPage from './pages/LoginPage';         // Existing
import RegisterPage from './pages/RegisterPage';   // Existing (or SignUpPage if renamed)
import PredictionsPage from './pages/PredictionsPage'; // Existing (to be filled with DataGrid)

// Placeholders for new pages that will be rendered within DashboardLayout
import HomePageContent from './pages/HomePageContent'; // For the content of /dashboard
import NewsFeedPage from './pages/NewsFeedPage';
import ManagerInfoPage from './pages/ManagerInfoPage';
// import FeedbackPage from './pages/FeedbackPage'; // Feedback feature was axed, but link might be in URD/layout
import BirthdayPageA from './pages/BirthdayPageA';



// It's good practice to have your AuthProvider and ThemeProvider wrap <App />
// in your main.jsx or index.js file.

function App() {
  return (
    // The main container for the app. Global styles from CssBaseline (in DashboardLayout or main.jsx) apply.
    // No global padding here, let DashboardLayout and individual pages handle their spacing.
    <div className="app-root-container">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} /> {/* Or your SignUpPage component */}

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}> {/* Ensures user is authenticated */}
          <Route element={<DashboardLayout />}> {/* Applies the dashboard layout (AppBar, Drawer) */}
            {/* Default route for authenticated users: redirect to /dashboard */}
            <Route path="/" element={<Navigate replace to="/dashboard" />} />

            {/* Pages to be rendered within the DashboardLayout's <Outlet /> */}
            <Route path="/dashboard" element={<HomePageContent />} />
            <Route path="/predictions" element={<PredictionsPage />} />
            <Route path="/news" element={<NewsFeedPage />} />
            <Route path="/manager-info" element={<ManagerInfoPage />} />
            {/* <Route path="/feedback" element={<FeedbackPage />} /> */} {/* Route for feedback if re-added */}
            <Route path="/birthday-greeting-a" element={<BirthdayPageA />} />

            {/* Add other protected routes that use the dashboard layout here */}
          </Route>
        </Route>

        {/* Catch-all 404 Not Found Route - Placed last */}
        <Route 
          path="*" 
          element={
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <Typography variant="h3" gutterBottom>404 - Page Not Found</Typography>
              <Typography variant="body1">Sorry, the page you are looking for does not exist.</Typography>
              <Button component={RouterLink} to="/" variant="contained" sx={{mt: 2}}>
                Go to Homepage
              </Button>
            </div>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;

