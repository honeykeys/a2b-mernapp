const express = require('express');
const router = express.Router();
const {
    getFplManagerHistory,
    getCurrentGameweekNumber,
    getPreviousGameweekFixtures,
    getUpcomingFixtures,
    getAggregatedNews,
    getBootstrapStaticData
} = require('../controllers/fplController');
const { protect } = require('../middleware/authMiddleware'); 

router.get('/manager/history', protect, getFplManagerHistory);
router.get('/gameweek/current-number', getCurrentGameweekNumber);
router.get('/fixtures/previous-gameweek', getPreviousGameweekFixtures);
router.get('/fixtures/live-gameweek', getUpcomingFixtures);
router.get('/bootstrap-static', getBootstrapStaticData);
router.get('/news', getAggregatedNews);


module.exports = router;

