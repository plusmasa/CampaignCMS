const request = require('supertest');
const express = require('express');
const channelRoutes = require('../../backend/routes/channel-management');

const app = express();
app.use(express.json());
app.use('/api/channels', channelRoutes);

describe('Channel Management Routes', () => {
  describe('GET /api/channels', () => {
    it('should return 410 as channels are removed', async () => {
      const response = await request(app)
        .get('/api/channels');

      expect(response.status).toBe(410);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/channels/:channel/config', () => {
    it('should return 410 for any channel config request', async () => {
      const response = await request(app)
        .get('/api/channels/InvalidChannel/config');

      expect(response.status).toBe(410);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/channels/markets', () => {
    it('should return available markets', async () => {
      const response = await request(app)
        .get('/api/channels/markets');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('markets');
      expect(Array.isArray(response.body.data.markets)).toBe(true);
      expect(response.body.data.markets).toContain('US');
      expect(response.body.data.markets).toContain('UK');
      expect(response.body.data.markets).toContain('CA');
    });

    it('should include market configurations', async () => {
      const response = await request(app)
        .get('/api/channels/markets');

      expect(response.body.data).toHaveProperty('configurations');
      expect(response.body.data.configurations).toHaveProperty('US');
      expect(response.body.data.configurations.US).toHaveProperty('timezone');
      expect(response.body.data.configurations.US).toHaveProperty('currency');
    });
  });

  describe('GET /api/channels/validation', () => {
    it('should return validation rules for markets and states (channels empty)', async () => {
      const response = await request(app)
        .get('/api/channels/validation');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('validChannels');
      expect(response.body.data).toHaveProperty('validMarkets');
      expect(response.body.data).toHaveProperty('validStates');
      expect(response.body.data.validChannels).toEqual([]);
    });

    it('should return arrays of valid options', async () => {
      const response = await request(app)
        .get('/api/channels/validation');

  const { data } = response.body;
  expect(Array.isArray(data.validChannels)).toBe(true);
  expect(Array.isArray(data.validMarkets)).toBe(true);
  expect(Array.isArray(data.validStates)).toBe(true);
    });
  });
});
