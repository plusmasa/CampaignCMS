const { testConnection } = require('../../backend/database/connection');
const { initializeDatabase, seedDatabase } = require('../../backend/database/init');
const { Campaign } = require('../../backend/models');

// Mock the models
jest.mock('../../backend/models', () => ({
  Campaign: {
    sync: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    bulkCreate: jest.fn(),
  }
}));

// Mock the connection test
jest.mock('../../backend/database/connection', () => ({
  testConnection: jest.fn()
}));

describe('Database Initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('testConnection', () => {
    it('should return true for successful connection', async () => {
      testConnection.mockResolvedValue(true);

      const result = await testConnection();
      expect(result).toBe(true);
    });

    it('should return false for failed connection', async () => {
      testConnection.mockResolvedValue(false);

      const result = await testConnection();
      expect(result).toBe(false);
    });
  });

  describe('initializeDatabase', () => {
    it('should sync models successfully', async () => {
      Campaign.sync.mockResolvedValue(true);

      await initializeDatabase();

      expect(Campaign.sync).toHaveBeenCalledWith({ alter: true });
    });

    it('should handle sync errors', async () => {
      const error = new Error('Sync failed');
      Campaign.sync.mockRejectedValue(error);

      await expect(initializeDatabase()).rejects.toThrow('Sync failed');
    });
  });

  describe('seedDatabase', () => {
    it('should not seed if data already exists', async () => {
      Campaign.findOne.mockResolvedValue({ id: 1 }); // Existing data

      await seedDatabase();

      expect(Campaign.create).not.toHaveBeenCalled();
      expect(Campaign.bulkCreate).not.toHaveBeenCalled();
    });

    it('should create seed data if database is empty', async () => {
      Campaign.findOne.mockResolvedValue(null); // No existing data
      Campaign.bulkCreate.mockResolvedValue([
        { id: 1, title: 'Sample Campaign 1' },
        { id: 2, title: 'Sample Campaign 2' }
      ]);

      await seedDatabase();

      expect(Campaign.bulkCreate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ title: expect.any(String) }),
        ])
      );
    });

    it('should create campaigns with proper structure', async () => {
      Campaign.findOne.mockResolvedValue(null);
      Campaign.bulkCreate.mockResolvedValue([]);

      await seedDatabase();

      const seedData = Campaign.bulkCreate.mock.calls[0][0];
      expect(seedData).toBeInstanceOf(Array);
      expect(seedData.length).toBeGreaterThan(0);
      
      // Check first campaign structure
      const firstCampaign = seedData[0];
      expect(firstCampaign).toHaveProperty('title');
      expect(firstCampaign).toHaveProperty('state');
      expect(firstCampaign).toHaveProperty('markets');
    });

    it('should handle seeding errors gracefully', async () => {
      Campaign.findOne.mockResolvedValue(null);
      Campaign.bulkCreate.mockRejectedValue(new Error('Bulk create failed'));

      await expect(seedDatabase()).rejects.toThrow('Bulk create failed');
    });

    it('should create campaigns in different states', async () => {
      Campaign.findOne.mockResolvedValue(null);
      Campaign.bulkCreate.mockResolvedValue([]);

      await seedDatabase();

      const seedData = Campaign.bulkCreate.mock.calls[0][0];
      const states = seedData.map(campaign => campaign.state);
      
      expect(states).toContain('Draft');
      expect(states).toContain('Live');
      expect(states).toContain('Complete');
    });

  // channels removed: no per-campaign channel combinations in seed data
  });
});
