// Shared badge styles for campaign states to keep visuals consistent across the app
export type CampaignState = 'Draft' | 'Scheduled' | 'Live' | 'Complete' | 'Deleted';

export type BadgeStyle = {
  appearance: 'filled' | 'outline' | 'tint' | 'ghost';
  color: 'brand' | 'danger' | 'important' | 'informative' | 'severe' | 'subtle' | 'success' | 'warning';
};

export const STATE_BADGE: Record<CampaignState, BadgeStyle> = {
  Draft: { appearance: 'tint', color: 'informative' },
  Scheduled: { appearance: 'outline', color: 'important' },
  Live: { appearance: 'filled', color: 'success' },
  Complete: { appearance: 'outline', color: 'success' },
  Deleted: { appearance: 'ghost', color: 'subtle' },
};

export function getBadgeStyle(state?: string): BadgeStyle {
  const known = ['Draft', 'Scheduled', 'Live', 'Complete', 'Deleted'] as const;
  const normalized = (state || 'Draft') as CampaignState;
  return (known as readonly string[]).includes(normalized) ? STATE_BADGE[normalized] : STATE_BADGE.Draft;
}
