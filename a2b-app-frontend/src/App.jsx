import React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Routes, Route, Navigate, Link as RouterLink } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import LoginPage from './pages/LoginPage';     
import RegisterPage from './pages/RegisterPage';
import PredictionsPage from './pages/PredictionsPage';
import HomePageContent from './pages/HomePageContent';
import NewsFeedPage from './pages/NewsFeedPage';
import ManagerInfoPage from './pages/ManagerInfoPage';
import BirthdayPageA from './pages/BirthdayPageA';

function App() {
  return (
    <div className="app-root-container">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate replace to="/dashboard" />} />
            <Route path="/dashboard" element={<HomePageContent />} />
            <Route path="/predictions" element={<PredictionsPage />} />
            <Route path="/news" element={<NewsFeedPage />} />
            <Route path="/manager-info" element={<ManagerInfoPage />} />
            <Route path="/birthday-greeting-a" element={<BirthdayPageA />} />
          </Route>
        </Route>
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

