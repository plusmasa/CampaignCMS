const request = require('supertest');
const express = require('express');
const workflowRoutes = require('../../backend/routes/campaign-workflow');
const { Campaign } = require('../../backend/models');

// Mock the Campaign model
jest.mock('../../backend/models', () => ({
  Campaign: {
    findByPk: jest.fn(),
    update: jest.fn(),
  }
}));

const app = express();
app.use(express.json());
app.use('/api/workflow', workflowRoutes);

describe('Campaign Workflow Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT /api/workflow/campaigns/:id/transition', () => {
    it('should transition campaign from Draft to Scheduled', async () => {
      const mockCampaign = {
        id: 1,
        title: 'Test Campaign',
        state: 'Draft',
        markets: ['US'],
        save: jest.fn().mockResolvedValue(true)
      };

      Campaign.findByPk.mockResolvedValue(mockCampaign);

      const response = await request(app)
        .put('/api/workflow/campaigns/1/transition')
        .send({ newState: 'Scheduled' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockCampaign.state).toBe('Scheduled');
    });

    it('should return 404 for non-existent campaign', async () => {
      Campaign.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/workflow/campaigns/999/transition')
        .send({ newState: 'Scheduled' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should validate state transitions', async () => {
      const mockCampaign = {
        id: 1,
        state: 'Complete',
        save: jest.fn()
      };

      Campaign.findByPk.mockResolvedValue(mockCampaign);

      const response = await request(app)
        .put('/api/workflow/campaigns/1/transition')
        .send({ newState: 'Draft' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid state transition');
    });

    it('should require newState parameter', async () => {
      const response = await request(app)
        .put('/api/workflow/campaigns/1/transition')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('newState is required');
    });
  });

  describe('POST /api/workflow/campaigns/:id/schedule', () => {
    it('should schedule a campaign with valid dates', async () => {
      const mockCampaign = {
        id: 1,
        state: 'Draft',
        type: 'OFFER',
        config: { banners: [{ imageUrl: '', header: '', description: '' }] },
        startDate: null,
        endDate: null,
        save: jest.fn().mockResolvedValue(true)
      };

      Campaign.findByPk.mockResolvedValue(mockCampaign);

      const startDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Tomorrow
      const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // Next week

      const response = await request(app)
        .post('/api/workflow/campaigns/1/schedule')
        .send({ startDate, endDate });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockCampaign.state).toBe('Scheduled');
    });

    it('should reject past start dates', async () => {
      const mockCampaign = {
        id: 1,
        state: 'Draft'
      };

      Campaign.findByPk.mockResolvedValue(mockCampaign);

      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Yesterday

      const response = await request(app)
        .post('/api/workflow/campaigns/1/schedule')
        .send({ startDate: pastDate });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('future');
    });

  // channels removed: no per-channel config gating anymore
  });

  describe('POST /api/workflow/campaigns/:id/stop', () => {
    it('should stop a live campaign', async () => {
      const mockCampaign = {
        id: 1,
        state: 'Live',
        endDate: null,
        save: jest.fn().mockResolvedValue(true)
      };

      Campaign.findByPk.mockResolvedValue(mockCampaign);

      const response = await request(app)
        .post('/api/workflow/campaigns/1/stop');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockCampaign.state).toBe('Complete');
      expect(mockCampaign.endDate).toBeTruthy();
    });

    it('should not stop non-live campaigns', async () => {
      const mockCampaign = {
        id: 1,
        state: 'Draft'
      };

      Campaign.findByPk.mockResolvedValue(mockCampaign);

      const response = await request(app)
        .post('/api/workflow/campaigns/1/stop');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Only Live campaigns can be stopped');
    });
  });

  describe('GET /api/workflow/campaigns/:id/history', () => {
    it('should return campaign workflow history', async () => {
      const mockCampaign = {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        state: 'Live',
        startDate: new Date(),
        endDate: null
      };

      Campaign.findByPk.mockResolvedValue(mockCampaign);

      const response = await request(app)
        .get('/api/workflow/campaigns/1/history');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('transitions');
    });
  });
});
