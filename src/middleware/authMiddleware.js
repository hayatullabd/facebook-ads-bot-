const jwt = require('jsonwebtoken');
const config = require('../config/env');
const logger = require('../utils/logger');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }
    
    const decoded = jwt.verify(token, config.jwt.secret);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    
    next();
  } catch (error) {
    logger.error(`Auth error: ${error.message}`);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

module.exports = authMiddleware;
