// Shared constants
const VALID_MARKETS = ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'JP'];
// Added 'Deleted' for soft-deleted drafts (not part of active workflow transitions)
const VALID_STATES = ['Draft', 'Scheduled', 'Live', 'Complete', 'Deleted'];

const STATE_TRANSITIONS = {
  Draft: ['Scheduled', 'Live'],
  Scheduled: ['Draft', 'Live'],
  Live: ['Complete'],
  Complete: [], // Terminal state
  // Deleted is terminal and not exposed for normal transitions
  Deleted: []
};

// Per-campaign channels removed; no CHANNEL_CONFIGS needed

module.exports = {
  VALID_MARKETS,
  VALID_STATES,
  STATE_TRANSITIONS
};
