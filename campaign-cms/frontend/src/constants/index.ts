// Frontend constants that should match backend constants
// These should be kept in sync with backend/utils/constants.js

export const AVAILABLE_CHANNELS = ['Email', 'BNP', 'Rewards Dashboard'] as const;
export const AVAILABLE_MARKETS = ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'JP'] as const;
export const CAMPAIGN_STATES = ['Draft', 'Scheduled', 'Live', 'Complete'] as const;

// API endpoints
export const API_ENDPOINTS = {
  campaigns: '/campaigns',
  health: '/health',
  dbHealth: '/db-health',
  channels: '/channels',
} as const;

// UI Constants
export const TABLE_PAGE_SIZES = [5, 10, 25, 50] as const;
export const DEFAULT_PAGE_SIZE = 10;

// Validation constants  
export const TITLE_MAX_LENGTH = 255;
export const TITLE_MIN_LENGTH = 3;
