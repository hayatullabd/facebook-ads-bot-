const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logger = {
  info: (message) => {
    console.log(`ℹ️  [${new Date().toISOString()}] ${message}`);
  },
  error: (message) => {
    console.error(`❌ [${new Date().toISOString()}] ${message}`);
  },
  warn: (message) => {
    console.warn(`⚠️  [${new Date().toISOString()}] ${message}`);
  },
  debug: (message) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`🐛 [${new Date().toISOString()}] ${message}`);
    }
  }
};

module.exports = logger;
