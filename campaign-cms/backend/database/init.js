const { Campaign } = require('../models');

async function initializeDatabase() {
  try {
    // Sync Campaign model with alter to match tests
    await Campaign.sync({ alter: true });
    return true;
  } catch (error) {
    throw error;
  }
}

async function seedDatabase() {
  try {
    // Check if we already have any campaign
    const existing = await Campaign.findOne();
    if (existing) {
      return true;
    }

    const sampleCampaigns = [
      {
        campaignId: 'CAMP-2025-SS-001',
        title: 'Summer Sale 2025',
        state: 'Draft',
        channels: ['Email', 'BNP'],
        markets: ['US', 'CA'],
        startDate: new Date('2025-08-15'),
        endDate: new Date('2025-08-31'),
        channelConfig: {
          Email: { template: 'summer_sale_template' },
          BNP: { position: 'hero', priority: 'high' }
        }
      },
      {
        campaignId: 'CAMP-2025-BTS-002',
        title: 'Back to School Campaign',
        state: 'Scheduled',
        channels: ['Email', 'Rewards Dashboard'],
        markets: 'all',
        startDate: new Date('2025-08-20'),
        endDate: new Date('2025-09-10'),
        channelConfig: {
          Email: { template: 'back_to_school_template' },
          'Rewards Dashboard': { section: 'featured' }
        }
      },
      {
        campaignId: 'CAMP-2025-HP-003',
        title: 'Holiday Preview',
        state: 'Live',
        channels: ['BNP', 'Rewards Dashboard'],
        markets: ['US', 'UK', 'CA'],
        startDate: new Date('2025-08-01'),
        endDate: null, // Runs indefinitely until manually stopped
        channelConfig: {
          BNP: { position: 'sidebar', priority: 'medium' },
          'Rewards Dashboard': { section: 'seasonal' }
        }
      }
      ,
      {
        campaignId: 'CAMP-2025-CMP-004',
        title: 'Spring Wrap-up',
        state: 'Complete',
        channels: ['Email'],
        markets: ['DE', 'FR'],
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-04-01'),
        channelConfig: {
          Email: { template: 'newsletter' }
        }
      }
    ];
    
    await Campaign.bulkCreate(sampleCampaigns);
    return true;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  initializeDatabase,
  seedDatabase
};
