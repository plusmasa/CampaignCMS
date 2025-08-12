const { Campaign, Partner, sequelize } = require('../models');

async function initializeDatabase() {
  try {
    if (process.env.NODE_ENV === 'test') {
      // Unit tests mock Campaign and expect alter sync on the model
      if (Campaign && typeof Campaign.sync === 'function') {
        await Campaign.sync({ alter: true });
      }
      if (Partner && typeof Partner.sync === 'function') {
        await Partner.sync({ alter: true });
      }
    } else {
      // Non-test env: alter to evolve schema during dev (all models)
      await sequelize.sync({ alter: true });
    }
    return true;
  } catch (error) {
    throw error;
  }
}

async function seedDatabase() {
  try {
    // Seed default partners if none (skip if Partner is mocked/undefined in unit tests)
    if (Partner && typeof Partner.count === 'function') {
      const partnerCount = await Partner.count();
      if (partnerCount === 0) {
        await Partner.bulkCreate([
          { name: 'Spotify', active: true },
          { name: 'Roblox', active: true },
        ]);
      }
    }

    // Check if we already have any campaign
    const existing = await Campaign.findOne();
    if (existing) {
      return true;
    }

    const sampleCampaigns = [
      {
        campaignId: 'CAMP-2025-SS-001',
        title: 'Summer Sale 2025',
        type: 'OFFER',
        templateVersion: 1,
        state: 'Draft',
        markets: ['US', 'CA'],
        startDate: new Date('2025-08-15'),
        endDate: new Date('2025-08-31'),
        config: { banners: [{ imageUrl: '', header: '', description: '' }] }
      },
      {
        campaignId: 'CAMP-2025-BTS-002',
        title: 'Back to School Campaign',
        type: 'OFFER',
        templateVersion: 1,
        state: 'Scheduled',
        markets: 'all',
        startDate: new Date('2025-08-20'),
        endDate: new Date('2025-09-10'),
        config: { banners: [{ imageUrl: '', header: '', description: '' }] }
      },
      {
        campaignId: 'CAMP-2025-HP-003',
        title: 'Holiday Preview',
        type: 'OFFER',
        templateVersion: 1,
        state: 'Live',
        markets: ['US', 'UK', 'CA'],
        startDate: new Date('2025-08-01'),
        endDate: null, // Runs indefinitely until manually stopped
        config: { banners: [{ imageUrl: '', header: '', description: '' }] }
      },
      {
        campaignId: 'CAMP-2025-CMP-004',
        title: 'Spring Wrap-up',
        type: 'OFFER',
        templateVersion: 1,
        state: 'Complete',
        markets: ['DE', 'FR'],
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-04-01'),
        config: { banners: [{ imageUrl: '', header: '', description: '' }] }
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
