const express = require('express');
const { getHoldings, getSummary } = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/holdings', protect, getHoldings);
router.get('/summary', protect, getSummary);

module.exports = router;
