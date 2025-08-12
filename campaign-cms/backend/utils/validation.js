const { VALID_MARKETS, VALID_STATES } = require('./constants');

// Validation utility functions
// Channels removed

const validateMarkets = (markets) => {
  if (markets === 'all') return true;
  
  if (!Array.isArray(markets)) {
    throw new Error('Markets must be "all" or an array of market names');
  }
  
  for (const market of markets) {
    if (!VALID_MARKETS.includes(market)) {
      throw new Error(`Invalid market: ${market}. Valid markets: ${VALID_MARKETS.join(', ')}`);
    }
  }
  
  return true;
};

const validateState = (state) => {
  if (!VALID_STATES.includes(state)) {
    throw new Error(`Invalid state: ${state}. Valid states: ${VALID_STATES.join(', ')}`);
  }
  return true;
};

const validateTitle = (title) => {
  if (!title || title.trim().length === 0) {
    throw new Error('Title is required and cannot be empty');
  }
  if (title.length > 255) {
    throw new Error('Title cannot exceed 255 characters');
  }
  return title.trim();
};

const validateDateRange = (startDate, endDate) => {
  if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
    throw new Error('End date must be after start date');
  }
  return true;
};

module.exports = {
  validateMarkets,
  validateState,
  validateTitle,
  validateDateRange
};
