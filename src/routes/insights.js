const express = require('express');
const router = express.Router();
const insightsController = require('../controllers/insightsController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/daily-summary', insightsController.dailySummary);
router.get('/campaigns', insightsController.campaigns);
router.get('/campaign/:id', insightsController.campaignDetail);
router.get('/ads', insightsController.ads);
router.get('/ad/:id', insightsController.adDetail);
router.get('/hourly-data', insightsController.hourlyData);

module.exports = router;
