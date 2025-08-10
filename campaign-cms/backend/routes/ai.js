const express = require('express');
const router = express.Router();

// Simple, deterministic mock "AI" suggestion generator that adapts strings
// based on target market. This avoids external calls and keeps content safe.
function annotateString(str, market) {
  if (!str || typeof str !== 'string') return str;
  // Append a subtle market tag
  return `${str} — ${market}`;
}

function transformObjectStrings(obj, market) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map((v) => transformObjectStrings(v, market));
  if (typeof obj === 'object') {
    const out = Array.isArray(obj) ? [] : {};
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === 'string') {
        out[k] = annotateString(v, market);
      } else if (v && typeof v === 'object') {
        out[k] = transformObjectStrings(v, market);
      } else {
        out[k] = v;
      }
    }
    return out;
  }
  return obj;
}

// Type-aware shaping: ensure required arrays/fields exist so suggestions are usable
function suggestForType(type, sourceConfig, market) {
  const safeSource = sourceConfig && typeof sourceConfig === 'object' ? sourceConfig : {};
  let suggestion;
  switch (String(type || 'OFFER').toUpperCase()) {
  case 'POLL': {
    const question = safeSource.question || 'Which do you prefer?';
    const options = Array.isArray(safeSource.options) && safeSource.options.length >= 2
      ? [safeSource.options[0], safeSource.options[1]]
      : ['Option A', 'Option B'];
    suggestion = {
      question: annotateString(question, market),
      options: options.map((o) => annotateString(o, market)).slice(0, 2),
      recordSelection: safeSource.recordSelection ?? true,
    };
    break;
  }
  case 'QUIZ': {
    const questions = Array.isArray(safeSource.questions) && safeSource.questions.length > 0
      ? safeSource.questions
      : new Array(3).fill(null).map((_, i) => ({
        prompt: `Question ${i + 1}`,
        choices: ['Choice 1', 'Choice 2', 'Choice 3'],
        correctIndex: 0,
      }));
    suggestion = {
      questions: questions.slice(0, Math.max(3, questions.length)).map((q) => ({
        prompt: annotateString(q.prompt || 'Question', market),
        choices: (Array.isArray(q.choices) ? q.choices : ['Choice 1', 'Choice 2', 'Choice 3']).map((c) => annotateString(c, market)).slice(0, 3),
        correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
      })),
    };
    break;
  }
  case 'QUEST': {
    const display = safeSource.display || { image: '', header: 'Quest', description: 'Complete tasks' };
    const actions = Array.isArray(safeSource.actions) && safeSource.actions.length === 4
      ? safeSource.actions
      : new Array(4).fill(null).map((_, i) => ({
        key: `action_${i + 1}`,
        header: `Action ${i + 1}`,
        description: `Do action ${i + 1}`,
        images: { complete: '', incomplete: '' },
      }));
    const reward = safeSource.reward || { type: 'points', value: '100' };
    suggestion = {
      display: transformObjectStrings(display, market),
      actions: actions.map((a) => transformObjectStrings(a, market)),
      reward: transformObjectStrings(reward, market),
    };
    break;
  }
  case 'OFFER':
  default: {
    const banners = Array.isArray(safeSource.banners) && safeSource.banners.length > 0
      ? safeSource.banners
      : [{ imageUrl: '', header: 'Special offer', description: 'Don\'t miss out' }];
    suggestion = {
      banners: banners.map((b) => ({
        imageUrl: b.imageUrl || '',
        header: annotateString(b.header || 'Header', market),
        description: annotateString(b.description || 'Description', market),
      })),
    };
    break;
  }
  }
  return suggestion;
}

// POST /api/ai/suggest - Generate suggested content for a new market based on a source config
// Body: { type: 'OFFER'|'POLL'|'QUIZ'|'QUEST', sourceConfig: object, targetMarket: string }
router.post('/suggest', (req, res) => {
  try {
    const { type, sourceConfig, targetMarket } = req.body || {};
    if (!targetMarket || typeof targetMarket !== 'string') {
      return res.status(400).json({ success: false, message: 'targetMarket is required' });
    }
    if (!type || typeof type !== 'string') {
      return res.status(400).json({ success: false, message: 'type is required' });
    }
    const config = suggestForType(type, sourceConfig || {}, targetMarket);
    return res.json({ success: true, data: { market: targetMarket, config } });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Failed to generate suggestion', error: e.message });
  }
});

module.exports = router;
