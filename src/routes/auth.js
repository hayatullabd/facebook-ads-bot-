const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateEmail } = require('../utils/validators');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', validateEmail, authController.login);
router.post('/verify', authController.verify);
router.get('/refresh', authController.refresh);

router.get('/me', authMiddleware, authController.getMe);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
