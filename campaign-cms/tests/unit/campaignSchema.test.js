const { validateConfig } = require('../../backend/utils/campaignSchema');

describe('validateConfig', () => {
  test('legacy OFFER config passes valid schema', () => {
    const cfg = { banners: [{ imageUrl: '', header: 'H', description: 'D' }] };
    const { valid, errors } = validateConfig('OFFER', cfg);
    expect(valid).toBe(true);
    expect(errors).toEqual([]);
  });

  test('legacy POLL invalid (only one option) fails', () => {
    const cfg = { question: 'Q', options: ['A'], recordSelection: true };
    const { valid, errors } = validateConfig('POLL', cfg);
    expect(valid).toBe(false);
    expect(errors.length).toBeGreaterThan(0);
  });

  test('variants: invalid market value fails', () => {
    const cfg = { variants: [{ market: 'XX', config: { banners: [{ imageUrl: '', header: 'H', description: 'D' }] } }] };
    const { valid, errors } = validateConfig('OFFER', cfg);
    expect(valid).toBe(false);
    expect(errors[0].message).toMatch(/Invalid market/);
  });

  test('variants: duplicate market fails', () => {
    const cfg = {
      variants: [
        { market: 'US', config: { banners: [{ imageUrl: '', header: 'H', description: 'D' }] } },
        { market: 'US', config: { banners: [{ imageUrl: '', header: 'H2', description: 'D2' }] } }
      ]
    };
    const { valid, errors } = validateConfig('OFFER', cfg);
    expect(valid).toBe(false);
    expect(errors[0].message).toMatch(/Duplicate market/);
  });

  test('variants: valid unique markets pass', () => {
    const cfg = {
      variants: [
        { market: 'US', config: { banners: [{ imageUrl: '', header: 'H', description: 'D' }] } },
        { market: 'UK', config: { banners: [{ imageUrl: '', header: 'H2', description: 'D2' }] } }
      ]
    };
    const { valid, errors } = validateConfig('OFFER', cfg);
    expect(valid).toBe(true);
    expect(errors).toEqual([]);
  });
});
