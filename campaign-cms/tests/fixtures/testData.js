// Test data fixtures
const mockCampaigns = [
  {
    id: 1,
    title: 'Summer Sale Campaign',
    state: 'Draft',
    channels: ['Email', 'Rewards Dashboard'],
    markets: ['US', 'CA'],
    channelConfig: {
      'Email': {
        subject: 'Summer Sale - 50% Off!',
        bodyContent: 'Limited time summer sale with amazing discounts!'
      },
      'Rewards Dashboard': {
        title: 'Summer Sale',
        description: 'Get 50% off selected items'
      }
    },
    startDate: null,
    endDate: null
  },
  {
    id: 2,
    title: 'Global Product Launch',
    state: 'Live',
    channels: ['Email', 'BNP', 'Rewards Dashboard'],
    markets: 'all',
    channelConfig: {
      'Email': {
        subject: 'New Product Launch!',
        bodyContent: 'Introducing our revolutionary new product'
      },
      'BNP': {
        title: 'New Product Available',
        description: 'Check out our latest innovation'
      }
    },
    startDate: new Date('2025-08-01'),
    endDate: null
  }
];

const validCampaignData = {
  title: 'Test Campaign',
  channels: ['Email'],
  markets: ['US'],
  channelConfig: {
    'Email': {
      subject: 'Test Subject',
      bodyContent: 'Test body content'
    }
  }
};

const invalidCampaignData = {
  title: '', // Invalid: empty title
  channels: ['InvalidChannel'], // Invalid: non-existent channel
  markets: ['InvalidMarket'], // Invalid: non-existent market
  channelConfig: {}
};

module.exports = {
  mockCampaigns,
  validCampaignData,
  invalidCampaignData
};
