// Logger utility for consistent logging
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN', 
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

const formatLogMessage = (level, message, context = {}) => {
  const timestamp = new Date().toISOString();
  const contextStr = Object.keys(context).length > 0 ? ` | Context: ${JSON.stringify(context)}` : '';
  return `[${timestamp}] ${level}: ${message}${contextStr}`;
};

const logger = {
  error: (message, context = {}) => {
    if (!isTest) {
      console.error(formatLogMessage(LOG_LEVELS.ERROR, message, context));
    }
  },
  
  warn: (message, context = {}) => {
    if (!isTest) {
      console.warn(formatLogMessage(LOG_LEVELS.WARN, message, context));
    }
  },
  
  info: (message, context = {}) => {
    if (!isTest) {
      console.log(formatLogMessage(LOG_LEVELS.INFO, message, context));
    }
  },
  
  debug: (message, context = {}) => {
    if (isDevelopment && !isTest) {
      console.log(formatLogMessage(LOG_LEVELS.DEBUG, message, context));
    }
  }
};

module.exports = {
  logger,
  LOG_LEVELS
};
