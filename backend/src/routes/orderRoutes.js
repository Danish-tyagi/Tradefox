const express = require('express');
const { placeOrder, getOrderHistory, cancelOrder, modifyOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, placeOrder);
router.get('/history', protect, getOrderHistory);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/modify', protect, modifyOrder);

module.exports = router;
