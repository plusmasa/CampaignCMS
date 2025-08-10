const request = require('supertest');
const express = require('express');
const aiRoutes = require('../../backend/routes/ai');

const app = express();
app.use(express.json());
app.use('/api/ai', aiRoutes);

describe('AI Suggest Route', () => {
  it('returns 400 when targetMarket is missing', async () => {
    const res = await request(app)
      .post('/api/ai/suggest')
      .send({ type: 'OFFER', sourceConfig: {} });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when type is missing', async () => {
    const res = await request(app)
      .post('/api/ai/suggest')
      .send({ targetMarket: 'US', sourceConfig: {} });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('generates OFFER suggestion with market annotation', async () => {
    const res = await request(app)
      .post('/api/ai/suggest')
      .send({
        type: 'OFFER',
        targetMarket: 'US',
        sourceConfig: { banners: [{ imageUrl: '', header: 'Hello', description: 'World' }] }
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const b0 = res.body.data.config.banners[0];
    expect(b0.header).toMatch(/ — US$/);
    expect(b0.description).toMatch(/ — US$/);
  });

  it('generates POLL suggestion with shaped defaults and annotation', async () => {
    const res = await request(app)
      .post('/api/ai/suggest')
      .send({ type: 'POLL', targetMarket: 'UK', sourceConfig: {} });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const cfg = res.body.data.config;
    expect(Array.isArray(cfg.options)).toBe(true);
    expect(cfg.options.length).toBe(2);
    expect(cfg.question).toMatch(/ — UK$/);
  });

  it('generates QUIZ suggestion with default 3 questions and annotation', async () => {
    const res = await request(app)
      .post('/api/ai/suggest')
      .send({ type: 'QUIZ', targetMarket: 'CA', sourceConfig: {} });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const cfg = res.body.data.config;
    expect(Array.isArray(cfg.questions)).toBe(true);
    expect(cfg.questions.length).toBeGreaterThanOrEqual(3);
    expect(cfg.questions[0].prompt).toMatch(/ — CA$/);
  });
});
