const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const { verifyToken, authorize } = require('../middleware/authMiddleware');

router.get('/stats', verifyToken, authorize(['admin', 'doctor', 'receptionist']), statsController.getDashboardStats);

module.exports = router;
