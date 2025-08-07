const request = require('supertest');
const express = require('express');
const { Campaign } = require('../../backend/models');
const campaignRoutes = require('../../backend/routes/campaigns');
const { initializeDatabase } = require('../../backend/database/init');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/campaigns', campaignRoutes);
  return app;
};

describe('Campaigns API Integration', () => {
  let app;
  
  beforeAll(async () => {
    // Initialize in-memory database
    await initializeDatabase();
    app = createTestApp();
  });
  
  beforeEach(async () => {
    // Clear database before each test
    await Campaign.destroy({ where: {} });
  });
  
  describe('GET /api/campaigns', () => {
    it('should return empty array when no campaigns exist', async () => {
      const response = await request(app)
        .get('/api/campaigns')
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.totalCount).toBe(0);
    });
    
    it('should return campaigns with pagination', async () => {
      // Create test campaigns
      await Campaign.create({
        title: 'Campaign 1',
        channels: ['Email'],
        markets: ['US']
      });
      
      await Campaign.create({
        title: 'Campaign 2',
        channels: ['BNP'],
        markets: ['UK']
      });
      
      const response = await request(app)
        .get('/api/campaigns?limit=10&page=1')
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.totalCount).toBe(2);
      expect(response.body.pagination.currentPage).toBe(1);
    });
    
    it('should filter campaigns by state', async () => {
      await Campaign.create({
        title: 'Draft Campaign',
        state: 'Draft',
        channels: ['Email'],
        markets: ['US']
      });
      
      await Campaign.create({
        title: 'Live Campaign',
        state: 'Live',
        channels: ['Email'],
        markets: ['US']
      });
      
      const response = await request(app)
        .get('/api/campaigns?state=Draft')
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Draft Campaign');
    });
  });
  
  describe('POST /api/campaigns', () => {
    it('should create a new campaign with valid data', async () => {
      const campaignData = {
        title: 'Test Campaign',
        channels: ['Email', 'BNP'],
        markets: ['US', 'UK'],
        channelConfig: {
          'Email': {
            subject: 'Test Subject'
          }
        }
      };
      
      const response = await request(app)
        .post('/api/campaigns')
        .send(campaignData)
        .expect(201);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Campaign');
      expect(response.body.data.state).toBe('Draft');
      expect(response.body.data.channels).toEqual(['Email', 'BNP']);
    });
    
    it('should reject campaign with invalid title', async () => {
      const campaignData = {
        title: '',
        channels: ['Email'],
        markets: ['US']
      };
      
      const response = await request(app)
        .post('/api/campaigns')
        .send(campaignData)
        .expect(400);
        
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Failed to create campaign');
      expect(response.body.error).toContain('Title is required');
    });
    
    it('should reject campaign with invalid channels', async () => {
      const campaignData = {
        title: 'Test Campaign',
        channels: ['InvalidChannel'],
        markets: ['US']
      };
      
      const response = await request(app)
        .post('/api/campaigns')
        .send(campaignData)
        .expect(400);
        
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Failed to create campaign');
      expect(response.body.error).toContain('Invalid channel');
    });
  });
  
  describe('PUT /api/campaigns/:id', () => {
    it('should update existing campaign', async () => {
      const campaign = await Campaign.create({
        title: 'Original Title',
        channels: ['Email'],
        markets: ['US']
      });
      
      const updateData = {
        title: 'Updated Title',
        channels: ['Email', 'BNP']
      };
      
      const response = await request(app)
        .put(`/api/campaigns/${campaign.id}`)
        .send(updateData)
        .expect(200);
        
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Title');
      expect(response.body.data.channels).toEqual(['Email', 'BNP']);
    });
    
    it('should return 404 for non-existent campaign', async () => {
      const response = await request(app)
        .put('/api/campaigns/999')
        .send({ title: 'Updated Title' })
        .expect(404);
        
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Campaign not found');
    });
  });
  
  describe('DELETE /api/campaigns/:id', () => {
    it('should delete draft campaign', async () => {
      const campaign = await Campaign.create({
        title: 'Draft Campaign',
        state: 'Draft',
        channels: ['Email'],
        markets: ['US']
      });
      
      const response = await request(app)
        .delete(`/api/campaigns/${campaign.id}`)
        .expect(200);
        
      expect(response.body.success).toBe(true);
      
      // Verify campaign is deleted
      const deletedCampaign = await Campaign.findByPk(campaign.id);
      expect(deletedCampaign).toBeNull();
    });
    
    it('should not delete non-draft campaign', async () => {
      const campaign = await Campaign.create({
        title: 'Live Campaign',
        state: 'Live',
        channels: ['Email'],
        markets: ['US']
      });
      
      const response = await request(app)
        .delete(`/api/campaigns/${campaign.id}`)
        .expect(400);
        
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Only Draft campaigns can be deleted');
    });
  });
});
