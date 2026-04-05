const express = require('express');
const { getAlerts, createAlert, deleteAlert } = require('../controllers/alertController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getAlerts);
router.post('/', protect, createAlert);
router.delete('/:id', protect, deleteAlert);

module.exports = router;
