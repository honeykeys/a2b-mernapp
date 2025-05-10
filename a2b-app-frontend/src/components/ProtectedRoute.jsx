// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute() {
  const { token, loadingAuthState } = useAuth(); // Get token and loading status from context
  const location = useLocation(); // Get the current location user tried to access

  // 1. Show loading indicator while auth state is being determined (checking localStorage)
  if (loadingAuthState) {
    // You can replace this with a proper loading spinner component later
    return <div>Loading authentication status...</div>;
  }

  // 2. If loading is finished and user has a token, allow access
  //    <Outlet /> renders the actual child route component (e.g., PredictionsPage)
  if (token) {
    return <Outlet />;
  }

  // 3. If loading is finished and there's no token, redirect to login
  //    We pass the current location in 'state' so the login page can redirect back after success.
  //    'replace' prevents the login page from being added to the history stack.
  return <Navigate to="/login" state={{ from: location }} replace />;
}

export default ProtectedRoute;