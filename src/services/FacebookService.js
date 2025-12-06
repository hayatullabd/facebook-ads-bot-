const axios = require('axios');
const logger = require('../utils/logger');
const config = require('../config/env');

class FacebookService {
  constructor() {
    this.baseUrl = 'https://graph.facebook.com';
    this.apiVersion = config.facebook.apiVersion;
    this.token = config.facebook.systemUserToken;
  }
  
  async fetchCampaignInsights(adAccountId, datePreset = 'last_24h') {
    try {
      const fields = [
        'id', 'name', 'status', 'objective', 'daily_budget', 'lifetime_budget',
        `insights.date_preset(${datePreset}){spend,impressions,reach,clicks,actions,cpc,cpm,ctr}`
      ].join(',');
      
      const response = await axios.get(
        `${this.baseUrl}/${this.apiVersion}/act_${adAccountId}/campaigns`,
        {
          params: {
            access_token: this.token,
            fields: fields,
            limit: 100
          },
          timeout: 30000
        }
      );
      
      return response.data.data || [];
    } catch (error) {
      logger.error(`Facebook API error: ${error.message}`);
      throw error;
    }
  }
  
  async fetchAdSetInsights(campaignId, datePreset = 'last_7d') {
    try {
      const fields = [
        'id', 'name', 'status', 'daily_budget', 'lifetime_budget',
        `insights.date_preset(${datePreset}){spend,impressions,reach,clicks,cpc,cpm,ctr}`
      ].join(',');
      
      const response = await axios.get(
        `${this.baseUrl}/${this.apiVersion}/${campaignId}/adsets`,
        {
          params: {
            access_token: this.token,
            fields: fields,
            limit: 100
          },
          timeout: 30000
        }
      );
      
      return response.data.data || [];
    } catch (error) {
      logger.error(`Facebook API error: ${error.message}`);
      throw error;
    }
  }
  
  async validateToken() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${this.apiVersion}/me`,
        {
          params: { access_token: this.token },
          timeout: 10000
        }
      );
      
      return response.status === 200;
    } catch (error) {
      logger.error(`Token validation error: ${error.message}`);
      return false;
    }
  }
}

module.exports = FacebookService;
