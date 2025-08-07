const { sequelize, Campaign } = require('../models');

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Sync all models with the database
    await sequelize.sync({ force: false });
    
    console.log('✅ Database initialized successfully');
    console.log('📊 Tables created: campaigns');
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with sample data...');
    
    // Check if we already have data
    const existingCampaigns = await Campaign.count();
    if (existingCampaigns > 0) {
      console.log('📋 Database already contains data, skipping seed');
      return true;
    }
    
    // Create sample campaigns
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
    ];
    
    await Campaign.bulkCreate(sampleCampaigns);
    
    console.log(`✅ Successfully seeded ${sampleCampaigns.length} sample campaigns`);
    return true;
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    return false;
  }
}

module.exports = {
  initializeDatabase,
  seedDatabase
};
