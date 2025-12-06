const BotUser = require('../models/BotUser');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const logger = require('../utils/logger');
const crypto = require('crypto');

exports.login = async (req, res) => {
  try {
    const { email } = req.body;
    
    let user = await BotUser.findOne({ email });
    
    if (!user) {
      user = new BotUser({
        email,
        isVerified: false,
        verificationToken: crypto.randomBytes(32).toString('hex')
      });
      await user.save();
    } else {
      user.verificationToken = crypto.randomBytes(32).toString('hex');
      await user.save();
    }
    
    const verificationUrl = `${config.appUrl}/auth/verify?token=${user.verificationToken}`;
    
    logger.info(`Login request for email: ${email}`);
    
    res.json({
      success: true,
      message: 'Verification link sent',
      verificationUrl
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verify = async (req, res) => {
  try {
    const { token } = req.body;
    
    const user = await BotUser.findOne({
      verificationToken: token,
      isVerified: false
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    
    user.isVerified = true;
    user.verificationToken = null;
    user.lastActive = new Date();
    await user.save();
    
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    logger.info(`User verified: ${user.email}`);
    
    res.json({
      success: true,
      token: accessToken,
      user: {
        id: user._id,
        email: user.email,
        telegramUserId: user.telegramUserId
      }
    });
  } catch (error) {
    logger.error(`Verify error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token' });
    }
    
    const decoded = jwt.verify(token, config.jwt.secret, { ignoreExpiration: true });
    const user = await BotUser.findById(decoded.userId);
    
    if (!user || !user.isVerified) {
      return res.status(401).json({ success: false, message: 'Invalid user' });
    }
    
    const newToken = jwt.sign(
      { userId: user._id, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    res.json({ success: true, token: newToken });
  } catch (error) {
    logger.error(`Refresh error: ${error.message}`);
    res.status(401).json({ success: false, message: 'Token refresh failed' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await BotUser.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        telegramUserId: user.telegramUserId,
        isVerified: user.isVerified,
        alertFrequency: user.alertFrequency
      }
    });
  } catch (error) {
    logger.error(`Get me error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
