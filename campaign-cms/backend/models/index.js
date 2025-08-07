const { sequelize } = require('../database/connection');
const Campaign = require('./Campaign');

// Import all models here
const models = {
  Campaign
};

// Define associations here if needed in the future
// Example: Campaign.hasMany(Report);

module.exports = {
  sequelize,
  ...models
};
