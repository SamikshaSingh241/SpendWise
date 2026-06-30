const express = require('express');
const router = express.Router();
const { getDistribution, getPersonalityInsight, getTrends, getSuggestions, getPrediction } = require('../controllers/analyticsController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/distribution', protect, getDistribution);
router.get('/personality', protect, getPersonalityInsight);
router.get('/trends', protect, getTrends);
router.get('/suggestions', protect, getSuggestions);
router.get('/prediction', protect, getPrediction);

module.exports = router;
