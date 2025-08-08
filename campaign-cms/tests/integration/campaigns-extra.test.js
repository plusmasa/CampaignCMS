const request = require('supertest');
const express = require('express');
const { Campaign } = require('../../backend/models');
const campaignRoutes = require('../../backend/routes/campaigns');
const { initializeDatabase } = require('../../backend/database/init');

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/campaigns', campaignRoutes);
  return app;
};

describe('Campaigns API Integration - extra cases', () => {
  let app;

  beforeAll(async () => {
    await initializeDatabase();
    app = createTestApp();
  });

  beforeEach(async () => {
    await Campaign.destroy({ where: {} });
  });

  it('filters by market and includes campaigns with markets="all"', async () => {
    await Campaign.bulkCreate([
      { title: 'A', channels: ['Email'], markets: ['US'] },
      { title: 'B', channels: ['BNP'], markets: 'all' },
      { title: 'C', channels: ['Email'], markets: ['UK'] }
    ]);

    const res = await request(app)
      .get('/api/campaigns?market=US')
      .expect(200);

    expect(res.body.success).toBe(true);
    const titles = res.body.data.map(c => c.title).sort();
    expect(titles).toEqual(['A', 'B']);
  });

  it('sorts and paginates', async () => {
    await Campaign.bulkCreate([
      { title: 'C1', channels: ['Email'], markets: ['US'], updatedAt: new Date('2025-01-01') },
      { title: 'C2', channels: ['Email'], markets: ['US'], updatedAt: new Date('2025-02-01') },
      { title: 'C3', channels: ['Email'], markets: ['US'], updatedAt: new Date('2025-03-01') }
    ], { validate: false });

    const res = await request(app)
      .get('/api/campaigns?sortBy=updatedAt&sortOrder=ASC&limit=2&page=2')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.currentPage).toBe(2);
    expect(res.body.pagination.hasPrevPage).toBe(true);
  });

  it('prevents direct state changes on PUT', async () => {
    const c = await Campaign.create({ title: 'X', channels: ['Email'], markets: ['US'] });
    const res = await request(app)
      .put(`/api/campaigns/${c.id}`)
      .send({ state: 'Live' })
      .expect(400);
    expect(res.body.message).toContain('workflow endpoints');
  });

  it('duplicate campaign endpoint creates a new Draft copy', async () => {
    const original = await Campaign.create({ title: 'Original', channels: ['Email'], markets: ['US'] });
    const res = await request(app)
      .post(`/api/campaigns/${original.id}/duplicate`)
      .expect(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toContain('(copy)');
    expect(res.body.data.state).toBe('Draft');
  });

  it('GET /api/campaigns/:id returns 404 for non-existent campaign', async () => {
    const res = await request(app)
      .get('/api/campaigns/9999')
      .expect(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Campaign not found');
  });

  it('GET /api/campaigns/by-state/:state returns 400 for invalid state', async () => {
    const res = await request(app)
      .get('/api/campaigns/by-state/UnknownState')
      .expect(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid state');
  });

  it('applies channel filter branch even when no campaigns match', async () => {
    await Campaign.bulkCreate([
      { title: 'NoEmail1', channels: ['BNP'], markets: ['US'] },
      { title: 'NoEmail2', channels: ['Rewards Dashboard'], markets: ['UK'] }
    ]);
    const res = await request(app)
      .get('/api/campaigns?channel=Email')
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });
});
