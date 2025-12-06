const cron = require('node-cron');
const AdAccount = require('../models/AdAccount');
const Campaign = require('../models/Campaign');
const InsightsHourly = require('../models/InsightsHourly');
const InsightsDaily = require('../models/InsightsDaily');
const FacebookService = require('../services/FacebookService');
const logger = require('../utils/logger');

const facebookService = new FacebookService();

const syncJob = cron.schedule('0 * * * *', async () => {
  logger.info('🔄 Facebook insights sync started');
  
  try {
    const adAccounts = await AdAccount.find({ status: 'active' });
    
    for (const account of adAccounts) {
      await syncAccountInsights(account);
    }
    
    logger.info('✅ Facebook insights sync completed');
  } catch (error) {
    logger.error(`Sync job error: ${error.message}`);
  }
});

async function syncAccountInsights(account) {
  try {
    account.syncStatus = 'syncing';
    account.lastSyncAt = new Date();
    await account.save();
    
    const campaigns = await facebookService.fetchCampaignInsights(
      account.facebookAccountId,
      'last_24h'
    );
    
    for (const campaignData of campaigns) {
      let campaign = await Campaign.findOne({
        adAccountId: account._id,
        facebookCampaignId: campaignData.id
      });
      
      if (!campaign) {
        campaign = new Campaign({
          clientId: account.clientId,
          adAccountId: account._id,
          facebookCampaignId: campaignData.id
        });
      }
      
      campaign.name = campaignData.name || 'Untitled';
      campaign.objective = campaignData.objective;
      campaign.status = campaignData.status;
      campaign.dailyBudget = campaignData.daily_budget || 0;
      campaign.lifetimeBudget = campaignData.lifetime_budget || 0;
      await campaign.save();
      
      if (campaignData.insights && campaignData.insights.data) {
        for (const insight of campaignData.insights.data) {
          const hourlyInsight = new InsightsHourly({
            clientId: account.clientId,
            adAccountId: account._id,
            campaignId: campaign._id,
            dateHour: new Date(insight.date_start),
            spend: parseFloat(insight.spend || 0),
            impressions: parseInt(insight.impressions || 0),
            reach: parseInt(insight.reach || 0),
            clicks: parseInt(insight.clicks || 0),
            results: parseInt(insight.results || 0),
            cpc: parseFloat(insight.cpc || 0),
            cpm: parseFloat(insight.cpm || 0),
            ctr: parseFloat(insight.ctr || 0)
          });
          
          await hourlyInsight.save();
        }
      }
    }
    
    await aggregateToDailyInsights(account._id);
    
    account.syncStatus = 'completed';
    await account.save();
    
    logger.info(`✅ Account ${account._id} synced successfully`);
  } catch (error) {
    logger.error(`Sync error for account ${account._id}: ${error.message}`);
    account.syncStatus = 'failed';
    await account.save();
  }
}

async function aggregateToDailyInsights(accountId) {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const hourlyData = await InsightsHourly.aggregate([
      {
        $match: {
          adAccountId: accountId,
          dateHour: { $gte: yesterday }
        }
      },
      {
        $group: {
          _id: '$campaignId',
          date: { $first: '$dateHour' },
          spend: { $sum: '$spend' },
          impressions: { $sum: '$impressions' },
          reach: { $sum: '$reach' },
          clicks: { $sum: '$clicks' },
          results: { $sum: '$results' },
          cpc: { $avg: '$cpc' },
          cpm: { $avg: '$cpm' },
          ctr: { $avg: '$ctr' }
        }
      }
    ]);
    
    for (const data of hourlyData) {
      const account = await AdAccount.findById(accountId);
      
      await InsightsDaily.findOneAndUpdate(
        {
          adAccountId: accountId,
          campaignId: data._id,
          date: {
            $gte: new Date(data.date.setHours(0, 0, 0, 0)),
            $lt: new Date(data.date.setHours(23, 59, 59, 999))
          }
        },
        {
          clientId: account.clientId,
          adAccountId: accountId,
          campaignId: data._id,
          date: data.date,
          spend: data.spend,
          impressions: data.impressions,
          reach: data.reach,
          clicks: data.clicks,
          results: data.results,
          cpc: data.cpc,
          cpm: data.cpm,
          ctr: data.ctr
        },
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    logger.error(`Daily aggregation error: ${error.message}`);
  }
}

const runSync = async () => {
  logger.info('🔄 Running manual sync...');
  await syncAccountInsights(await AdAccount.findOne({ status: 'active' }));
};

module.exports = {
  syncJob,
  runSync
};
