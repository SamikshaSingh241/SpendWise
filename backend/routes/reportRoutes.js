const express = require('express');
const router = express.Router();
const { generateCsvReport, generatePdfReport } = require('../controllers/reportController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/csv', protect, generateCsvReport);
router.get('/pdf', protect, generatePdfReport);

module.exports = router;
