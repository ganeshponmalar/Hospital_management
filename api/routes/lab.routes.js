const express = require('express');
const router = express.Router();
const labController = require('../controllers/lab.controller');
const { verifyToken, authorize } = require('../middleware/authMiddleware');

const ROLES = ['admin', 'doctor', 'receptionist'];

// TESTS
router.get('/tests', labController.getAllTests);
router.post('/tests', labController.addTest);

// ORDERS
router.get('/orders', labController.getAllOrders);
router.post('/orders', labController.createOrder);

// Technician Result Recording
router.post('/order-items/:itemId/results', verifyToken, authorize(ROLES), labController.addTestResult);

// Doctor Verification
router.put('/orders/:id/verify', verifyToken, authorize(['admin', 'doctor']), labController.verifyReport);

// Retaining getOrderDetails for previous React components logic
router.get('/orders/:id', verifyToken, authorize(ROLES), labController.getOrderDetails);

module.exports = router;
