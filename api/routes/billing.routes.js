const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');
const { verifyToken, authorize } = require('../middleware/authMiddleware');

router.get('/billing', verifyToken, authorize(['admin', 'doctor', 'receptionist']), billingController.getAllBills);
router.post('/billing', verifyToken, authorize(['admin', 'doctor', 'receptionist']), billingController.createBill);
router.get('/billing/patient/:patientId', verifyToken, billingController.getBillsByPatient);
router.put('/billing/:id/status', verifyToken, authorize(['admin', 'doctor', 'receptionist']), billingController.updateBillStatus);

module.exports = router;
