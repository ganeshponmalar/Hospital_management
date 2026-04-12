const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacy.controller');
const { verifyToken, authorize } = require('../middleware/authMiddleware');

const ROLES = ['admin', 'doctor', 'receptionist']; // Allowed roles for accessing pharmacy

// Dashboard Routes
router.get('/pharmacy/dashboard', verifyToken, authorize(ROLES), pharmacyController.getDashboardStats);
router.get('/pharmacy/alerts', verifyToken, authorize(ROLES), pharmacyController.getAlerts);

// Medicines
router.get('/pharmacy/medicines', verifyToken, authorize(ROLES), pharmacyController.getAllMedicines);
router.post('/pharmacy/medicines', verifyToken, authorize(ROLES), pharmacyController.addMedicine);
router.get('/pharmacy/medicines/:id/batches', verifyToken, authorize(ROLES), pharmacyController.getBatchesByMedicine);

// Suppliers
router.get('/pharmacy/suppliers', verifyToken, authorize(ROLES), pharmacyController.getAllSuppliers);
router.post('/pharmacy/suppliers', verifyToken, authorize(ROLES), pharmacyController.addSupplier);

// Purchases (Restocking)
router.get('/pharmacy/purchases', verifyToken, authorize(ROLES), pharmacyController.getAllPurchases);
router.post('/pharmacy/purchases', verifyToken, authorize(ROLES), pharmacyController.addPurchase);

// Sales (Billing)
router.get('/pharmacy/sales', verifyToken, authorize(ROLES), pharmacyController.getAllSales);
router.post('/pharmacy/sales', verifyToken, authorize(ROLES), pharmacyController.addSale);

// Stock History Audit
router.get('/pharmacy/stock-history', verifyToken, authorize(ROLES), pharmacyController.getStockHistory);

module.exports = router;
