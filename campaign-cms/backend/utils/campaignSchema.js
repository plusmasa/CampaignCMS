const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// JSON Schemas per type
const OFFER_SCHEMA = {
  type: 'object',
  properties: {
    banners: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          imageUrl: { type: 'string' },
          header: { type: 'string' },
          description: { type: 'string' },
          cta: { type: 'string' },
          sku: { type: 'string' },
          formLabel: { type: 'string' }
        },
        additionalProperties: false
      },
      minItems: 1
    }
  },
  required: ['banners'],
  additionalProperties: false
};

const POLL_SCHEMA = {
  type: 'object',
  properties: {
    question: { type: 'string' },
    options: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 2 },
    recordSelection: { type: 'boolean' }
  },
  required: ['question', 'options', 'recordSelection'],
  additionalProperties: false
};

const QUIZ_SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      minItems: 3,
      items: {
        type: 'object',
        properties: {
          prompt: { type: 'string' },
          choices: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 },
          correctIndex: { type: 'integer', enum: [0, 1, 2] }
        },
        required: ['prompt', 'choices', 'correctIndex'],
        additionalProperties: false
      }
    }
  },
  required: ['questions'],
  additionalProperties: false
};

const QUEST_SCHEMA = {
  type: 'object',
  properties: {
    actions: {
      type: 'array',
      minItems: 4,
      maxItems: 4,
      items: {
        type: 'object',
        properties: {
          key: { type: 'string' },
          header: { type: 'string' },
          description: { type: 'string' },
          cooldownDays: { type: ['integer', 'null'], minimum: 0 },
          images: {
            type: 'object',
            properties: {
              complete: { type: 'string' },
              incomplete: { type: 'string' }
            },
            additionalProperties: false,
            required: ['complete', 'incomplete']
          }
        },
        required: ['key', 'header', 'description', 'images'],
        additionalProperties: false
      }
    },
    reward: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        value: { type: 'string' }
      },
      required: ['type', 'value'],
      additionalProperties: false
    },
    display: {
      type: 'object',
      properties: {
        image: { type: 'string' },
        header: { type: 'string' },
        description: { type: 'string' }
      },
      required: ['image', 'header', 'description'],
      additionalProperties: false
    }
  },
  required: ['actions', 'reward', 'display'],
  additionalProperties: false
};

const validators = {
  OFFER: ajv.compile(OFFER_SCHEMA),
  POLL: ajv.compile(POLL_SCHEMA),
  QUIZ: ajv.compile(QUIZ_SCHEMA),
  QUEST: ajv.compile(QUEST_SCHEMA),
  // Placeholder schema for HERO_BANNER (disabled type). Keep permissive for now if ever used.
  HERO_BANNER: ajv.compile({
    type: 'object',
    properties: {
      imageUrl: { type: 'string' },
      headline: { type: 'string' },
      subtext: { type: 'string' },
      cta: {
        type: 'object',
        properties: { label: { type: 'string' }, url: { type: 'string' } },
        required: ['label', 'url'],
        additionalProperties: false
      }
    },
    required: ['imageUrl', 'headline', 'cta'],
    additionalProperties: false
  })
};

const ALLOWED_MARKETS = ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'JP'];

function validateConfig(type, config) {
  const validator = validators[type];
  if (!validator) {
    return { valid: false, errors: [{ message: `Unsupported type: ${type}` }] };
  }

  // Support legacy single-config (no variants key)
  if (!config || typeof config !== 'object' || !Array.isArray(config.variants)) {
    const valid = validator(config);
    return { valid, errors: validator.errors || [] };
  }

  // Variant-based config: { variants: [{ market?: string, config: TypeConfig, id?: string }] }
  const variants = config.variants;
  if (!Array.isArray(variants) || variants.length < 1) {
    return { valid: false, errors: [{ message: 'At least one content variant is required' }] };
  }
  // Validate each variant's config against type schema; collect markets and enforce uniqueness (excluding empty)
  const seen = new Set();
  for (let i = 0; i < variants.length; i++) {
    const v = variants[i] || {};
    // Validate market if provided (drafts may omit; workflow gating will enforce later)
    if (v.market !== undefined && v.market !== null && v.market !== '') {
      if (!ALLOWED_MARKETS.includes(v.market)) {
        return { valid: false, errors: [{ message: `Invalid market in variant #${i + 1}: ${v.market}` }] };
      }
      if (seen.has(v.market)) {
        return { valid: false, errors: [{ message: `Duplicate market across variants: ${v.market}` }] };
      }
      seen.add(v.market);
    }
    const ok = validator(v.config || {});
    if (!ok) {
      // Bubble up the first variant error with index context
      const errs = (validator.errors || []).map(e => ({ message: `(variant #${i + 1}) ${e.message}` }));
      return { valid: false, errors: errs };
    }
  }
  return { valid: true, errors: [] };
}

module.exports = { validateConfig, ALLOWED_MARKETS };
