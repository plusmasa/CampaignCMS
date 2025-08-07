const { VALID_CHANNELS, VALID_MARKETS, VALID_STATES } = require('../../backend/utils/constants');

describe('Constants', () => {
  describe('VALID_CHANNELS', () => {
    it('should contain expected channel types', () => {
      expect(VALID_CHANNELS).toContain('Email');
      expect(VALID_CHANNELS).toContain('BNP');
      expect(VALID_CHANNELS).toContain('Rewards Dashboard');
    });

    it('should be an array', () => {
      expect(Array.isArray(VALID_CHANNELS)).toBe(true);
    });

    it('should have at least 3 channels', () => {
      expect(VALID_CHANNELS.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('VALID_MARKETS', () => {
    it('should contain expected market codes', () => {
      expect(VALID_MARKETS).toContain('US');
      expect(VALID_MARKETS).toContain('UK');
      expect(VALID_MARKETS).toContain('CA');
    });

    it('should be an array', () => {
      expect(Array.isArray(VALID_MARKETS)).toBe(true);
    });

    it('should have multiple markets', () => {
      expect(VALID_MARKETS.length).toBeGreaterThan(1);
    });
  });

  describe('VALID_STATES', () => {
    it('should contain expected campaign states', () => {
      expect(VALID_STATES).toContain('Draft');
      expect(VALID_STATES).toContain('Scheduled');
      expect(VALID_STATES).toContain('Live');
      expect(VALID_STATES).toContain('Complete');
    });

    it('should be an array', () => {
      expect(Array.isArray(VALID_STATES)).toBe(true);
    });

    it('should have exactly 4 states', () => {
      expect(VALID_STATES).toHaveLength(4);
    });

    it('should maintain proper state order for workflow', () => {
      const expectedOrder = ['Draft', 'Scheduled', 'Live', 'Complete'];
      expectedOrder.forEach(state => {
        expect(VALID_STATES).toContain(state);
      });
    });
  });

  describe('Constants Integration', () => {
    it('should export all required constants', () => {
      expect(VALID_CHANNELS).toBeDefined();
      expect(VALID_MARKETS).toBeDefined();
      expect(VALID_STATES).toBeDefined();
    });

    it('should have no duplicate values in channels', () => {
      const uniqueChannels = [...new Set(VALID_CHANNELS)];
      expect(uniqueChannels).toHaveLength(VALID_CHANNELS.length);
    });

    it('should have no duplicate values in markets', () => {
      const uniqueMarkets = [...new Set(VALID_MARKETS)];
      expect(uniqueMarkets).toHaveLength(VALID_MARKETS.length);
    });

    it('should have no duplicate values in states', () => {
      const uniqueStates = [...new Set(VALID_STATES)];
      expect(uniqueStates).toHaveLength(VALID_STATES.length);
    });
  });
});
