const express = require('express');
const { Campaign } = require('../models');
const router = express.Router();
const { STATE_TRANSITIONS } = require('../utils/constants');
const { validateConfig } = require('../utils/campaignSchema');
const { validateDateRange } = require('../utils/validation');

// Helper: strict checks required before moving a Draft to Scheduled/Live
function getPublishabilityErrors(campaign) {
  const errors = [];

  // Require at least one channel selected
  if (!Array.isArray(campaign.channels) || campaign.channels.length === 0) {
    errors.push('At least one channel must be selected before publishing.');
  }

  // Validate type-specific config with Ajv
  const { valid, errors: ajvErrors } = validateConfig(campaign.type || 'OFFER', campaign.config || {});
  if (!valid) {
    const details = (ajvErrors || []).map(e => (typeof e === 'string' ? e : e.message)).filter(Boolean);
    errors.push('Content configuration is invalid.', ...details);
  }

  // If using variants, require every variant to have a market and be unique
  const cfg = campaign.config || {};
  if (cfg && typeof cfg === 'object' && Array.isArray(cfg.variants)) {
    const seen = new Set();
    for (let i = 0; i < cfg.variants.length; i++) {
      const v = cfg.variants[i] || {};
      if (!v.market || typeof v.market !== 'string' || !v.market.trim()) {
        errors.push(`Variant #${i + 1} must have a market assigned.`);
      } else if (seen.has(v.market)) {
        errors.push(`Duplicate market across variants: ${v.market}`);
      } else {
        seen.add(v.market);
      }
    }
  }

  return errors;
}

// PUT /api/workflow/campaigns/:id/transition - generic state transition with validation
router.put('/campaigns/:id/transition', async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    const { newState } = req.body || {};
    if (!newState) {
      return res.status(400).json({ success: false, message: 'newState is required' });
    }
    const allowed = STATE_TRANSITIONS[campaign.state] || [];
    if (!allowed.includes(newState)) {
      return res.status(400).json({ success: false, message: 'Invalid state transition' });
    }
    campaign.state = newState;
    await campaign.save();
    res.json({ success: true, message: 'State updated', data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to transition', error: error.message });
  }
});

// POST /api/workflow/campaigns/:id/schedule - set future dates and schedule
router.post('/campaigns/:id/schedule', async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    const { startDate, endDate } = req.body || {};
    if (!startDate || new Date(startDate) <= new Date()) {
      return res.status(400).json({ success: false, message: 'Start date must be in the future' });
    }
    try {
      validateDateRange(startDate, endDate || null);
    } catch (e) {
      return res.status(400).json({ success: false, message: e.message });
    }
    // Gating: ensure publishable after valid date range
    const gatingErrors = getPublishabilityErrors(campaign);
    if (gatingErrors.length > 0) {
      return res.status(422).json({ success: false, message: 'Schedule gating failed', errors: gatingErrors });
    }
    campaign.state = 'Scheduled';
    campaign.startDate = new Date(startDate);
    if (endDate) campaign.endDate = new Date(endDate);
    await campaign.save();
    res.json({ success: true, message: 'Campaign scheduled', data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to schedule', error: error.message });
  }
});

// POST /api/workflow/campaigns/:id/stop - stop live campaign
router.post('/campaigns/:id/stop', async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    if (campaign.state !== 'Live') {
      return res.status(400).json({ success: false, message: 'Only Live campaigns can be stopped' });
    }
    campaign.state = 'Complete';
    campaign.endDate = new Date();
    await campaign.save();
    res.json({ success: true, message: 'Campaign stopped', data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to stop campaign', error: error.message });
  }
});

// GET /api/workflow/campaigns/:id/history - mock transition history
router.get('/campaigns/:id/history', async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    const transitions = [
      { state: 'Draft', at: campaign.createdAt || new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      campaign.startDate ? { state: 'Live', at: campaign.startDate } : { state: 'Scheduled', at: new Date() },
      campaign.endDate ? { state: 'Complete', at: campaign.endDate } : null
    ].filter(Boolean);
    res.json({ success: true, data: { transitions } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get history', error: error.message });
  }
});

// POST /api/workflow/publish/:id - Publish campaign (Draft -> Live/Scheduled)
router.post('/publish/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (campaign.state !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Cannot publish campaign from ${campaign.state} state. Only Draft campaigns can be published.`
      });
    }

    // Gating: ensure publishable content and setup
    const gatingErrors = getPublishabilityErrors(campaign);
    if (gatingErrors.length > 0) {
      return res.status(422).json({ success: false, message: 'Publish gating failed', errors: gatingErrors });
    }

    const { publishDate, endDate } = req.body || {};
    const now = new Date();
    let newState, startDate;

    if (!publishDate || new Date(publishDate) <= now) {
      // Immediate publish or past date -> Live
      newState = 'Live';
      startDate = now;
    } else {
      // Future date -> Scheduled
      newState = 'Scheduled';
      startDate = new Date(publishDate);
    }

    // Optional endDate validation
    if (endDate) {
      try {
        validateDateRange(startDate, endDate);
      } catch (e) {
        return res.status(400).json({ success: false, message: e.message });
      }
    }

    await campaign.update({
      state: newState,
      startDate: startDate,
      endDate: endDate ? new Date(endDate) : campaign.endDate
    });

    res.json({
      success: true,
      message: `Campaign ${newState === 'Live' ? 'published' : 'scheduled'} successfully`,
      data: campaign
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to publish campaign',
      error: error.message
    });
  }
});

