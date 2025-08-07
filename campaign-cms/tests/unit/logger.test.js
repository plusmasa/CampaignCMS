const { logger } = require('../../backend/utils/logger');

describe('Logger Utility', () => {
  let consoleSpy;
  
  beforeEach(() => {
    // Mock console methods
    consoleSpy = {
      error: jest.spyOn(console, 'error').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      log: jest.spyOn(console, 'log').mockImplementation()
    };
  });
  
  afterEach(() => {
    // Restore console methods
    Object.values(consoleSpy).forEach(spy => spy.mockRestore());
  });
  
  describe('in test environment', () => {
    it('should not log any messages in test environment', () => {
      logger.error('Error message');
      logger.warn('Warning message');
      logger.info('Info message');
      logger.debug('Debug message');
      
      expect(consoleSpy.error).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });
  });
  
  describe('logger functions exist', () => {
    it('should have all required logging methods', () => {
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });
    
    it('should accept message and context parameters', () => {
      // These should not throw errors
      expect(() => logger.error('test')).not.toThrow();
      expect(() => logger.warn('test', {})).not.toThrow();
      expect(() => logger.info('test', { key: 'value' })).not.toThrow();
      expect(() => logger.debug('test', { context: 'data' })).not.toThrow();
    });
  });
});
