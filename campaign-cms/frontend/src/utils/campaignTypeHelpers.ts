import type { CampaignType } from '../types/Campaign';

export function typeLabel(t?: CampaignType): string {
  switch (t) {
    case 'OFFER':
      return 'Offer';
    case 'POLL':
      return 'Poll';
    case 'QUIZ':
      return 'Quiz';
    case 'QUEST':
      return 'Quest';
    default:
      return '—';
  }
}

// Mirrors backend/utils/campaignTypes.hasMeaningfulConfig
export function hasMeaningfulConfig(type?: CampaignType, config?: unknown): boolean {
  if (!type || !config || typeof config !== 'object') return false;
  switch (type) {
    case 'OFFER': {
      const c = config as { banners?: Array<{ imageUrl?: string; header?: string; description?: string }> };
      return Array.isArray(c.banners) && c.banners.some((b) => Boolean(b?.imageUrl || b?.header || b?.description));
    }
    case 'POLL': {
      const c = config as { question?: string; options?: string[] };
      return Boolean((c.question && String(c.question).trim()) || (Array.isArray(c.options) && c.options.some((o) => o && String(o).trim())));
    }
    case 'QUIZ': {
      const c = config as { questions?: Array<{ prompt?: string; choices?: string[] }> };
      return Array.isArray(c.questions) && c.questions.some((q) => (q?.prompt && String(q.prompt).trim()) || (Array.isArray(q?.choices) && q.choices.some((ch) => ch && String(ch).trim())));
    }
    case 'QUEST': {
      const c = config as {
        actions?: Array<{ header?: string; description?: string }>;
        reward?: { type?: string; value?: string };
        display?: { image?: string; header?: string; description?: string };
      };
      return Boolean(
        (Array.isArray(c.actions) && c.actions.some((a) => (a?.header && String(a.header).trim()) || (a?.description && String(a.description).trim()))) ||
        (c.reward && (c.reward.type || c.reward.value)) ||
        (c.display && (c.display.image || c.display.header || c.display.description))
      );
    }
    default:
      return false;
  }
}
