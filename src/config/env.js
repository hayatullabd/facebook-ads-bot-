require('dotenv').config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  appUrl: process.env.APP_URL,
  
  mongodb: {
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DB_NAME || 'fb_automation'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRE || '24h'
  },
  
  facebook: {
    appId: process.env.FACEBOOK_APP_ID,
    appSecret: process.env.FACEBOOK_APP_SECRET,
    businessAccountId: process.env.FACEBOOK_BUSINESS_ACCOUNT_ID,
    systemUserToken: process.env.FACEBOOK_SYSTEM_USER_TOKEN,
    apiVersion: process.env.FACEBOOK_API_VERSION || 'v18.0'
  },
  
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    webhookPath: process.env.TELEGRAM_WEBHOOK_PATH || '/api/webhook/telegram',
    webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET
  },
  
  adminEmail: process.env.ADMIN_EMAIL,
  logLevel: process.env.LOG_LEVEL || 'info'
};
