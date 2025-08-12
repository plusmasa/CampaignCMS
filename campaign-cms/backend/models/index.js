const { sequelize } = require('../database/connection');
const Campaign = require('./Campaign');
const Partner = require('./Partner');

// Import all models here
const models = { Campaign, Partner };

// Associations
Campaign.belongsTo(Partner, { foreignKey: 'partnerId', as: 'partner', constraints: false });
Partner.hasMany(Campaign, { foreignKey: 'partnerId', as: 'campaigns', constraints: false });

module.exports = {
  sequelize,
  ...models
};
