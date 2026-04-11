const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const { verifyToken, authorize } = require('../middleware/authMiddleware');

router.get('/doctors', verifyToken, doctorController.getAllDoctors);
router.get('/doctors/:id', verifyToken, doctorController.getDoctorById);
router.post('/doctors', verifyToken, authorize(['admin', 'doctor']), doctorController.createDoctor);
router.put('/doctors/:id', verifyToken, authorize(['admin', 'doctor']), doctorController.updateDoctor);
router.delete('/doctors/:id', verifyToken, authorize(['admin']), doctorController.deleteDoctor);

module.exports = router;
