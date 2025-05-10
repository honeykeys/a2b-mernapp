// backend/routes/fplRoutes.js
const express = require('express');
const router = express.Router();

// Import controller functions and authentication middleware
const {
    getFplManagerHistory,
    getCurrentGameweekNumber,
    getPreviousGameweekFixtures,
    getUpcomingFixtures,
    getAggregatedNews,
    getBootstrapStaticData // Import the new bootstrap data function
} = require('../controllers/fplController'); // Adjust path as needed

const { protect } = require('../middleware/authMiddleware'); // Adjust path as needed

// --- FPL Manager Specific Routes ---

// @route   GET /api/fpl/manager/history
// @desc    Get FPL manager data (general info + history) for the authenticated user
// @access  Private (requires authentication)
router.get('/manager/history', protect, getFplManagerHistory);


// --- General FPL Game Data Routes ---

// @route   GET /api/fpl/gameweek/current-number
// @desc    Get the current FPL gameweek number
// @access  Public
router.get('/gameweek/current-number', getCurrentGameweekNumber);

// @route   GET /api/fpl/fixtures/previous-gameweek
// @desc    Get fixtures and results for the previously completed FPL gameweek
// @access  Public
router.get('/fixtures/previous-gameweek', getPreviousGameweekFixtures);

// @route   GET /api/fpl/fixtures/live-gameweek
// @desc    Get fixtures for the current/upcoming FPL gameweek
// @access  Public
router.get('/fixtures/live-gameweek', getUpcomingFixtures);

// @route   GET /api/fpl/bootstrap-static
// @desc    Get general FPL bootstrap data (players, teams, events, etc.)
// @access  Public
router.get('/bootstrap-static', getBootstrapStaticData);


// --- News Aggregator Route (Node.js version) ---
// If your fplRoutes are mounted under /api/fpl in server.js,
// the full path will be /api/fpl/news.

// @route   GET /api/fpl/news
// @desc    Get aggregated news feed from various RSS sources
// @access  Public
router.get('/news', getAggregatedNews);


module.exports = router;

