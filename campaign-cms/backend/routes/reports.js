const express = require('express');
const { Campaign } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();

// GET /api/reports/campaigns/:id - Get performance report for specific campaign
router.get('/campaigns/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Generate mock metrics for each channel (in real implementation, this would come from analytics data)
    const channelReports = {};
    
    for (const channel of campaign.channels) {
      channelReports[channel] = generateMockMetrics(channel, campaign);
    }

    const report = {
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      state: campaign.state,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      markets: campaign.markets,
      totalChannels: campaign.channels.length,
      channelReports: channelReports,
      summary: generateSummaryMetrics(channelReports),
      generatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate campaign report',
      error: error.message
    });
  }
});

// GET /api/reports/campaigns/:id/channels/:channelName - Get channel-specific report
router.get('/campaigns/:id/channels/:channelName', async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    const { channelName } = req.params;
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (!campaign.channels.includes(channelName)) {
      return res.status(400).json({
        success: false,
        message: `Channel ${channelName} is not part of this campaign`
      });
    }

    const channelReport = generateMockMetrics(channelName, campaign, true);

    const report = {
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      channel: channelName,
      channelConfig: campaign.channelConfig[channelName] || {},
      metrics: channelReport,
      generatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate channel report',
      error: error.message
    });
  }
});

// GET /api/reports/overview - Get overview of all campaigns
router.get('/overview', async (req, res) => {
  try {
    const { dateFrom, dateTo, state, market } = req.query;
    
    // Build query filters
    const whereClause = {};
    
    if (state) {
      whereClause.state = state;
    }
    
    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) {
        whereClause.createdAt[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.createdAt[Op.lte] = new Date(dateTo);
      }
    }

    const campaigns = await Campaign.findAll({
      where: whereClause,
      order: [['updatedAt', 'DESC']]
    });

    // Filter by market if specified
    let filteredCampaigns = campaigns;
    if (market && market !== 'all') {
      filteredCampaigns = campaigns.filter(campaign => {
        if (campaign.markets === 'all') return true;
        return Array.isArray(campaign.markets) && campaign.markets.includes(market);
      });
    }

    // Generate overview statistics
    const overview = {
      totalCampaigns: filteredCampaigns.length,
      stateBreakdown: {
        Draft: filteredCampaigns.filter(c => c.state === 'Draft').length,
        Scheduled: filteredCampaigns.filter(c => c.state === 'Scheduled').length,
        Live: filteredCampaigns.filter(c => c.state === 'Live').length,
        Complete: filteredCampaigns.filter(c => c.state === 'Complete').length
      },
      channelUsage: calculateChannelUsage(filteredCampaigns),
      marketBreakdown: calculateMarketBreakdown(filteredCampaigns),
      campaignSummaries: filteredCampaigns.map(campaign => ({
        id: campaign.id,
        title: campaign.title,
        state: campaign.state,
        channels: campaign.channels,
        markets: campaign.markets,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt
      }))
    };

    res.json({
      success: true,
      data: overview,
      filters: { dateFrom, dateTo, state, market },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate overview report',
      error: error.message
    });
  }
});

// GET /api/reports/performance - Get performance metrics across campaigns
router.get('/performance', async (req, res) => {
  try {
    const campaigns = await Campaign.findAll({
      where: {
        state: ['Live', 'Complete']
      }
    });

    const performanceData = {
      totalActiveCampaigns: campaigns.filter(c => c.state === 'Live').length,
      totalCompletedCampaigns: campaigns.filter(c => c.state === 'Complete').length,
      channelPerformance: {},
      marketPerformance: calculateMarketPerformance(campaigns),
      timeSeriesData: generateTimeSeriesData(campaigns),
      topPerformingCampaigns: generateTopPerformingCampaigns(campaigns)
    };

    // Calculate channel performance
    const allChannels = ['Email', 'BNP', 'Rewards Dashboard'];
    for (const channel of allChannels) {
      const channelCampaigns = campaigns.filter(c => c.channels.includes(channel));
      performanceData.channelPerformance[channel] = {
        totalCampaigns: channelCampaigns.length,
        activeCampaigns: channelCampaigns.filter(c => c.state === 'Live').length,
        completedCampaigns: channelCampaigns.filter(c => c.state === 'Complete').length,
        avgMetrics: generateMockMetrics(channel, null)
      };
    }

    res.json({
      success: true,
      data: performanceData,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate performance report',
      error: error.message
    });
  }
});

// Helper functions for generating mock data (in production, these would connect to real analytics)

