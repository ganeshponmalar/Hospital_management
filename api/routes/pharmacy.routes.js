const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacy.controller');
const { verifyToken, authorize } = require('../middleware/authMiddleware');

router.get('/pharmacy', verifyToken, pharmacyController.getAllMedicines);
router.post('/pharmacy', verifyToken, authorize(['admin', 'doctor', 'receptionist']), pharmacyController.addMedicine);
router.put('/pharmacy/:id/stock', verifyToken, authorize(['admin', 'doctor', 'receptionist']), pharmacyController.updateStock);

module.exports = router;
