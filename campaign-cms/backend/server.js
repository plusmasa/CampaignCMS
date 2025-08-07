const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Database imports
const { testConnection } = require('./database/connection');
const { initializeDatabase, seedDatabase } = require('./database/init');
const { globalErrorHandler } = require('./utils/middleware');
const { logger } = require('./utils/logger');

// Route imports
const campaignRoutes = require('./routes/campaigns');
const workflowRoutes = require('./routes/campaign-workflow');
const channelRoutes = require('./routes/channel-management');
const reportRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_PORT = process.env.FRONTEND_PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || `http://localhost:${FRONTEND_PORT}`;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Determine if we're in Codespaces
const isCodespaces = !!(process.env.CODESPACE_NAME && process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN);

// Configure CORS for different environments
const corsOptions = {
  origin: isCodespaces 
    ? true // Allow all origins in Codespaces due to dynamic URLs
    : [FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
};

if (NODE_ENV === 'development') {
  logger.info('CORS Configuration:', corsOptions);
  logger.info(`Environment: ${NODE_ENV}`);
  logger.info(`Codespaces: ${isCodespaces ? 'Yes' : 'No'}`);
}

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/campaigns', campaignRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/reports', reportRoutes);

// Basic route for testing
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Campaign CMS API is running',
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

// Database health check
app.get('/api/db-health', async (req, res) => {
  try {
    const isConnected = await testConnection();
    res.json({
      status: isConnected ? 'OK' : 'ERROR',
      message: isConnected ? 'Database connection successful' : 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Global error handler (must be last)
app.use(globalErrorHandler);

// Start server with database initialization
async function startServer() {
  try {
    // Test database connection
    logger.info('Testing database connection...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }
    
    // Initialize database
    logger.info('Setting up database...');
    await initializeDatabase();
    
    // Seed database with sample data
    await seedDatabase();
    
    // Start the server
    app.listen(PORT, () => {
      logger.info(`Campaign CMS Backend API running on port ${PORT}`);
      logger.info(`Environment: ${NODE_ENV}`);
      logger.info(`Frontend: ${FRONTEND_URL}`);
      logger.info(`API Health: http://localhost:${PORT}/api/health`);
      logger.info(`Database Health: http://localhost:${PORT}/api/db-health`);
      logger.info(`Campaigns API: http://localhost:${PORT}/api/campaigns`);
      
      if (isCodespaces) {
        logger.info('🚀 Running in GitHub Codespaces!');
        logger.info(`Visit the forwarded port ${PORT} to access the application`);
      }
      
      logger.info('Phase 3.5: Code Quality Improvements complete!');
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
