const request = require('supertest');
const express = require('express');
const channelRoutes = require('../../backend/routes/channel-management');

const app = express();
app.use(express.json());
app.use('/api/channels', channelRoutes);

describe('Channel Management Routes', () => {
  describe('GET /api/channels', () => {
    it('should return available channels', async () => {
      const response = await request(app)
        .get('/api/channels');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('channels');
      expect(Array.isArray(response.body.data.channels)).toBe(true);
      expect(response.body.data.channels).toContain('Email');
      expect(response.body.data.channels).toContain('BNP');
      expect(response.body.data.channels).toContain('Rewards Dashboard');
    });

    it('should include channel configurations', async () => {
      const response = await request(app)
        .get('/api/channels');

      expect(response.body.data).toHaveProperty('configurations');
      expect(response.body.data.configurations).toHaveProperty('Email');
      expect(response.body.data.configurations).toHaveProperty('BNP');
      expect(response.body.data.configurations).toHaveProperty('Rewards Dashboard');
    });
  });

  describe('GET /api/channels/:channel/config', () => {
    it('should return Email channel configuration', async () => {
      const response = await request(app)
        .get('/api/channels/Email/config');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('channel', 'Email');
      expect(response.body.data).toHaveProperty('config');
      expect(response.body.data.config).toHaveProperty('fields');
    });

    it('should return BNP channel configuration', async () => {
      const response = await request(app)
        .get('/api/channels/BNP/config');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('channel', 'BNP');
      expect(response.body.data.config).toHaveProperty('fields');
    });

    it('should return Rewards Dashboard channel configuration', async () => {
      const response = await request(app)
        .get('/api/channels/Rewards%20Dashboard/config');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('channel', 'Rewards Dashboard');
    });

    it('should return 400 for invalid channel', async () => {
      const response = await request(app)
        .get('/api/channels/InvalidChannel/config');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid channel');
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
    it('should return validation rules for channels and markets', async () => {
      const response = await request(app)
        .get('/api/channels/validation');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('validChannels');
      expect(response.body.data).toHaveProperty('validMarkets');
      expect(response.body.data).toHaveProperty('validStates');
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
