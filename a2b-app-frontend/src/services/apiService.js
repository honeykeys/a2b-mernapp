// src/services/apiService.js
import axios from 'axios';

const MERN_API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const NEWS_SERVICE_BASE_URL = import.meta.env.VITE_NEWS_API_URL || 'http://localhost:3030/api';

const API = axios.create({
  baseURL: MERN_API_BASE_URL,
});

// --- Authentication Calls ---
export const registerUser = async (userData) => { /* ... as before ... */ 
  try {
    const res = await API.post('/auth/register', userData);
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Registration failed';
    console.error('Registration API Error:', message, error.response);
    throw new Error(message);
  }
};
export const loginUser = async (credentials) => { /* ... as before ... */ 
  try {
    const res = await API.post('/auth/login', credentials);
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Login failed';
    console.error('Login API Error:', message, error.response);
    throw new Error(message);
  }
};

// --- Prediction Calls ---
export const getLatestPredictions = async (token) => { /* ... as before ... */ 
  if (!token) {
    console.error('getLatestPredictions: No token provided.');
    throw new Error('Authentication token not found. Please log in.');
  }
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    const res = await API.get('/predictions/latest', config);
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch predictions';
    console.error('Get Predictions API Error:', message, error.response);
    if (error.response?.status === 401) {
         throw new Error('Unauthorized: Invalid or expired token. Please log in again.');
    }
    throw new Error(message);
  }
};

// --- News Feed Calls ---
export const getNewsFeed = async () => { /* ... as before ... */ 
  try {
    const res = await API.get('/fpl/news'); 
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || 
                    error.response?.data?.error ||   
                    error.message ||
                    'Failed to fetch news feed';
    console.error('Get News Feed API Error:', message, error.response);
    if (error.code === 'ECONNREFUSED') { 
        throw new Error('Main backend service is unavailable. Please ensure it is running.');
    }
    throw new Error(message);
  }
};

// --- FPL Data Calls ---
export const getFplManagerHistory = async (token) => { /* ... as before ... */ 
  if (!token) {
    console.error('getFplManagerHistory: No token provided.');
    throw new Error('Authentication token not found. Please log in.');
  }
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    const res = await API.get('/fpl/manager/history', config);
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch FPL manager data.';
    console.error('Get FPL Manager History API Error:', message, error.response);
    if (error.response?.status === 401) {
         throw new Error('Unauthorized: Invalid or expired token. Please log in again.');
    }
    if (error.response?.status === 400 && message.includes("FPL Team ID not set")) {
        throw new Error(message);
    }
    throw new Error(message);
  }
};
export const getCurrentGameweekNumber = async () => { /* ... as before ... */ 
  try {
    const res = await API.get('/fpl/gameweek/current-number');
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch current gameweek number.';
    console.error('Get Current Gameweek API Error:', message, error.response);
    throw new Error(message);
  }
};
export const getPreviousGameweekFixtures = async () => { /* ... as before ... */ 
  try {
    const res = await API.get('/fpl/fixtures/previous-gameweek');
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch previous gameweek fixtures.';
    console.error('Get Previous GW Fixtures API Error:', message, error.response);
    throw new Error(message);
  }
};
export const getUpcomingFixtures = async () => { /* ... as before ... */ 
  try {
    const res = await API.get('/fpl/fixtures/live-gameweek');
    return res.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch upcoming fixtures.';
    console.error('Get Upcoming Fixtures API Error:', message, error.response);
    throw new Error(message);
  }
};

/**
 * Fetches general FPL bootstrap data (players, teams, events). Public endpoint.
 * @returns {Promise<object>} - Full bootstrap-static object on success
 * @throws {Error} - Throws error with backend message on failure
 */
export const getFplBootstrapData = async () => {
  try {
    const res = await API.get('/fpl/bootstrap-static');
    return res.data; // Contains { elements: [], teams: [], events: [], ... }
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch FPL bootstrap data.';
    console.error('Get FPL Bootstrap Data API Error:', message, error.response);
    throw new Error(message);
  }
};