function generateMockMetrics(channel, campaign, detailed = false) {
  const baseMetrics = {
    Email: {
      sent: Math.floor(Math.random() * 10000) + 1000,
      delivered: Math.floor(Math.random() * 9000) + 900,
      opened: Math.floor(Math.random() * 3000) + 300,
      clicked: Math.floor(Math.random() * 500) + 50,
      bounced: Math.floor(Math.random() * 100) + 10,
      unsubscribed: Math.floor(Math.random() * 50) + 5
    },
    BNP: {
      impressions: Math.floor(Math.random() * 50000) + 5000,
      clicks: Math.floor(Math.random() * 1000) + 100,
      conversions: Math.floor(Math.random() * 50) + 5,
      ctr: (Math.random() * 3 + 1).toFixed(2) + '%',
      cpm: '$' + (Math.random() * 5 + 2).toFixed(2)
    },
    'Rewards Dashboard': {
      views: Math.floor(Math.random() * 20000) + 2000,
      clicks: Math.floor(Math.random() * 800) + 80,
      redemptions: Math.floor(Math.random() * 200) + 20,
      engagementRate: (Math.random() * 15 + 5).toFixed(2) + '%',
      avgTimeViewed: Math.floor(Math.random() * 60) + 30 + ' seconds'
    }
  };

  const metrics = baseMetrics[channel] || {};

  if (detailed) {
    // Add more detailed metrics for individual channel reports
    metrics.dailyBreakdown = generateDailyBreakdown();
    metrics.deviceBreakdown = generateDeviceBreakdown();
    metrics.locationBreakdown = generateLocationBreakdown();
  }

  return metrics;
}

function generateSummaryMetrics(channelReports) {
  const summary = {
    totalReach: 0,
    totalEngagement: 0,
    averagePerformance: 'Good',
    bestPerformingChannel: '',
    worstPerformingChannel: ''
  };

  let bestScore = 0;
  let worstScore = 100;

  for (const [channel, metrics] of Object.entries(channelReports)) {
    // Simple scoring based on available metrics
    let score = Math.random() * 100;
    
    if (score > bestScore) {
      bestScore = score;
      summary.bestPerformingChannel = channel;
    }
    
    if (score < worstScore) {
      worstScore = score;
      summary.worstPerformingChannel = channel;
    }

    // Add to total reach (mock calculation)
    if (metrics.sent) summary.totalReach += metrics.sent;
    if (metrics.impressions) summary.totalReach += metrics.impressions;
    if (metrics.views) summary.totalReach += metrics.views;
  }

  return summary;
}

function calculateChannelUsage(campaigns) {
  const usage = {};
  const channels = ['Email', 'BNP', 'Rewards Dashboard'];
  
  channels.forEach(channel => {
    usage[channel] = campaigns.filter(c => c.channels.includes(channel)).length;
  });

  return usage;
}

function calculateMarketBreakdown(campaigns) {
  const breakdown = {
    'all': campaigns.filter(c => c.markets === 'all').length,
    'specific': 0,
    'marketDetails': {}
  };

  const specificMarketCampaigns = campaigns.filter(c => Array.isArray(c.markets));
  breakdown.specific = specificMarketCampaigns.length;

  // Count individual markets
  const allMarkets = ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'JP'];
  allMarkets.forEach(market => {
    breakdown.marketDetails[market] = specificMarketCampaigns.filter(c => 
      c.markets.includes(market)
    ).length;
  });

  return breakdown;
}

function calculateMarketPerformance(campaigns) {
  const performance = {};
  const markets = ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'JP'];
  
  markets.forEach(market => {
    const marketCampaigns = campaigns.filter(c => 
      c.markets === 'all' || (Array.isArray(c.markets) && c.markets.includes(market))
    );
    
    performance[market] = {
      totalCampaigns: marketCampaigns.length,
      activeCampaigns: marketCampaigns.filter(c => c.state === 'Live').length,
      performance: (Math.random() * 40 + 60).toFixed(1) + '%'
    };
  });

  return performance;
}

function generateTimeSeriesData(campaigns) {
  // Generate mock time series data for the last 30 days
  const data = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      activeCampaigns: Math.floor(Math.random() * 10) + 5,
      newCampaigns: Math.floor(Math.random() * 3),
      completedCampaigns: Math.floor(Math.random() * 2)
    });
  }
  
  return data;
}

function generateTopPerformingCampaigns(campaigns) {
  return campaigns
    .slice(0, 5)
    .map(campaign => ({
      id: campaign.id,
      title: campaign.title,
      state: campaign.state,
      channels: campaign.channels,
      performanceScore: (Math.random() * 40 + 60).toFixed(1) + '%',
      totalReach: Math.floor(Math.random() * 50000) + 10000
    }));
}

function generateDailyBreakdown() {
  const days = 7;
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 1000) + 100
    });
  }
  
  return data;
}

function generateDeviceBreakdown() {
  return {
    desktop: Math.floor(Math.random() * 40) + 30 + '%',
    mobile: Math.floor(Math.random() * 40) + 30 + '%',
    tablet: Math.floor(Math.random() * 20) + 10 + '%'
  };
}

function generateLocationBreakdown() {
  return {
    'US': Math.floor(Math.random() * 30) + 20 + '%',
    'UK': Math.floor(Math.random() * 20) + 10 + '%',
    'CA': Math.floor(Math.random() * 15) + 10 + '%',
    'AU': Math.floor(Math.random() * 15) + 5 + '%',
    'Other': Math.floor(Math.random() * 20) + 10 + '%'
  };
}

module.exports = router;