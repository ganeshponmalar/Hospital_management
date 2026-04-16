const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');

router.post('/create', scheduleController.createSchedule);
router.get('/availability', scheduleController.getAvailability);
router.post('/book/:slotId', scheduleController.bookSlot);

module.exports = router;
