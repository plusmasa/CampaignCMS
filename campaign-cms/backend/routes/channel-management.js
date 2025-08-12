const express = require('express');
const router = express.Router();

// Channels removed: all channel-management endpoints are deprecated
const GONE = (res, detail) => res.status(410).json({ success: false, message: `Channels have been removed. ${detail || ''}`.trim() });
const VALID_MARKETS = ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'JP'];

// GET /api/channels - list channels and configurations (shape expected by tests)
router.get('/', (req, res) => GONE(res, 'Listing channels is no longer supported.'));

// GET /api/channels/:channel/config - channel-specific configuration
router.get('/:channel/config', (req, res) => GONE(res, 'Channel configuration endpoints are removed.'));

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
  // Preserve markets/states info for callers; channels removed
  return res.json({
    success: true,
    data: {
      validChannels: [],
      validMarkets: VALID_MARKETS,
      validStates: ['Draft', 'Scheduled', 'Live', 'Complete', 'Deleted']
    }
  });
});

// POST /api/channels/configure/:campaignId - Configure channels for a campaign
router.post('/configure/:campaignId', (req, res) => GONE(res, 'Configuring channels is no longer supported.'));

// GET /api/channels/campaign/:campaignId - Get channel configuration for a campaign
router.get('/campaign/:campaignId', (req, res) => GONE(res, 'Per-campaign channel configuration has been removed.'));

// PUT /api/channels/campaign/:campaignId/:channelName - Update specific channel config
router.put('/campaign/:campaignId/:channelName', (req, res) => GONE(res, 'Updating channel configuration is no longer supported.'));

// DELETE /api/channels/campaign/:campaignId/:channelName - Remove channel from campaign
router.delete('/campaign/:campaignId/:channelName', (req, res) => GONE(res, 'Removing channels from campaigns is no longer supported.'));

module.exports = router;