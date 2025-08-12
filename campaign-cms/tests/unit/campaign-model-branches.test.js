const { Campaign } = require('../../backend/models');
const { Sequelize } = require('sequelize');

describe('Campaign Model - validation branches', () => {
  // Use isolated in-memory DB to exercise model validations
  beforeAll(async () => {
    Campaign.sequelize = new Sequelize('sqlite::memory:', { logging: false });
    await Campaign.sync({ force: true });
  });

  afterAll(async () => {
    await Campaign.sequelize.close();
  });

  beforeEach(async () => {
    await Campaign.destroy({ where: {} });
  });

  // channels removed: no channel validation

  test('invalid market value rejects with validation error', async () => {
    await expect(Campaign.create({
      title: 'Invalid Market',
      markets: ['XX']
    })).rejects.toThrow(/Invalid market/);
  });

  test('dateRangeValid rejects when endDate <= startDate', async () => {
    const start = new Date(Date.now() + 24 * 60 * 60 * 1000); // tomorrow
    const end = new Date(Date.now()); // now
    await expect(Campaign.create({
      title: 'Bad Dates',
      markets: ['US'],
      startDate: start,
      endDate: end
    })).rejects.toThrow(/End date must be after start date/);
  });

  test('beforeValidate sets campaignId automatically on create', async () => {
    const c = await Campaign.create({
      title: 'Auto ID',
      markets: ['US']
    });
    expect(typeof c.campaignId).toBe('string');
    expect(c.campaignId.length).toBeGreaterThan(0);
    expect(c.campaignId.length).toBeLessThanOrEqual(50);
  });

  test('markets "all" passes validation', async () => {
    const c = await Campaign.create({
      title: 'All Markets',
      markets: 'all'
    });
    expect(c.markets).toBe('all');
  });
});
