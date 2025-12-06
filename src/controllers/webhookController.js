const BotUser = require('../models/BotUser');
const TelegramService = require('../services/TelegramService');
const config = require('../config/env');
const logger = require('../utils/logger');

const telegramService = new TelegramService(config.telegram.botToken);

exports.verifyTelegram = (req, res) => {
  res.json({ ok: true });
};

exports.handleTelegram = async (req, res) => {
  try {
    const update = req.body;
    
    if (update.message) {
      const { message } = update;
      const chatId = message.chat.id;
      const text = message.text || '';
      const from = message.from;
      
      if (text === '/start') {
        await telegramService.handleStart(chatId, from);
      } else if (text === '/my_ads') {
        await telegramService.handleMyAds(chatId);
      } else if (text === '/my_campaigns') {
        await telegramService.handleMyCampaigns(chatId);
      } else if (text.startsWith('/report ')) {
        const campaignId = text.split(' ')[1];
        await telegramService.handleReport(chatId, campaignId);
      } else if (text === '/summary_today') {
        await telegramService.handleDailySummary(chatId);
      } else if (text === '/summary_month') {
        await telegramService.handleMonthlySummary(chatId);
      } else if (text === '/help') {
        await telegramService.handleHelp(chatId);
      }
    }
    
    if (update.callback_query) {
      const { callback_query } = update;
      const chatId = callback_query.from.id;
      const data = callback_query.data;
      const queryId = callback_query.id;
      
      if (data.startsWith('my_ads_page_')) {
        const page = parseInt(data.split('_')[3]);
        await telegramService.handleMyAds(chatId, page);
      } else if (data.startsWith('campaign_')) {
        const campaignId = data.replace('campaign_', '');
        await telegramService.handleReport(chatId, campaignId);
      }
      
      await telegramService.answerCallbackQuery(queryId);
    }
    
    res.json({ ok: true });
  } catch (error) {
    logger.error(`Telegram webhook error: ${error.message}`);
    res.json({ ok: true });
  }
};
