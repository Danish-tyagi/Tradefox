const express = require('express');
const { addFunds, withdrawFunds } = require('../controllers/fundController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/add', protect, addFunds);
router.post('/withdraw', protect, withdrawFunds);

module.exports = router;
