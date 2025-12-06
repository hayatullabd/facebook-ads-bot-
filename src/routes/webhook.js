const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

router.post('/telegram', webhookController.handleTelegram);
router.get('/telegram', webhookController.verifyTelegram);

module.exports = router;
