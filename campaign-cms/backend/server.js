const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Database imports
const { testConnection } = require('./database/connection');
const { initializeDatabase, seedDatabase } = require('./database/init');

// Route imports
const campaignRoutes = require('./routes/campaigns');

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_PORT = process.env.FRONTEND_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/campaigns', campaignRoutes);

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

// Start server with database initialization
async function startServer() {
  try {
    // Test database connection
    console.log('🔗 Testing database connection...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }
    
    // Initialize database
    console.log('🏗️ Setting up database...');
    await initializeDatabase();
    
    // Seed database with sample data
    await seedDatabase();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Campaign CMS Backend API running on port ${PORT}`);
      console.log(`📱 Frontend: http://localhost:${FRONTEND_PORT}`);
      console.log(`🔧 API Health: http://localhost:${PORT}/api/health`);
      console.log(`🗄️ Database Health: http://localhost:${PORT}/api/db-health`);
      console.log(`📊 Campaigns API: http://localhost:${PORT}/api/campaigns`);
      console.log('✅ Phase 2: Database setup complete!');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
