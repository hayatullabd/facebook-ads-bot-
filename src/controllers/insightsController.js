const InsightsDaily = require('../models/InsightsDaily');
const Campaign = require('../models/Campaign');
const Ad = require('../models/Ad');
const UserPermission = require('../models/UserPermission');
const logger = require('../utils/logger');

exports.dailySummary = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const userId = req.userId;
    
    const permissions = await UserPermission.find({
      botUserId: userId,
      adAccountId: { $exists: true }
    }).distinct('adAccountId');
    
    if (permissions.length === 0) {
      return res.json({
        success: true,
        data: [],
        stats: {
          totalSpend: 0,
          totalImpressions: 0,
          avgROAS: 0
        }
      });
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const insights = await InsightsDaily.aggregate([
      {
        $match: {
          adAccountId: { $in: permissions },
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$date',
          spend: { $sum: '$spend' },
          impressions: { $sum: '$impressions' },
          reach: { $sum: '$reach' },
          clicks: { $sum: '$clicks' },
          results: { $sum: '$results' },
          cpc: { $avg: '$cpc' },
          cpm: { $avg: '$cpm' },
          ctr: { $avg: '$ctr' },
          roas: { $avg: '$roas' }
        }
      },
      { $sort: { _id: -1 } }
    ]);
    
    const stats = {
      totalSpend: insights.reduce((sum, i) => sum + i.spend, 0),
      totalImpressions: insights.reduce((sum, i) => sum + i.impressions, 0),
      totalResults: insights.reduce((sum, i) => sum + i.results, 0),
      avgROAS: insights.length > 0 
        ? insights.reduce((sum, i) => sum + i.roas, 0) / insights.length 
        : 0
    };
    
    res.json({
      success: true,
      data: insights.map(i => ({
        date: i._id.toISOString().split('T')[0],
        ...i
      })),
      stats
    });
  } catch (error) {
    logger.error(`Daily summary error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.campaigns = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const perPage = 10;
    const userId = req.userId;
    
    const permissions = await UserPermission.find({
      botUserId: userId
    }).distinct('adAccountId');
    
    const campaigns = await Campaign.find({
      adAccountId: { $in: permissions }
    })
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ createdAt: -1 });
    
    const total = await Campaign.countDocuments({
      adAccountId: { $in: permissions }
    });
    
    res.json({
      success: true,
      data: campaigns,
      pagination: {
        page: parseInt(page),
        perPage,
        total,
        pages: Math.ceil(total / perPage)
      }
    });
  } catch (error) {
    logger.error(`Campaigns error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.campaignDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const hasPerm = await UserPermission.findOne({
      botUserId: userId,
      $or: [
        { campaignId: id },
        { adAccountId: { $exists: true } }
      ]
    });
    
    if (!hasPerm) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    const campaign = await Campaign.findById(id).lean();
    
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    
    const insights = await InsightsDaily.find({
      campaignId: id,
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).sort({ date: -1 });
    
    res.json({
      success: true,
      campaign,
      insights
    });
  } catch (error) {
    logger.error(`Campaign detail error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.ads = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const userId = req.userId;
    
    const permissions = await UserPermission.find({
      botUserId: userId
    }).distinct('adAccountId');
    
    const ads = await Ad.find({
      adAccountId: { $in: permissions }
    })
      .limit(20)
      .skip((page - 1) * 20)
      .sort({ createdAt: -1 });
    
    const total = await Ad.countDocuments({
      adAccountId: { $in: permissions }
    });
    
    res.json({
      success: true,
      data: ads,
      pagination: {
        page: parseInt(page),
        perPage: 20,
        total,
        pages: Math.ceil(total / 20)
      }
    });
  } catch (error) {
    logger.error(`Ads error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.adDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const ad = await Ad.findById(id).lean();
    
    if (!ad) {
      return res.status(404).json({ success: false, message: 'Ad not found' });
    }
    
    const hasPerm = await UserPermission.findOne({
      botUserId: userId,
      $or: [
        { adId: id },
        { adAccountId: ad.adAccountId }
      ]
    });
    
    if (!hasPerm) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    const insights = await InsightsDaily.find({
      adId: id,
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).sort({ date: -1 });
    
    res.json({
      success: true,
      ad,
      insights
    });
  } catch (error) {
    logger.error(`Ad detail error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.hourlyData = async (req, res) => {
  try {
    const { adAccountId, hours = 24 } = req.query;
    const userId = req.userId;
    
    const hasPerm = await UserPermission.findOne({
      botUserId: userId,
      adAccountId
    });
    
    if (!hasPerm) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    const InsightsHourly = require('../models/InsightsHourly');
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const insights = await InsightsHourly.find({
      adAccountId,
      dateHour: { $gte: startTime }
    }).sort({ dateHour: -1 });
    
    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    logger.error(`Hourly data error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};
