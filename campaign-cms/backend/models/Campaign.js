const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Campaign = sequelize.define('Campaign', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  campaignId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 50]
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  state: {
    type: DataTypes.ENUM('Draft', 'Scheduled', 'Live', 'Complete'),
    allowNull: false,
    defaultValue: 'Draft'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  channels: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    validate: {
      isValidChannels(value) {
        const validChannels = ['Email', 'BNP', 'Rewards Dashboard'];
        if (!Array.isArray(value)) {
          throw new Error('Channels must be an array');
        }
        for (const channel of value) {
          if (!validChannels.includes(channel)) {
            throw new Error(`Invalid channel: ${channel}. Must be one of: ${validChannels.join(', ')}`);
          }
        }
      }
    }
  },
  markets: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: 'all',
    validate: {
      isValidMarkets(value) {
        if (value === 'all') return;
        if (!Array.isArray(value)) {
          throw new Error('Markets must be "all" or an array of market names');
        }
        const validMarkets = ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'JP'];
        for (const market of value) {
          if (!validMarkets.includes(market)) {
            throw new Error(`Invalid market: ${market}. Must be one of: ${validMarkets.join(', ')}`);
          }
        }
      }
    }
  },
  channelConfig: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'campaigns',
  timestamps: true,
  validate: {
    // Custom validation for date ranges
    dateRangeValid() {
      // Only validate if both dates exist
      if (this.startDate && this.endDate && this.startDate >= this.endDate) {
        throw new Error('End date must be after start date');
      }
    }
  }
});

module.exports = Campaign;
