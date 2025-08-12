import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button,
  Radio,
  RadioGroup,
  makeStyles,
  shorthands,
  Spinner,
  MessageBar,
} from '@fluentui/react-components';
import { Header } from '../components/Header';
import { LeftNavigation } from '../components/LeftNavigation';
import { campaignService, typesService } from '../services/api';

interface CampaignTypeInfo {
  type: 'OFFER' | 'POLL' | 'QUIZ' | 'QUEST' | 'HERO_BANNER';
  label: string;
  presets: Array<{ label: string; questionCount?: number }>
  disabled?: boolean;
}

// UI option for flattened type selection (e.g., QUIZ:3, QUIZ:10)
type TypeOption = {
  id: string; // e.g., 'OFFER' | 'QUIZ:3'
  type: CampaignTypeInfo['type'];
  label: string;
  preset?: { questionCount?: number };
  disabled?: boolean;
};

const useStyles = makeStyles({
  root: { display: 'flex', height: '100vh', overflow: 'hidden' },
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column' },
  content: { flex: 1, display: 'flex', flexDirection: 'column', ...shorthands.padding('0', '24px') },
  panel: { width: '100%', margin: '16px 0', ...shorthands.padding(0), border: 'none', borderRadius: 0 },
  actions: { display: 'flex', justifyContent: 'flex-start', ...shorthands.gap('8px'), marginTop: '16px' },
  presetRow: { marginTop: '12px' },
});

export const NewCampaign: React.FC = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [types, setTypes] = useState<CampaignTypeInfo[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await typesService.getTypes();
        if (!res.success) throw new Error(res.message || 'Failed to load types');
        const loaded = res.data || [];
        setTypes(loaded);
        // Deep link preselect -> map (type,preset) to option id
        const type = searchParams.get('type');
        const preset = searchParams.get('preset');
  if (type && ['OFFER', 'POLL', 'QUIZ', 'QUEST', 'HERO_BANNER'].includes(type)) {
          if (type === 'QUIZ') {
            const count = preset && !Number.isNaN(Number(preset)) ? Number(preset) : undefined;
            const id = count ? `QUIZ:${count}` : 'QUIZ:3';
            setSelectedOptionId(id);
          } else {
            setSelectedOptionId(type);
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load types';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [searchParams]);

  const options: TypeOption[] = useMemo(() => {
    const opts: TypeOption[] = [];
    for (const t of types) {
      if (t.type === 'QUIZ' && Array.isArray(t.presets) && t.presets.length) {
        for (const p of t.presets) {
          const count = typeof p.questionCount === 'number' ? p.questionCount : undefined;
          if (!count) continue;
          const label = `Quiz - ${count} question${count === 1 ? '' : 's'}`;
          opts.push({ id: `QUIZ:${count}`, type: 'QUIZ', label, preset: { questionCount: count } });
        }
      } else {
        opts.push({ id: t.type, type: t.type, label: t.label, disabled: t.disabled });
      }
    }
    return opts;
  }, [types]);

  const onContinue = async () => {
    if (!selectedOptionId) return;
    try {
      setCreating(true);
      setError(null);
      const selected = options.find(o => o.id === selectedOptionId);
      if (!selected) throw new Error('No type selected');
      const payload = {
        title: 'Untitled Campaign',
        markets: 'all' as const,
        type: selected.type,
        preset: selected.preset,
      };
      const res = await campaignService.createCampaign(payload);
      if (!res.success || !res.data) throw new Error(res.message || 'Create failed');
      navigate(`/campaigns/${res.data.id}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to create campaign';
      setError(msg);
      setCreating(false);
    }
  };

  return (
    <div className={styles.root}>
      <LeftNavigation activeItem="campaigns" onItemClick={() => {}} />
      <div className={styles.mainContent}>
  <Header title="New Campaign" subtitle="Select a campaign type to begin." />
        <div className={styles.content}>
          <div className={styles.panel}>
            {loading ? (
              <Spinner label="Loading types..." />
            ) : error ? (
              <MessageBar intent="error">{error}</MessageBar>
            ) : (
              <>
                <RadioGroup value={selectedOptionId ?? ''} onChange={(_, data: { value: string }) => setSelectedOptionId(data.value)}>
                  {options.map((opt) => (
                    <Radio key={opt.id} value={opt.id} label={opt.label} disabled={opt.disabled} />
                  ))}
                </RadioGroup>

                <div className={styles.actions}>
                  <Button appearance="secondary" onClick={() => navigate('/')}>Cancel</Button>
                  <Button appearance="primary" disabled={!selectedOptionId || creating} onClick={onContinue}>Continue</Button>
                </div>

              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
