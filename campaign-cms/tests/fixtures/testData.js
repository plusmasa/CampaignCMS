// Test data fixtures
const mockCampaigns = [
  {
    id: 1,
    title: 'Summer Sale Campaign',
    state: 'Draft',
    markets: ['US', 'CA'],
    startDate: null,
    endDate: null
  },
  {
    id: 2,
    title: 'Global Product Launch',
    state: 'Live',
    markets: 'all',
    startDate: new Date('2025-08-01'),
    endDate: null
  }
];

const validCampaignData = {
  title: 'Test Campaign',
  markets: ['US']
};

const invalidCampaignData = {
  title: '', // Invalid: empty title
  markets: ['InvalidMarket'], // Invalid: non-existent market
};

module.exports = {
  mockCampaigns,
  validCampaignData,
  invalidCampaignData
};
