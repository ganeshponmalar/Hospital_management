const express = require('express');
const router = express.Router();
const labController = require('../controllers/lab.controller');
const { verifyToken, authorize } = require('../middleware/authMiddleware');

router.post('/lab', verifyToken, authorize(['admin', 'doctor', 'receptionist']), labController.uploadReport);
router.get('/lab/patient/:patientId', verifyToken, labController.getReportsByPatient);

module.exports = router;
