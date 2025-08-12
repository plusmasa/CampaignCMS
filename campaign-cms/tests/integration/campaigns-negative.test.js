const request = require('supertest');
const express = require('express');
const { Campaign } = require('../../backend/models');
const campaignRoutes = require('../../backend/routes/campaigns');
const { initializeDatabase } = require('../../backend/database/init');

const app = express();
app.use(express.json());
app.use('/api/campaigns', campaignRoutes);

describe('Campaigns API - negative branches', () => {
  beforeAll(async () => {
    await initializeDatabase();
  });

  beforeEach(async () => {
    await Campaign.destroy({ where: {} });
  });

  test('PUT /:id/config returns 422 on Ajv validation failure', async () => {
  const c = await Campaign.create({ title: 'Bad Offer', markets: ['US'], type: 'OFFER', config: { banners: [] } });
    const res = await request(app)
      .put(`/api/campaigns/${c.id}/config`)
      .send({ config: { banners: [] } });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Validation failed');
  });

  test('POST /:id/duplicate with invalid type returns 400', async () => {
  const c = await Campaign.create({ title: 'X', markets: ['US'] });
    const res = await request(app)
      .post(`/api/campaigns/${c.id}/duplicate?type=NOT_A_TYPE`);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Failed to duplicate');
  });
});
