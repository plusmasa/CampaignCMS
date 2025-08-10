const express = require('express');
const { Campaign } = require('../models');
const { Op } = require('sequelize');
const { successResponse, errorResponse, paginationResponse } = require('../utils/responses');
const { validateChannels, validateMarkets, validateTitle } = require('../utils/validation');
const { VALID_STATES } = require('../utils/constants');
const { handleAsyncError } = require('../utils/middleware');
const { logger } = require('../utils/logger');
const router = express.Router();
const { templateFor, latestTemplateVersion, hasMeaningfulConfig } = require('../utils/campaignTypes');
const { validateConfig } = require('../utils/campaignSchema');

// GET /api/campaigns - Get all campaigns with filtering and sorting
router.get('/', handleAsyncError(async (req, res) => {
  const { 
    state, 
    channel, 
    market, 
    sortBy = 'updatedAt', 
    sortOrder = 'DESC',
    page = 1,
    limit = 100
  } = req.query;

  logger.debug('Fetching campaigns', { filters: { state, channel, market }, pagination: { page, limit } });

  // Build where clause for filtering
  const whereClause = {};
  
  if (state) {
    whereClause.state = state;
  }
  // Always exclude soft-deleted campaigns
  whereClause.state = whereClause.state
    ? whereClause.state
    : { [Op.ne]: 'Deleted' };

  // Channel filtering (check if campaign has specific channel)
  if (channel) {
    whereClause.channels = {
      [Op.like]: `%"${channel}"%`
    };
  }

  // Pagination
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const { count, rows: campaigns } = await Campaign.findAndCountAll({
    where: whereClause,
    order: [[sortBy, sortOrder.toUpperCase()]],
    limit: parseInt(limit),
    offset: offset
  });

  // Filter by market if specified (post-query filtering for JSON field)
  let filteredCampaigns = campaigns;
  if (market && market !== 'all') {
    filteredCampaigns = campaigns.filter(campaign => {
      if (campaign.markets === 'all') return true;
      return Array.isArray(campaign.markets) && campaign.markets.includes(market);
    });
  }
  
  res.json(paginationResponse(filteredCampaigns, {
    currentPage: parseInt(page),
    totalPages: Math.ceil(count / parseInt(limit)),
    totalCount: count,
    hasNextPage: offset + filteredCampaigns.length < count,
    hasPrevPage: parseInt(page) > 1
  }, { state, channel, market, sortBy, sortOrder }));
}));

// GET /api/campaigns/:id - Get single campaign
router.get('/:id', handleAsyncError(async (req, res) => {
  const campaign = await Campaign.findByPk(req.params.id);
  
  if (!campaign) {
    return res.status(404).json(errorResponse('Campaign not found', 404));
  }
  
  res.json(successResponse(campaign));
}));

// POST /api/campaigns - Create new campaign
router.post('/', handleAsyncError(async (req, res) => {
  const { title, channels = [], markets, type = 'OFFER', preset } = req.body;
  
  logger.debug('Creating new campaign', { title, channels, markets, type, preset });
  
  try {
    // Validate required fields
    const validatedTitle = validateTitle(title);
    
    // Validate channels if provided
    if (channels.length > 0) {
      validateChannels(channels);
    }

    // Validate markets if provided
    if (markets) {
      validateMarkets(markets);
    }

    // Seed template config for the selected type (backward compatible: defaults to OFFER)
    let seeded = { config: {}, templateVersion: latestTemplateVersion };
    try {
      seeded = templateFor(type, preset);
    } catch (e) {
      return res.status(400).json(errorResponse('Failed to create campaign', 400, e.message));
    }

    // If variants are explicitly requested, seed as a single blank variant; otherwise keep legacy single-config
    const wantsVariants = (req.body && req.body.config && Array.isArray(req.body.config.variants)) || req.body.useVariants === true;
    const campaign = await Campaign.create({
      ...req.body,
      type,
      templateVersion: seeded.templateVersion,
      config: wantsVariants ? { variants: [{ id: `${Date.now()}`, market: undefined, config: seeded.config }] } : seeded.config,
      title: validatedTitle,
      state: 'Draft' // Always start as Draft
    });
    
    logger.info('Campaign created successfully', { campaignId: campaign.id, title: campaign.title });
    res.status(201).json(successResponse(campaign, 'Campaign created successfully'));
    
  } catch (error) {
    logger.warn('Campaign creation failed', { title, error: error.message });
    res.status(400).json(errorResponse('Failed to create campaign', 400, error.message));
  }
}));

// PUT /api/campaigns/:id - Update campaign
router.put('/:id', handleAsyncError(async (req, res) => {
  const campaign = await Campaign.findByPk(req.params.id);
  
  if (!campaign) {
    return res.status(404).json(errorResponse('Campaign not found', 404));
  }

  try {
    // Validate title if being updated
    if (req.body.title !== undefined) {
      req.body.title = validateTitle(req.body.title);
    }

    // Prevent direct state changes through this endpoint
    if (req.body.state && req.body.state !== campaign.state) {
      return res.status(400).json(errorResponse(
        'State changes must be done through workflow endpoints (/api/workflow/...)', 400
      ));
    }

    // Validate channels if being updated
    if (req.body.channels) {
      validateChannels(req.body.channels);
    }

    // Validate markets if being updated
    if (req.body.markets) {
      validateMarkets(req.body.markets);
    }
    
    await campaign.update(req.body);
    
    logger.info('Campaign updated successfully', { campaignId: campaign.id });
    res.json(successResponse(campaign, 'Campaign updated successfully'));
    
  } catch (error) {
    logger.warn('Campaign update failed', { campaignId: req.params.id, error: error.message });
    res.status(400).json(errorResponse('Failed to update campaign', 400, error.message));
  }
}));

