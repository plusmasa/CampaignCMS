// Frontend mirror of backend CHANNEL_CONFIGS for client-side validation
// Keep this in sync with backend/utils/constants.js

export type ChannelKey = 'Email' | 'BNP' | 'Rewards Dashboard';

export type FieldSpec = {
  type: 'string' | 'text' | 'select' | 'email' | 'url' | 'datetime';
  required: boolean;
  label: string;
  options?: string[];
};

export type ChannelMeta = {
  name: ChannelKey;
  description: string;
  configFields: Record<string, FieldSpec>;
};

export const CHANNEL_CONFIGS: Record<ChannelKey, ChannelMeta> = {
  Email: {
    name: 'Email',
    description: 'Email marketing campaigns',
    configFields: {
      subject: { type: 'string', required: true, label: 'Subject Line' },
      bodyContent: { type: 'text', required: true, label: 'Email Body' },
      senderName: { type: 'string', required: false, label: 'Sender Name' },
      senderEmail: { type: 'email', required: false, label: 'Sender Email' },
      template: { type: 'select', required: false, label: 'Email Template', options: ['default', 'promotional', 'newsletter'] },
    },
  },
  BNP: {
    name: 'BNP',
    description: 'Banner and promotion displays',
    configFields: {
      title: { type: 'string', required: true, label: 'Banner Title' },
      description: { type: 'text', required: false, label: 'Banner Description' },
      linkUrl: { type: 'url', required: false, label: 'Click URL' },
      backgroundImage: { type: 'url', required: false, label: 'Background Image URL' },
      position: { type: 'select', required: false, label: 'Banner Position', options: ['top', 'middle', 'bottom', 'sidebar'] },
    },
  },
  'Rewards Dashboard': {
    name: 'Rewards Dashboard',
    description: 'Rewards dashboard promotions',
    configFields: {
      title: { type: 'string', required: true, label: 'Promotion Title' },
      description: { type: 'text', required: true, label: 'Promotion Description' },
      linkUrl: { type: 'url', required: false, label: 'Action URL' },
      backgroundImage: { type: 'url', required: false, label: 'Background Image URL' },
      scheduleStop: { type: 'datetime', required: false, label: 'Stop Display Date' },
      priority: { type: 'select', required: false, label: 'Display Priority', options: ['high', 'medium', 'low'] },
    },
  },
};
