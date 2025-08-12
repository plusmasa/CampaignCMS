// Campaign Types: templates, presets, and helpers

const latestTemplateVersion = 1;

const TYPES = [
  { type: 'OFFER', label: 'Offer', presets: [] },
  { type: 'POLL', label: 'Poll', presets: [] },
  { type: 'QUIZ', label: 'Quiz', presets: [
    { label: 'Quiz 3', questionCount: 3 },
    { label: 'Quiz 10', questionCount: 10 }
  ] },
  { type: 'QUEST', label: 'Quest', presets: [] },
  // Placeholder for future work: disabled until implemented
  { type: 'HERO_BANNER', label: 'Dashboard Hero Banner', presets: [], disabled: true }
];

function getTypes() {
  return TYPES;
}

function templateFor(type, preset) {
  switch (type) {
  case 'OFFER':
    return { config: { banners: [{ imageUrl: '', header: '', description: '', cta: '', sku: '', formLabel: '' }] }, templateVersion: latestTemplateVersion };
  case 'POLL':
    return { config: { question: '', options: ['', ''], recordSelection: true }, templateVersion: latestTemplateVersion };
  case 'QUIZ': {
    const allowed = [3, 10];
    const qCount = preset && Number(preset.questionCount);
    const count = allowed.includes(qCount) ? qCount : 3;
    const questions = Array.from({ length: count }, () => ({ prompt: '', choices: ['', '', ''], correctIndex: 0 }));
    return { config: { questions }, templateVersion: latestTemplateVersion };
  }
  case 'QUEST': {
    const actions = ['A', 'B', 'C', 'D'].map((key) => ({ key, header: '', description: '', images: { complete: '', incomplete: '' } }));
    return { config: { actions, reward: { type: '', value: '' }, display: { image: '', header: '', description: '' } }, templateVersion: latestTemplateVersion };
  }
  case 'HERO_BANNER': {
    // Placeholder template for future implementation
    return { config: { imageUrl: '', headline: '', subtext: '', cta: { label: '', url: '' } }, templateVersion: latestTemplateVersion };
  }
  default:
    throw new Error(`Unsupported type: ${type}`);
  }
}

function hasMeaningfulConfig(type, config) {
  if (!config || typeof config !== 'object') return false;
  switch (type) {
  case 'OFFER':
    return Array.isArray(config.banners) && config.banners.some((b) => (b.imageUrl || b.header || b.description || b.cta || b.sku || b.formLabel));
  case 'POLL':
    return Boolean((config.question && config.question.trim()) || (Array.isArray(config.options) && config.options.some((o) => o && o.trim())));
  case 'QUIZ':
    return Array.isArray(config.questions) && config.questions.some((q) => (q.prompt && q.prompt.trim()) || (Array.isArray(q.choices) && q.choices.some((c) => c && c.trim())));
  case 'QUEST':
    return Boolean(
      (Array.isArray(config.actions) && config.actions.some((a) => (a.header && a.header.trim()) || (a.description && a.description.trim()))) ||
      (config.reward && (config.reward.type || config.reward.value)) ||
      (config.display && (config.display.image || config.display.header || config.display.description))
    );
  case 'HERO_BANNER':
    return Boolean(config.imageUrl || config.headline || (config.cta && (config.cta.label || config.cta.url)));
  default:
    return false;
  }
}

module.exports = { getTypes, templateFor, latestTemplateVersion, hasMeaningfulConfig };
