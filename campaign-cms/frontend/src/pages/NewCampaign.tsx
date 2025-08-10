import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button,
  Radio,
  RadioGroup,
  Label,
  Body1,
  makeStyles,
  shorthands,
  Dropdown,
  Option,
  Spinner,
  MessageBar,
} from '@fluentui/react-components';
import { Header } from '../components/Header';
import { LeftNavigation } from '../components/LeftNavigation';
import { campaignService, typesService } from '../services/api';

interface CampaignTypeInfo {
  type: 'OFFER' | 'POLL' | 'QUIZ' | 'QUEST';
  label: string;
  presets: Array<{ label: string; questionCount?: number }>;
}

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
  const [selectedType, setSelectedType] = useState<CampaignTypeInfo['type'] | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await typesService.getTypes();
        if (!res.success) throw new Error(res.message || 'Failed to load types');
        setTypes(res.data || []);
        // Deep link preselect
        const type = searchParams.get('type');
        const preset = searchParams.get('preset');
        if (type && ['OFFER', 'POLL', 'QUIZ', 'QUEST'].includes(type)) {
          setSelectedType(type as CampaignTypeInfo['type']);
        }
        if (preset) setSelectedPreset(preset);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load types';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [searchParams]);

  const onContinue = async () => {
    if (!selectedType) return;
    try {
      setCreating(true);
      setError(null);
      const presetPayload = selectedType === 'QUIZ' && selectedPreset ? { questionCount: Number(selectedPreset) } : undefined;
      const payload = { title: 'Untitled Campaign', channels: [], markets: 'all', type: selectedType, preset: presetPayload } as {
        title: string; channels: []; markets: 'all'; type: 'OFFER'|'POLL'|'QUIZ'|'QUEST'; preset?: { questionCount?: number };
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
                <RadioGroup value={selectedType ?? ''} onChange={(_, data: { value: string }) => setSelectedType(data.value as CampaignTypeInfo['type'])}>
                  {types.map((t) => (
                    <Radio key={t.type} value={t.type} label={t.label} />
                  ))}
                </RadioGroup>

                <div className={styles.actions}>
                  <Button appearance="secondary" onClick={() => navigate('/')}>Cancel</Button>
                  <Button appearance="primary" disabled={!selectedType || creating} onClick={onContinue}>Continue</Button>
                </div>

                {selectedType === 'QUIZ' && (
                  <div className={styles.presetRow}>
                    <Label>Preset</Label>
                    <Dropdown value={selectedPreset ?? ''} onOptionSelect={(_, d) => setSelectedPreset(d.optionValue ?? null)}>
                      {(types.find(t => t.type === 'QUIZ')?.presets || []).map((p) => (
                        <Option key={p.label} value={String(p.questionCount || '')}>{p.label}</Option>
                      ))}
                    </Dropdown>
                    <Body1>Choose 3 or 10 questions.</Body1>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
