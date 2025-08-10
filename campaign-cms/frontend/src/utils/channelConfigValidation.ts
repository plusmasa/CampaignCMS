import type { Channel } from '../types/Campaign';
import { CHANNEL_CONFIGS, type ChannelKey } from '../constants/channelConfigs';

export type ChannelConfig = Record<string, Record<string, unknown>> & { bingUrl?: string };

const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

export function validateChannelConfig(channels: Channel[], channelConfig: ChannelConfig | undefined) {
  const errors: string[] = [];
  const cc = channelConfig || {};
  for (const ch of channels) {
    const meta = CHANNEL_CONFIGS[ch as ChannelKey];
    if (!meta) continue;
    const provided = (cc as Record<string, Record<string, unknown>>)[ch] || {};
    for (const [key, spec] of Object.entries(meta.configFields)) {
      const v = provided[key];
      if (spec.required) {
        const missing = v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
        if (missing) {
          errors.push(`Channel ${ch}: ${spec.label || key} is required`);
          continue;
        }
      }
      if (v !== undefined && v !== null && isNonEmptyString(v)) {
        if (spec.type === 'email') {
          const ok = /.+@.+\..+/.test(v);
          if (!ok) errors.push(`Channel ${ch}: ${spec.label || key} must be a valid email`);
        } else if (spec.type === 'url') {
          const ok = /^(https?:\/\/|\/\/|\/).+/.test(v);
          if (!ok) errors.push(`Channel ${ch}: ${spec.label || key} must be a valid URL`);
        }
      }
    }
  }
  return errors;
}
