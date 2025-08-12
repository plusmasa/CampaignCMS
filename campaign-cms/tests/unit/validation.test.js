const { 
  validateMarkets, 
  validateState, 
  validateTitle, 
  validateDateRange 
} = require('../../backend/utils/validation');

describe('Validation Utilities', () => {
  // channels removed: no validateChannels tests
  
  describe('validateMarkets', () => {
    it('should validate "all" markets', () => {
      expect(() => validateMarkets('all')).not.toThrow();
    });
    
    it('should validate valid market arrays', () => {
      const validMarkets = ['US', 'UK', 'CA'];
      expect(() => validateMarkets(validMarkets)).not.toThrow();
    });
    
    it('should throw error for invalid markets', () => {
      const invalidMarkets = ['US', 'InvalidMarket'];
      expect(() => validateMarkets(invalidMarkets)).toThrow('Invalid market: InvalidMarket');
    });
    
    it('should throw error if markets is not array or "all"', () => {
      expect(() => validateMarkets('US')).toThrow('Markets must be "all" or an array');
    });
  });
  
  describe('validateState', () => {
    it('should validate valid states', () => {
      expect(() => validateState('Draft')).not.toThrow();
      expect(() => validateState('Live')).not.toThrow();
    });
    
    it('should throw error for invalid state', () => {
      expect(() => validateState('InvalidState')).toThrow('Invalid state: InvalidState');
    });
  });
  
  describe('validateTitle', () => {
    it('should validate and trim valid title', () => {
      const result = validateTitle('  Valid Title  ');
      expect(result).toBe('Valid Title');
    });
    
    it('should throw error for empty title', () => {
      expect(() => validateTitle('')).toThrow('Title is required');
      expect(() => validateTitle('   ')).toThrow('Title is required');
    });
    
    it('should throw error for title too long', () => {
      const longTitle = 'a'.repeat(256);
      expect(() => validateTitle(longTitle)).toThrow('Title cannot exceed 255 characters');
    });
  });
  
  describe('validateDateRange', () => {
    it('should validate valid date range', () => {
      const startDate = '2025-08-01';
      const endDate = '2025-08-31';
      expect(() => validateDateRange(startDate, endDate)).not.toThrow();
    });
    
    it('should throw error if start date is after end date', () => {
      const startDate = '2025-08-31';
      const endDate = '2025-08-01';
      expect(() => validateDateRange(startDate, endDate)).toThrow('End date must be after start date');
    });
    
    it('should not validate if either date is missing', () => {
      expect(() => validateDateRange(null, '2025-08-31')).not.toThrow();
      expect(() => validateDateRange('2025-08-01', null)).not.toThrow();
    });
  });
});
