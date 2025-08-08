const { Campaign } = require('../models');
const { errorResponse } = require('./responses');
const { logger } = require('./logger');

// Common campaign operations
const findCampaignById = async (id) => {
  try {
    const campaign = await Campaign.findByPk(id);
    if (!campaign) {
      throw new Error('Campaign not found');
    }
    return campaign;
  } catch (error) {
    logger.error('Failed to find campaign', { campaignId: id, error: error.message });
    throw error;
  }
};

const validateCampaignExists = async (req, res, next) => {
  try {
    const campaign = await findCampaignById(req.params.id || req.params.campaignId);
    req.campaign = campaign;
    next();
  } catch (error) {
    if (error.message === 'Campaign not found') {
      return res.status(404).json(errorResponse('Campaign not found', 404));
    }
    return res.status(500).json(errorResponse('Failed to validate campaign', 500, error.message));
  }
};

// Error handling middleware
const handleAsyncError = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const globalErrorHandler = (error, req, res, _next) => {
  logger.error('Unhandled error', { 
    path: req.path, 
    method: req.method, 
    error: error.message,
    stack: error.stack 
  });
  
  // Don't expose internal errors in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'An internal error occurred' 
    : error.message;
    
  res.status(500).json(errorResponse(message, 500));
};

module.exports = {
  findCampaignById,
  validateCampaignExists,
  handleAsyncError,
  globalErrorHandler
};
