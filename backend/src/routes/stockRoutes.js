const express = require('express');
const { getAllStocks, getStockBySymbol, searchStocks } = require('../controllers/stockController');
const { protect } = require('../middleware/authMiddleware');
const { getMarketStatus } = require('../utils/marketHours');

const router = express.Router();

router.get('/public', getAllStocks);
router.get('/market-status', (req, res) => res.json(getMarketStatus()));
router.get('/', protect, getAllStocks);
router.get('/search', protect, searchStocks);
router.get('/:symbol', protect, getStockBySymbol);

module.exports = router;
