const express = require('express');
const router = express.Router();
const admissionController = require('../controllers/admission.controller');
const { verifyToken, authorize } = require('../middleware/authMiddleware');

// Admission Routes
router.post('/admissions/admit', verifyToken, authorize(['admin', 'doctor', 'nurse', 'receptionist']), admissionController.admitPatient);
router.post('/admissions/discharge', verifyToken, authorize(['admin', 'doctor', 'nurse', 'receptionist']), admissionController.dischargePatient);

// History & Lookup
router.get('/admissions', verifyToken, authorize(['admin', 'doctor', 'nurse', 'receptionist']), admissionController.getAllAdmissions);
router.get('/admissions/:id', verifyToken, admissionController.getAdmissionById);

module.exports = router;
