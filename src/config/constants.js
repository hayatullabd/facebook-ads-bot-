module.exports = {
  FACEBOOK_API_FIELDS: [
    'id',
    'name',
    'status',
    'objective',
    'daily_budget',
    'lifetime_budget',
    'insights'
  ],

  INSIGHT_METRICS: [
    'spend',
    'impressions',
    'reach',
    'clicks',
    'actions',
    'cpc',
    'cpm',
    'ctr'
  ],

  DATE_PRESETS: [
    'today',
    'yesterday',
    'last_7d',
    'last_30d',
    'this_month'
  ],

  PERMISSION_LEVELS: {
    ACCOUNT: 'account',
    CAMPAIGN: 'campaign',
    ADSET: 'adset',
    AD: 'ad'
  },

  ALERT_TYPES: [
    'status_change',
    'budget_exhausted',
    'learning_limited',
    'rejected',
    'spike',
    'drop'
  ]
};
