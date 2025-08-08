const express = require('express');
const { Campaign } = require('../models');
const router = express.Router();

// Channel schemas and market lists used by multiple endpoints
const CHANNEL_SCHEMAS = {
  'Email': {
    name: 'Email',
    description: 'Email marketing campaigns',
    fields: {
      subject: { type: 'string', required: true, label: 'Subject Line' },
      bodyContent: { type: 'text', required: true, label: 'Email Body' },
      senderName: { type: 'string', required: false, label: 'Sender Name' },
      senderEmail: { type: 'email', required: false, label: 'Sender Email' },
      template: { type: 'select', required: false, label: 'Email Template', options: ['default', 'promotional', 'newsletter'] }
    }
  },
  'BNP': {
    name: 'BNP',
    description: 'Banner and promotion displays',
    fields: {
      title: { type: 'string', required: true, label: 'Banner Title' },
      description: { type: 'text', required: false, label: 'Banner Description' },
      linkUrl: { type: 'url', required: false, label: 'Click URL' },
      backgroundImage: { type: 'url', required: false, label: 'Background Image URL' },
      position: { type: 'select', required: false, label: 'Banner Position', options: ['top', 'middle', 'bottom', 'sidebar'] }
    }
  },
  'Rewards Dashboard': {
    name: 'Rewards Dashboard',
    description: 'Rewards dashboard promotions',
    fields: {
      title: { type: 'string', required: true, label: 'Promotion Title' },
      description: { type: 'text', required: true, label: 'Promotion Description' },
      linkUrl: { type: 'url', required: false, label: 'Action URL' },
      backgroundImage: { type: 'url', required: false, label: 'Background Image URL' },
      scheduleStop: { type: 'datetime', required: false, label: 'Stop Display Date' },
      priority: { type: 'select', required: false, label: 'Display Priority', options: ['high', 'medium', 'low'] }
    }
  }
};

const VALID_MARKETS = ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'JP'];

// GET /api/channels - list channels and configurations (shape expected by tests)
router.get('/', (req, res) => {
  const channels = Object.keys(CHANNEL_SCHEMAS);
  res.json({
    success: true,
    data: {
      channels,
      configurations: CHANNEL_SCHEMAS
    }
  });
});

// GET /api/channels/:channel/config - channel-specific configuration
router.get('/:channel/config', (req, res) => {
  const channelName = decodeURIComponent(req.params.channel);
  if (!CHANNEL_SCHEMAS[channelName]) {
    return res.status(400).json({
      success: false,
      message: `Invalid channel: ${channelName}`
    });
  }
  res.json({
    success: true,
    data: {
      channel: channelName,
      config: CHANNEL_SCHEMAS[channelName]
    }
  });
});

// GET /api/channels/markets - list markets and configurations
router.get('/markets', (req, res) => {
  const configurations = VALID_MARKETS.reduce((acc, m) => {
    acc[m] = {
      timezone: 'UTC',
      currency: m === 'US' ? 'USD' : m === 'UK' ? 'GBP' : 'EUR'
    };
    return acc;
  }, {});
  res.json({
    success: true,
    data: {
      markets: VALID_MARKETS,
      configurations
    }
  });
});

// GET /api/channels/validation - return valid sets
router.get('/validation', (req, res) => {
  res.json({
    success: true,
    data: {
      validChannels: Object.keys(CHANNEL_SCHEMAS),
      validMarkets: VALID_MARKETS,
      validStates: ['Draft', 'Scheduled', 'Live', 'Complete', 'Deleted']
    }
  });
});

// POST /api/channels/configure/:campaignId - Configure channels for a campaign
router.post('/configure/:campaignId', async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.campaignId);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    const { channels, channelConfigs } = req.body;
    
    // Validate channels
    const validChannels = ['Email', 'BNP', 'Rewards Dashboard'];
    if (!Array.isArray(channels)) {
      return res.status(400).json({
        success: false,
        message: 'Channels must be an array'
      });
    }

    for (const channel of channels) {
      if (!validChannels.includes(channel)) {
        return res.status(400).json({
          success: false,
          message: `Invalid channel: ${channel}. Valid channels: ${validChannels.join(', ')}`
        });
      }
    }

    // Validate channel configurations
    const validatedConfigs = {};
    if (channelConfigs && typeof channelConfigs === 'object') {
      for (const [channelName, config] of Object.entries(channelConfigs)) {
        if (channels.includes(channelName)) {
          validatedConfigs[channelName] = config;
        }
      }
    }

    await campaign.update({
      channels: channels,
      channelConfig: validatedConfigs
    });

    res.json({
      success: true,
      message: 'Channel configuration updated successfully',
      data: {
        campaignId: campaign.id,
        channels: campaign.channels,
        channelConfig: campaign.channelConfig
      }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to configure channels',
      error: error.message
    });
  }
});

// GET /api/channels/campaign/:campaignId - Get channel configuration for a campaign
router.get('/campaign/:campaignId', async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.campaignId);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    res.json({
      success: true,
      data: {
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        channels: campaign.channels,
        channelConfig: campaign.channelConfig || {}
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch channel configuration',
      error: error.message
    });
  }
});

// PUT /api/channels/campaign/:campaignId/:channelName - Update specific channel config
router.put('/campaign/:campaignId/:channelName', async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.campaignId);
    const { channelName } = req.params;
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    const validChannels = ['Email', 'BNP', 'Rewards Dashboard'];
    if (!validChannels.includes(channelName)) {
      return res.status(400).json({
        success: false,
        message: `Invalid channel: ${channelName}`
      });
    }

    if (!campaign.channels.includes(channelName)) {
      return res.status(400).json({
        success: false,
        message: `Channel ${channelName} is not assigned to this campaign`
      });
    }

    const currentConfig = campaign.channelConfig || {};
    currentConfig[channelName] = req.body;

    await campaign.update({
      channelConfig: currentConfig
    });

    res.json({
      success: true,
      message: `${channelName} configuration updated successfully`,
      data: {
        channelName,
        config: currentConfig[channelName]
      }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update channel configuration',
      error: error.message
    });
  }
});

// DELETE /api/channels/campaign/:campaignId/:channelName - Remove channel from campaign
router.delete('/campaign/:campaignId/:channelName', async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.campaignId);
    const { channelName } = req.params;
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (!campaign.channels.includes(channelName)) {
      return res.status(400).json({
        success: false,
        message: `Channel ${channelName} is not assigned to this campaign`
      });
    }

    // Remove channel from channels array
    const updatedChannels = campaign.channels.filter(ch => ch !== channelName);
    
    // Remove channel configuration
    const updatedConfig = { ...campaign.channelConfig };
    delete updatedConfig[channelName];

    await campaign.update({
      channels: updatedChannels,
      channelConfig: updatedConfig
    });

    res.json({
      success: true,
      message: `${channelName} removed from campaign successfully`,
      data: {
        channels: updatedChannels,
        channelConfig: updatedConfig
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove channel',
      error: error.message
    });
  }
});

module.exports = router;