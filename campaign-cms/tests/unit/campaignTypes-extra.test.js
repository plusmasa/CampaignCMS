const { templateFor, hasMeaningfulConfig } = require('../../backend/utils/campaignTypes');

describe('campaignTypes helpers', () => {
  test('templateFor QUIZ with preset 10 yields 10 questions', () => {
    const t = templateFor('QUIZ', { questionCount: 10 });
    expect(t.config.questions.length).toBe(10);
  });

  test('hasMeaningfulConfig true for OFFER with non-empty header', () => {
    const cfg = { banners: [{ imageUrl: '', header: 'X', description: '' }] };
    expect(hasMeaningfulConfig('OFFER', cfg)).toBe(true);
  });

  test('hasMeaningfulConfig false for OFFER with empty fields', () => {
    const cfg = { banners: [{ imageUrl: '', header: '', description: '' }] };
    expect(hasMeaningfulConfig('OFFER', cfg)).toBe(false);
  });
});
