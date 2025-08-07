const request = require('supertest');
const express = require('express');
const reportRoutes = require('../../backend/routes/reports');
const { Campaign } = require('../../backend/models');

// Mock the Campaign model
jest.mock('../../backend/models', () => ({
  Campaign: {
    findByPk: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
  }
}));

const app = express();
app.use(express.json());
app.use('/api/reports', reportRoutes);

describe('Reports Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/reports/campaigns/:id', () => {
    it('should return campaign performance report', async () => {
      const mockCampaign = {
        id: 1,
        title: 'Test Campaign',
        state: 'Live',
        channels: ['Email', 'BNP'],
        markets: ['US', 'CA'],
        startDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      Campaign.findByPk.mockResolvedValue(mockCampaign);

      const response = await request(app)
        .get('/api/reports/campaigns/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('campaign');
      expect(response.body.data).toHaveProperty('performance');
      expect(response.body.data).toHaveProperty('metrics');
    });

    it('should return 404 for non-existent campaign', async () => {
      Campaign.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/reports/campaigns/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should include channel-specific metrics', async () => {
      const mockCampaign = {
        id: 1,
        channels: ['Email', 'BNP'],
        state: 'Complete'
      };

      Campaign.findByPk.mockResolvedValue(mockCampaign);

      const response = await request(app)
        .get('/api/reports/campaigns/1');

      expect(response.body.data.performance).toHaveProperty('channels');
      expect(response.body.data.performance.channels).toHaveProperty('Email');
      expect(response.body.data.performance.channels).toHaveProperty('BNP');
    });
  });

  describe('GET /api/reports/campaigns/:id/channels/:channel', () => {
    it('should return channel-specific performance report', async () => {
      const mockCampaign = {
        id: 1,
        channels: ['Email', 'BNP'],
        state: 'Live'
      };

      Campaign.findByPk.mockResolvedValue(mockCampaign);

      const response = await request(app)
        .get('/api/reports/campaigns/1/channels/Email');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('channel', 'Email');
      expect(response.body.data).toHaveProperty('metrics');
    });

    it('should return 400 for invalid channel', async () => {
      const mockCampaign = {
        id: 1,
        channels: ['Email']
      };

      Campaign.findByPk.mockResolvedValue(mockCampaign);

      const response = await request(app)
        .get('/api/reports/campaigns/1/channels/InvalidChannel');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not configured');
    });
  });

  describe('GET /api/reports/summary', () => {
    it('should return overall campaign summary', async () => {
      Campaign.count.mockImplementation(({ where }) => {
        if (where.state === 'Draft') return Promise.resolve(5);
        if (where.state === 'Live') return Promise.resolve(3);
        if (where.state === 'Complete') return Promise.resolve(12);
        if (where.state === 'Scheduled') return Promise.resolve(2);
        return Promise.resolve(22);
      });

      const response = await request(app)
        .get('/api/reports/summary');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalCampaigns');
      expect(response.body.data).toHaveProperty('campaignsByState');
      expect(response.body.data.campaignsByState).toHaveProperty('Draft');
      expect(response.body.data.campaignsByState).toHaveProperty('Live');
    });

    it('should include performance metrics', async () => {
      Campaign.count.mockResolvedValue(10);

      const response = await request(app)
        .get('/api/reports/summary');

      expect(response.body.data).toHaveProperty('performance');
      expect(response.body.data.performance).toHaveProperty('avgDuration');
      expect(response.body.data.performance).toHaveProperty('successRate');
    });
  });

  describe('GET /api/reports/analytics', () => {
    it('should return campaign analytics data', async () => {
      const mockCampaigns = [
        { id: 1, state: 'Complete', channels: ['Email'], markets: ['US'], createdAt: new Date() },
        { id: 2, state: 'Live', channels: ['BNP'], markets: ['UK'], createdAt: new Date() }
      ];

      Campaign.findAll.mockResolvedValue(mockCampaigns);

      const response = await request(app)
        .get('/api/reports/analytics');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('channelDistribution');
      expect(response.body.data).toHaveProperty('marketDistribution');
      expect(response.body.data).toHaveProperty('stateDistribution');
    });

    it('should support date range filtering', async () => {
      const startDate = '2025-01-01';
      const endDate = '2025-12-31';
      
      Campaign.findAll.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/reports/analytics')
        .query({ startDate, endDate });

      expect(response.status).toBe(200);
      expect(Campaign.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.any(Object)
          })
        })
      );
    });
  });

  describe('POST /api/reports/campaigns/:id/generate', () => {
    it('should generate a new report for campaign', async () => {
      const mockCampaign = {
        id: 1,
        title: 'Test Campaign',
        state: 'Complete'
      };

      Campaign.findByPk.mockResolvedValue(mockCampaign);

      const response = await request(app)
        .post('/api/reports/campaigns/1/generate')
        .send({ includeDetails: true });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('reportId');
      expect(response.body.data).toHaveProperty('generatedAt');
    });

    it('should support different report formats', async () => {
      const mockCampaign = { id: 1, state: 'Complete' };
      Campaign.findByPk.mockResolvedValue(mockCampaign);

      const response = await request(app)
        .post('/api/reports/campaigns/1/generate')
        .send({ format: 'detailed', includeCharts: true });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('format', 'detailed');
    });
  });
});
