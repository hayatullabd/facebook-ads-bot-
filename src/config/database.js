const mongoose = require('mongoose');
const config = require('./env');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri, {
      dbName: config.mongodb.dbName,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 5000,
    });
    
    logger.info(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error(`MongoDB disconnect error: ${error.message}`);
  }
};

module.exports = {
  connectDB,
  disconnectDB
};
