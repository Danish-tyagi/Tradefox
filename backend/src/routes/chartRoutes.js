const express = require('express');
const { getCandles } = require('../controllers/chartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.get('/:symbol', protect, getCandles);

module.exports = router;
