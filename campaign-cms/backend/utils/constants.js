// Shared constants
const VALID_CHANNELS = ['Email', 'BNP', 'Rewards Dashboard'];
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

const CHANNEL_CONFIGS = {
  'Email': {
    name: 'Email',
    description: 'Email marketing campaigns',
    configFields: {
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
    configFields: {
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
    configFields: {
      title: { type: 'string', required: true, label: 'Promotion Title' },
      description: { type: 'text', required: true, label: 'Promotion Description' },
      linkUrl: { type: 'url', required: false, label: 'Action URL' },
      backgroundImage: { type: 'url', required: false, label: 'Background Image URL' },
      scheduleStop: { type: 'datetime', required: false, label: 'Stop Display Date' },
      priority: { type: 'select', required: false, label: 'Display Priority', options: ['high', 'medium', 'low'] }
    }
  }
};

module.exports = {
  VALID_CHANNELS,
  VALID_MARKETS,
  VALID_STATES,
  STATE_TRANSITIONS,
  CHANNEL_CONFIGS
};
