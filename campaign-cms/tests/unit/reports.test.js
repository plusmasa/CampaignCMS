const request = require('supertest');
const express = require('express');
const reportRoutes = require('../../backend/routes/reports');

const app = express();
app.use(express.json());
app.use('/api/reports', reportRoutes);

describe('Reports Routes (Placeholder)', () => {
  const expectPlaceholder = (res) => {
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({ message: 'Your report will appear here.' });
  };

  it('GET /api/reports/campaigns/:id returns placeholder', async () => {
    const res = await request(app).get('/api/reports/campaigns/1');
    expectPlaceholder(res);
  });

  // channels removed: no per-channel report endpoint

  it('GET /api/reports/overview returns placeholder', async () => {
    const res = await request(app).get('/api/reports/overview');
    expectPlaceholder(res);
  });

  it('GET /api/reports/performance returns placeholder', async () => {
    const res = await request(app).get('/api/reports/performance');
    expectPlaceholder(res);
  });

  it('GET /api/reports/summary returns placeholder', async () => {
    const res = await request(app).get('/api/reports/summary');
    expectPlaceholder(res);
  });

  it('GET /api/reports/analytics returns placeholder', async () => {
    const res = await request(app).get('/api/reports/analytics');
    expectPlaceholder(res);
  });

  it('POST /api/reports/campaigns/:id/generate returns placeholder', async () => {
    const res = await request(app).post('/api/reports/campaigns/1/generate').send({ format: 'detailed' });
    expectPlaceholder(res);
  });
});
