import React, { createContext, useState, useContext, useEffect } from 'react';

export const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(null);
  const [loadingAuthState, setLoadingAuthState] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('authUser');
    const storedToken = localStorage.getItem('authToken');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        console.log('AuthContext: User and token loaded from localStorage.');
      } catch (error) {
        console.error("AuthContext: Failed to parse stored user data:", error);
        localStorage.removeItem('authUser');
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
      }
    }
    setLoadingAuthState(false); 
  }, []);

  const login = (loginData) => {
    if (!loginData || !loginData.token) {
        console.error('AuthContext: Invalid or missing token in loginData from backend', loginData);
        return;
    }

    const userData = {
        _id: loginData._id,
        username: loginData.username,
        email: loginData.email,
        fplTeamId: loginData.fplTeamId,
        isSpecialUserA: loginData.isSpecialUserA || false,
    };
    const receivedToken = loginData.token;
    if (!userData._id || !userData.email || !userData.username) {
        console.error('AuthContext: Essential user details (_id, email, username) missing in loginData', loginData);
        return;
    }

    localStorage.setItem('authToken', receivedToken);
    localStorage.setItem('authUser', JSON.stringify(userData));
    setToken(receivedToken);
    setUser(userData);
    console.log('AuthContext: User logged in. User data:', userData);
  };
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
    console.log('AuthContext: User logged out');
  };
  const value = {
    token,
    user,
    isLoggedIn: !!token,
    loadingAuthState,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
