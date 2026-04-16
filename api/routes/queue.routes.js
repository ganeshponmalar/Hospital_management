const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queue.controller');

router.post('/add', queueController.addToQueue);
router.get('/status', queueController.getQueueStatus);
router.put('/update/:queueId', queueController.updateStatus);

module.exports = router;
