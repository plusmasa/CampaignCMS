const request = require('supertest');
const express = require('express');
const { Campaign } = require('../../backend/models');
const campaignRoutes = require('../../backend/routes/campaigns');
const campaignTypesRoutes = require('../../backend/routes/campaign-types');
const { initializeDatabase } = require('../../backend/database/init');

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/campaigns', campaignRoutes);
  app.use('/api/campaign-types', campaignTypesRoutes);
  return app;
};

describe('Campaign Types API & Type-aware flows', () => {
  let app;

  beforeAll(async () => {
    await initializeDatabase();
    app = createTestApp();
  });

  beforeEach(async () => {
    await Campaign.destroy({ where: {} });
  });

  it('GET /api/campaign-types lists types and presets', async () => {
    const res = await request(app).get('/api/campaign-types').expect(200);
    expect(res.body.success).toBe(true);
    const types = res.body.data.map((t) => t.type);
    expect(types).toEqual(expect.arrayContaining(['OFFER', 'POLL', 'QUIZ', 'QUEST']));
  });

  it('POST /api/campaigns creates a QUIZ with preset and seeds config', async () => {
    const res = await request(app)
      .post('/api/campaigns')
      .send({ title: 'Quiz Campaign', channels: [], markets: 'all', type: 'QUIZ', preset: { questionCount: 10 } })
      .expect(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.type).toBe('QUIZ');
    expect(Array.isArray(res.body.data.config.questions)).toBe(true);
    expect(res.body.data.config.questions).toHaveLength(10);
  });

  it('PUT /api/campaigns/:id/config validates and saves config', async () => {
    const create = await request(app)
      .post('/api/campaigns')
      .send({ title: 'Quiz', channels: [], markets: 'all', type: 'QUIZ', preset: { questionCount: 3 } })
      .expect(201);
    const id = create.body.data.id;

    // Invalid: wrong correctIndex
    const bad = await request(app)
      .put(`/api/campaigns/${id}/config`)
      .send({ config: { questions: [{ prompt: 'p', choices: ['a','b','c'], correctIndex: 5 }] } })
      .expect(422);
    expect(bad.body.success).toBe(false);

    // Valid: fix correctIndex and supply full array length
    const good = await request(app)
      .put(`/api/campaigns/${id}/config`)
      .send({ config: { questions: [
        { prompt: 'Q1', choices: ['a','b','c'], correctIndex: 1 },
        { prompt: 'Q2', choices: ['a','b','c'], correctIndex: 2 },
        { prompt: 'Q3', choices: ['a','b','c'], correctIndex: 0 }
      ] } })
      .expect(200);
    expect(good.body.success).toBe(true);
  });

  it('POST /api/campaigns/:id/duplicate can convert to another type', async () => {
    const created = await request(app)
      .post('/api/campaigns')
      .send({ title: 'Offer', channels: [], markets: 'all', type: 'OFFER' })
      .expect(201);
    const id = created.body.data.id;

    const dup = await request(app)
      .post(`/api/campaigns/${id}/duplicate?type=QUIZ`)
      .expect(201);
    expect(dup.body.success).toBe(true);
    expect(dup.body.data.type).toBe('QUIZ');
  });

  it('PATCH /api/campaigns/:id/type allows change only when empty Draft', async () => {
    const created = await request(app)
      .post('/api/campaigns')
      .send({ title: 'New', channels: [], markets: 'all', type: 'OFFER' })
      .expect(201);
    const id = created.body.data.id;

    // Allowed: empty config
    const change = await request(app)
      .patch(`/api/campaigns/${id}/type`)
      .send({ type: 'POLL' })
      .expect(200);
    expect(change.body.success).toBe(true);

    // Make config meaningful
    await request(app)
      .put(`/api/campaigns/${id}/config`)
      .send({ config: { question: 'Q', options: ['A','B'], recordSelection: true } })
      .expect(200);

    // Now changing type should be blocked
    const blocked = await request(app)
      .patch(`/api/campaigns/${id}/type`)
      .send({ type: 'QUIZ' })
      .expect(409);
    expect(blocked.body.success).toBe(false);
  });
});
