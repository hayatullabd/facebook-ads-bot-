const calculateROAS = (spend, revenue) => {
  if (spend === 0) return 0;
  return (revenue / spend).toFixed(2);
};

const formatCurrency = (value) => {
  return parseFloat(value).toFixed(2);
};

const formatNumber = (value) => {
  return parseInt(value || 0).toLocaleString();
};

const getDateRange = (period) => {
  const today = new Date();
  let start;

  switch (period) {
    case 'today':
      start = new Date(today.setHours(0, 0, 0, 0));
      break;
    case 'yesterday':
      start = new Date(today.setDate(today.getDate() - 1));
      start.setHours(0, 0, 0, 0);
      break;
    case 'last_7d':
      start = new Date(today.setDate(today.getDate() - 7));
      break;
    case 'last_30d':
      start = new Date(today.setDate(today.getDate() - 30));
      break;
    case 'this_month':
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    default:
      start = new Date(today.setDate(today.getDate() - 30));
  }

  return { start, end: new Date() };
};

module.exports = {
  calculateROAS,
  formatCurrency,
  formatNumber,
  getDateRange
};
