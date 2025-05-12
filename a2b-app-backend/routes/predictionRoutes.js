const express = require('express');
const { getLatestPredictions } = require('../controllers/predictionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/latest', protect, getLatestPredictions);

module.exports = router;