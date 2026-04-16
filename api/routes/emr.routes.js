const express = require('express');
const router = express.Router();
const emrController = require('../controllers/emr.controller');

router.post('/records', emrController.createRecord);
router.get('/patient/:patientId', emrController.getPatientHistory);
router.get('/record/:id', emrController.getRecordDetails);

module.exports = router;
