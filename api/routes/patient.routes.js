const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');

router.get('/patients', patientController.getAllPatients);
router.post('/patients', patientController.createPatient);
router.put('/patients/:id', patientController.updatePatient);
router.delete('/patients/:id', patientController.deletePatient);

module.exports = router;
