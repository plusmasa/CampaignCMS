const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');
const { generateCampaignId } = require('../utils/id');

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
    defaultValue: () => generateCampaignId(),
    validate: {
      notEmpty: true,
      len: [1, 50]
    }
  },
  // New discriminator for multi-type campaigns
  type: {
    type: DataTypes.ENUM('OFFER', 'POLL', 'QUIZ', 'QUEST', 'HERO_BANNER'),
    allowNull: false,
    defaultValue: 'OFFER'
  },
  // Version of the seeded template/schema for the campaign type
  templateVersion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
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
    // Added 'Deleted' state for soft deletion of drafts
    type: DataTypes.ENUM('Draft', 'Scheduled', 'Live', 'Complete', 'Deleted'),
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
  partnerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  // Keep association at ORM level; avoid hard DB FK to simplify tests/migrations
  },
  // Removed per-campaign channel selection and channelConfig
  // Generic type-specific configuration JSON (discriminated by `type`)
  config: {
    type: DataTypes.JSON,
    allowNull: false,
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
  hooks: {
    // Ensure campaignId is always set on creation
    beforeValidate: async (campaign) => {
      if (!campaign.campaignId) {
        campaign.campaignId = generateCampaignId();
      }
    }
  },
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
