// backend/routes/predictionRoutes.js
const express = require('express');
const { getLatestPredictions } = require('../controllers/predictionController');
const { protect } = require('../middleware/authMiddleware'); // Import the protection middleware

const router = express.Router();

// Define Route
// GET /api/predictions/latest
// This route is protected by the 'protect' middleware first
router.get('/latest', protect, getLatestPredictions);

module.exports = router;