import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute() {
  const { token, loadingAuthState } = useAuth();
  const location = useLocation(); 

  if (loadingAuthState) {
    return <div>Loading authentication status...</div>;
  }
  if (token) {
    return <Outlet />;
  }
  return <Navigate to="/login" state={{ from: location }} replace />;
}

export default ProtectedRoute;