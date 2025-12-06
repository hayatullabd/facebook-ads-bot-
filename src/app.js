const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDB } = require('./config/database');
const config = require('./config/env');
const logger = require('./utils/logger');

const authRoutes = require('./routes/auth');
const insightsRoutes = require('./routes/insights');
const webhookRoutes = require('./routes/webhook');

const { syncJob } = require('./jobs/syncFacebookJob');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/webhook', webhookRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

if (config.nodeEnv === 'production') {
  syncJob;
  logger.info('📅 Sync job scheduled');
}

module.exports = app;