// DELETE /api/campaigns/:id - Soft delete campaign (Draft only)
router.delete('/:id', handleAsyncError(async (req, res) => {
  const campaign = await Campaign.findByPk(req.params.id);
  
  if (!campaign) {
    return res.status(404).json(errorResponse('Campaign not found', 404));
  }

  // Only allow deletion of Draft campaigns
  if (campaign.state !== 'Draft') {
    return res.status(400).json(errorResponse(
      `Cannot delete campaign in ${campaign.state} state. Only Draft campaigns can be deleted.`, 400
    ));
  }
  
  // Soft delete: mark as Deleted state
  await campaign.update({ state: 'Deleted' });
  logger.info('Campaign soft-deleted (state=Deleted)', { campaignId: campaign.id, title: campaign.title });
  res.json(successResponse(null, 'Campaign soft-deleted successfully'));
}));

// GET /api/campaigns/by-state/:state - Get campaigns by state
router.get('/by-state/:state', handleAsyncError(async (req, res) => {
  const { state } = req.params;
  
  if (!VALID_STATES.includes(state)) {
    return res.status(400).json(errorResponse(
      `Invalid state: ${state}. Valid states: ${VALID_STATES.join(', ')}`, 400
    ));
  }

  const campaigns = await Campaign.findAll({
    where: { state },
    order: [['updatedAt', 'DESC']]
  });
  
  res.json(successResponse(campaigns, `Found ${campaigns.length} campaigns in ${state} state`));
}));

// POST /api/campaigns/:id/duplicate - Duplicate an existing campaign into a new Draft
router.post('/:id/duplicate', handleAsyncError(async (req, res) => {
  const original = await Campaign.findByPk(req.params.id);
  if (!original) {
    return res.status(404).json(errorResponse('Campaign not found', 404));
  }

  try {
    // Compose duplicate title
    const dupTitle = `${original.title} (copy)`;
    const targetType = req.query.type ? String(req.query.type).toUpperCase() : original.type || 'OFFER';
    let newConfig = original.config || {};
    let newTemplateVersion = original.templateVersion || latestTemplateVersion;
    if (req.query.type) {
      // Type conversion via template seed
      try {
        const seeded = templateFor(targetType, null);
        newConfig = seeded.config;
        newTemplateVersion = seeded.templateVersion;
      } catch (e) {
        return res.status(400).json(errorResponse('Failed to duplicate campaign', 400, e.message));
      }
    }

    // Create new Draft campaign with copied (or converted) configuration
    const duplicate = await Campaign.create({
      title: dupTitle,
      state: 'Draft',
      type: targetType,
      templateVersion: newTemplateVersion,
      config: newConfig,
      channels: Array.isArray(original.channels) ? [...original.channels] : [],
      markets: original.markets,
      channelConfig: original.channelConfig || {},
      startDate: original.startDate || null,
      endDate: original.endDate || null
    });

    logger.info('Campaign duplicated successfully', { originalId: original.id, duplicateId: duplicate.id });
    res.status(201).json(successResponse(duplicate, 'Campaign duplicated successfully'));
  } catch (error) {
    logger.warn('Campaign duplication failed', { originalId: req.params.id, error: error.message });
    res.status(400).json(errorResponse('Failed to duplicate campaign', 400, error.message));
  }
}));

// PUT /api/campaigns/:id/config - Update type-specific config with Ajv validation
router.put('/:id/config', handleAsyncError(async (req, res) => {
  const { config } = req.body || {};
  const campaign = await Campaign.findByPk(req.params.id);
  if (!campaign) {
    return res.status(404).json(errorResponse('Campaign not found', 404));
  }
  const { valid, errors } = validateConfig(campaign.type || 'OFFER', config);
  if (!valid) {
    return res.status(422).json(errorResponse('Validation failed', 422, errors));
  }
  // Derive campaign.markets from variants if present; else leave as-is
  let nextMarkets = campaign.markets;
  if (config && typeof config === 'object' && Array.isArray(config.variants)) {
    const markets = config.variants
      .map(v => v && v.market)
      .filter(m => typeof m === 'string' && m);
    // Unique list
    const uniq = Array.from(new Set(markets));
    nextMarkets = uniq.length > 0 ? uniq : 'all';
  }
  await campaign.update({ config, markets: nextMarkets });
  res.json(successResponse({ updatedAt: campaign.updatedAt }, 'Config updated'));
}));

// PATCH /api/campaigns/:id/type - Change type only for empty Drafts (optional)
router.patch('/:id/type', handleAsyncError(async (req, res) => {
  const { type, preset } = req.body || {};
  const campaign = await Campaign.findByPk(req.params.id);
  if (!campaign) {
    return res.status(404).json(errorResponse('Campaign not found', 404));
  }
  if (campaign.state !== 'Draft') {
    return res.status(409).json(errorResponse('Type change not allowed after Publish. Use duplicate-as-new-type.', 409, 'immutable_type_after_publish'));
  }
  if (hasMeaningfulConfig(campaign.type || 'OFFER', campaign.config || {})) {
    return res.status(409).json(errorResponse('Type change not allowed after content exists. Use duplicate-as-new-type.', 409, 'immutable_type_after_meaningful_config'));
  }
  try {
    const seeded = templateFor(type, preset);
    await campaign.update({ type, templateVersion: seeded.templateVersion, config: seeded.config });
    return res.json(successResponse(null, 'Type changed and config reset to template'));
  } catch (e) {
    return res.status(400).json(errorResponse('Failed to change type', 400, e.message));
  }
}));

module.exports = router;
