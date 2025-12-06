# 🚀 Facebook Ads Automation SaaS

Complete Node.js + MongoDB Atlas system for multi-client Facebook Ads reporting with Telegram Bot integration.

## Features
- ✅ 60+ Facebook Ad Accounts support
- ✅ Hourly automated data sync
- ✅ Telegram Bot with rich commands
- ✅ Permission-based access control
- ✅ Real-time insights & reports
- ✅ MongoDB Atlas multi-tenant DB
- ✅ PM2 production ready
- ✅ CloudPanel compatible

## Quick Start

### 1. Install Dependencies

### 2. Setup MongoDB Atlas
- Create free cluster at https://www.mongodb.com/cloud/atlas
- Get connection string
- Add to .env

### 3. Create Telegram Bot
- Chat with @BotFather on Telegram
- Use /newbot command
- Copy bot token to .env

### 4. Facebook API Setup
- Go to https://developers.facebook.com
- Create app
- Generate system user token
- Add to .env

### 5. Configure Environment
cp .env.example .env
nano .env

### 6. Start Development
npm run dev

### 7. Deploy to CloudPanel/VPS
npm install -g pm2
pm2 start ecosystem.config.js
pm2 logs fb-automation



## API Endpoints

### Authentication
- `POST /api/auth/login` - Email login
- `POST /api/auth/verify` - Verify token
- `GET /api/auth/me` - Get user info
- `POST /api/auth/logout` - Logout

### Insights
- `GET /api/insights/daily-summary` - Daily metrics
- `GET /api/insights/campaigns` - List campaigns
- `GET /api/insights/campaign/:id` - Campaign details
- `GET /api/insights/ads` - List ads
- `GET /api/insights/ad/:id` - Ad details
- `GET /api/insights/hourly-data` - Hourly data

### Webhook
- `POST /api/webhook/telegram` - Telegram webhook

## Telegram Bot Commands
start - Initialize bot
/my_ads - View your ads
/my_campaigns - View campaigns
/report ID - Get campaign report
/summary_today - Today's summary
/summary_month - Monthly summary
/alert_setup - Setup alerts
/help - Show commands

## Project Structure
facebook-ads-bot/
├── src/
│ ├── config/ - Configuration files
│ ├── models/ - MongoDB models
│ ├── routes/ - API routes
│ ├── controllers/ - Business logic
│ ├── services/ - External services
│ ├── middleware/ - Custom middleware
│ ├── jobs/ - Scheduled tasks
│ ├── utils/ - Helper functions
│ └── app.js - Express setup
├── .env - Environment variables
├── ecosystem.config.js - PM2 config
├── package.json - Dependencies
└── server.js - Entry point


## Database Collections
- clients
- adaccounts
- campaigns
- adsets
- ads
- insightsdailies
- insightshourlies
- botusers
- userpermissions
- alerts

## Environment Variables
See `.env.example` for complete list

## Deployment

### CloudPanel
1. Create Node.js site
2. Upload code via SSH/FTP
3. Run `npm install --production`
4. Create `.env` file
5. Run `pm2 start ecosystem.config.js`
6. Restart from dashboard

### VPS (Any Linux)
1. Install Node.js 18+
2. Clone repository
3. Run setup steps above
4. Use PM2 for process management

## Monitoring
View logs
pm2 logs fb-automation

View status
pm2 status

Restart app
pm2 restart fb-automation

Monitor resources
pm2 monit


## Support
- Check logs: `pm2 logs fb-automation`
- Database issues: Check MongoDB Atlas
- API issues: Test with Postman
- Bot issues: Check Telegram webhook URL

## License
MIT

**Production-ready. Deploy with confidence.** 🚀

# 1. Project folder তৈরি করো
mkdir facebook-ads-bot
cd facebook-ads-bot

# 2. সব files এর folders তৈরি করো
mkdir -p src/{config,models,routes,controllers,services,middleware,jobs,utils}
mkdir logs

# 3. সব code files গুলো paste করো (above দেওয়া code অনুযায়ী)

# 4. npm dependencies install করো
npm install

# 5. .env file তৈরি করো
cp .env.example .env
# সব credentials fill করো

# 6. Local এ test করো
npm run dev

# 7. MongoDB Atlas + Telegram bot setup করো

# 8. CloudPanel এ deploy করো
npm install -g pm2
pm2 start ecosystem.config.js
