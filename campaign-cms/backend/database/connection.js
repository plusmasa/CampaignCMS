const { Sequelize } = require('sequelize');
const path = require('path');

// Create SQLite database connection
const isTest = process.env.NODE_ENV === 'test';
const sequelize = new Sequelize({
  dialect: 'sqlite',
  // Use in-memory DB for tests to avoid cross-process file locking during parallel Jest workers
  storage: isTest ? ':memory:' : path.join(__dirname, '../data/campaign_cms.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

// Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    return false;
  }
}

module.exports = {
  sequelize,
  testConnection
};
