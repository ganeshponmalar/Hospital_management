const express = require('express');
const router = express.Router();
const wardController = require('../controllers/ward.controller');
const { verifyToken, authorize } = require('../middleware/authMiddleware');

// Ward Routes
router.post('/wards', verifyToken, authorize(['admin']), wardController.createWard);
router.get('/wards', verifyToken, wardController.getAllWards);

// Bed Routes
router.post('/beds', verifyToken, authorize(['admin']), wardController.createBed);
router.get('/beds/available', verifyToken, wardController.getAvailableBeds);
router.get('/dashboard/beds', verifyToken, wardController.getBedStats);

module.exports = router;
