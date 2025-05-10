// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context and export it
export const AuthContext = createContext(null);

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(null); // User info (ID, username, email, fplTeamId, isSpecialUserA)
  const [loadingAuthState, setLoadingAuthState] = useState(true); // Renamed for clarity

  // Effect to load user info from localStorage on initial mount if token exists
  useEffect(() => {
    const storedUser = localStorage.getItem('authUser');
    const storedToken = localStorage.getItem('authToken');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser)); // This will now include isSpecialUserA if saved
        console.log('AuthContext: User and token loaded from localStorage.');
      } catch (error) {
        console.error("AuthContext: Failed to parse stored user data:", error);
        localStorage.removeItem('authUser');
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
      }
    }
    setLoadingAuthState(false); // Finished initial load check
  }, []); // Empty dependency array means run only once on mount

  // Login function: Updates state and localStorage
  const login = (loginData) => {
    // loginData is expected from your authController response:
    // { _id, username, email, fplTeamId, token, isSpecialUserA }

    if (!loginData || !loginData.token) {
        console.error('AuthContext: Invalid or missing token in loginData from backend', loginData);
        // Potentially set an error state for the UI or throw an error
        return;
    }

    const userData = {
        _id: loginData._id,
        username: loginData.username,
        email: loginData.email,
        fplTeamId: loginData.fplTeamId,
        isSpecialUserA: loginData.isSpecialUserA || false, // Store the flag, default to false
    };
    const receivedToken = loginData.token;

    // Check if essential user data is present
    if (!userData._id || !userData.email || !userData.username) {
        console.error('AuthContext: Essential user details (_id, email, username) missing in loginData', loginData);
        return;
    }

    localStorage.setItem('authToken', receivedToken);
    localStorage.setItem('authUser', JSON.stringify(userData)); // Save complete user object
    setToken(receivedToken);
    setUser(userData);
    console.log('AuthContext: User logged in. User data:', userData);
  };

  // Logout function: Clears state and localStorage
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
    console.log('AuthContext: User logged out');
    // Navigation to /login is typically handled by the component calling logout or a ProtectedRoute
  };

  // The value provided to consuming components
  const value = {
    token,
    user, // This user object now contains isSpecialUserA
    isLoggedIn: !!token,
    loadingAuthState,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for easy consumption of the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // The loadingAuthState check is important here.
  // If still loading, context might be null initially.
  // Components should check loadingAuthState before relying on user/token if needed.
  return context;
};
