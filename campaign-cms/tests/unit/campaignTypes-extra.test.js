const { templateFor, hasMeaningfulConfig } = require('../../backend/utils/campaignTypes');

describe('campaignTypes helpers', () => {
  test('templateFor QUIZ with preset 10 yields 10 questions', () => {
    const t = templateFor('QUIZ', { questionCount: 10 });
    expect(t.config.questions.length).toBe(10);
  });

  test('templateFor OFFER provides seeded banner', () => {
    const t = templateFor('OFFER');
    expect(Array.isArray(t.config.banners)).toBe(true);
    expect(t.config.banners.length).toBe(1);
  });

  test('templateFor POLL provides two options and recordSelection', () => {
    const t = templateFor('POLL');
    expect(Array.isArray(t.config.options)).toBe(true);
    expect(t.config.options.length).toBe(2);
    expect(typeof t.config.recordSelection).toBe('boolean');
  });

  test('templateFor QUEST provides 4 actions and reward/display', () => {
    const t = templateFor('QUEST');
    expect(Array.isArray(t.config.actions)).toBe(true);
    expect(t.config.actions.length).toBe(4);
    expect(t.config.reward).toBeTruthy();
    expect(t.config.display).toBeTruthy();
  });

  test('hasMeaningfulConfig true for OFFER with non-empty header', () => {
    const cfg = { banners: [{ imageUrl: '', header: 'X', description: '' }] };
    expect(hasMeaningfulConfig('OFFER', cfg)).toBe(true);
  });

  test('hasMeaningfulConfig false for OFFER with empty fields', () => {
    const cfg = { banners: [{ imageUrl: '', header: '', description: '' }] };
    expect(hasMeaningfulConfig('OFFER', cfg)).toBe(false);
  });

  test('hasMeaningfulConfig true for POLL if question provided', () => {
    const cfg = { question: 'Q', options: ['', ''], recordSelection: true };
    expect(hasMeaningfulConfig('POLL', cfg)).toBe(true);
  });

  test('hasMeaningfulConfig true for QUIZ if a choice has content', () => {
    const cfg = { questions: [{ prompt: '', choices: ['x', '', ''], correctIndex: 0 }] };
    expect(hasMeaningfulConfig('QUIZ', cfg)).toBe(true);
  });

  test('hasMeaningfulConfig true for QUEST if display populated', () => {
    const cfg = { actions: [], reward: { type: '', value: '' }, display: { image: 'i', header: '', description: '' } };
    expect(hasMeaningfulConfig('QUEST', cfg)).toBe(true);
  });
});