// POST /api/workflow/unschedule/:id - Unschedule campaign (Scheduled -> Draft)
router.post('/unschedule/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (campaign.state !== 'Scheduled') {
      return res.status(400).json({
        success: false,
        message: `Cannot unschedule campaign in ${campaign.state} state. Only Scheduled campaigns can be unscheduled.`
      });
    }

    await campaign.update({
      state: 'Draft',
      startDate: null
    });

    res.json({
      success: true,
      message: 'Campaign unscheduled successfully',
      data: campaign
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to unschedule campaign',
      error: error.message
    });
  }
});

// POST /api/workflow/reschedule/:id - Change publish date of scheduled campaign
router.post('/reschedule/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (campaign.state !== 'Scheduled') {
      return res.status(400).json({
        success: false,
        message: `Cannot reschedule campaign in ${campaign.state} state. Only Scheduled campaigns can be rescheduled.`
      });
    }

    const { publishDate } = req.body;
    
    if (!publishDate) {
      return res.status(400).json({
        success: false,
        message: 'publishDate is required for rescheduling'
      });
    }

    const newStartDate = new Date(publishDate);
    const now = new Date();

    // If new date is in the past or now, publish immediately
    if (newStartDate <= now) {
      // Gating before going Live
      const gatingErrors = getPublishabilityErrors(campaign);
      if (gatingErrors.length > 0) {
        return res.status(422).json({ success: false, message: 'Publish gating failed', errors: gatingErrors });
      }
      await campaign.update({
        state: 'Live',
        startDate: now
      });
      
      return res.json({
        success: true,
        message: 'Campaign published immediately due to past/current date',
        data: campaign
      });
    }

    await campaign.update({
      startDate: newStartDate
    });

    res.json({
      success: true,
      message: 'Campaign rescheduled successfully',
      data: campaign
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reschedule campaign',
      error: error.message
    });
  }
});

// POST /api/workflow/stop/:id - Stop live campaign (Live -> Complete)
router.post('/stop/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (campaign.state !== 'Live') {
      return res.status(400).json({
        success: false,
        message: `Cannot stop campaign in ${campaign.state} state. Only Live campaigns can be stopped.`
      });
    }

    await campaign.update({
      state: 'Complete',
      endDate: new Date()
    });

    res.json({
      success: true,
      message: 'Campaign stopped successfully',
      data: campaign
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to stop campaign',
      error: error.message
    });
  }
});

// GET /api/workflow/scheduled - Get all scheduled campaigns that should be published
router.get('/scheduled', async (req, res) => {
  try {
    const now = new Date();
    
    const scheduledCampaigns = await Campaign.findAll({
      where: {
        state: 'Scheduled',
        startDate: {
          [require('sequelize').Op.lte]: now
        }
      }
    });

    res.json({
      success: true,
      data: scheduledCampaigns,
      count: scheduledCampaigns.length,
      message: `Found ${scheduledCampaigns.length} campaigns ready to be published`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheduled campaigns',
      error: error.message
    });
  }
});

// POST /api/workflow/process-scheduled - Process scheduled campaigns (auto-publish)
router.post('/process-scheduled', async (req, res) => {
  try {
    const now = new Date();
    
    const scheduledCampaigns = await Campaign.findAll({
      where: {
        state: 'Scheduled',
        startDate: {
          [require('sequelize').Op.lte]: now
        }
      }
    });

    const publishedCampaigns = [];
    
    for (const campaign of scheduledCampaigns) {
      await campaign.update({ state: 'Live' });
      publishedCampaigns.push(campaign);
    }

    res.json({
      success: true,
      message: `Published ${publishedCampaigns.length} campaigns`,
      data: publishedCampaigns,
      count: publishedCampaigns.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process scheduled campaigns',
      error: error.message
    });
  }
});

module.exports = router;