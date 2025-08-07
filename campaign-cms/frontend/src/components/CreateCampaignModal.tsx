import React, { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogBody,
  DialogActions,
  Button,
  Field,
  Input,
  Checkbox,
  Text,
  makeStyles,
  shorthands,
} from '@fluentui/react-components';
import { Add24Regular, Dismiss24Regular } from '@fluentui/react-icons';
import { campaignService } from '../services/api';
import type { CreateCampaignRequest, Channel } from '../types/Campaign';
import { AVAILABLE_CHANNELS, AVAILABLE_MARKETS } from '../constants';

const useStyles = makeStyles({
  form: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('16px'),
  },
  channelGroup: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('8px'),
  },
  channelOptions: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('8px'),
  },
  marketInput: {
    marginTop: '8px',
  },
  errorText: {
    color: 'red',
  },
});

interface CreateCampaignModalProps {
  onCampaignCreated: () => void;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  onCampaignCreated,
}) => {
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateCampaignRequest>({
    title: '',
    channels: [],
    markets: 'all',
  });

  const [marketType, setMarketType] = useState<'all' | 'specific'>('all');
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);

  const handleChannelChange = (channel: Channel, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      channels: checked 
        ? [...prev.channels, channel]
        : prev.channels.filter(c => c !== channel)
    }));
  };

  const handleMarketTypeChange = (type: 'all' | 'specific') => {
    setMarketType(type);
    if (type === 'all') {
      setFormData(prev => ({ ...prev, markets: 'all' }));
    } else {
      setFormData(prev => ({ ...prev, markets: selectedMarkets }));
    }
  };

  const handleSpecificMarketsChange = (markets: string[]) => {
    setSelectedMarkets(markets);
    if (marketType === 'specific') {
      setFormData(prev => ({ ...prev, markets }));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validation
      if (!formData.title.trim()) {
        setError('Title is required');
        return;
      }
      if (formData.channels.length === 0) {
        setError('At least one channel is required');
        return;
      }
      if (marketType === 'specific' && selectedMarkets.length === 0) {
        setError('At least one market is required when using specific markets');
        return;
      }

      const response = await campaignService.createCampaign(formData);
      
      if (response.success) {
        // Reset form
        setFormData({ title: '', channels: [], markets: 'all' });
        setMarketType('all');
        setSelectedMarkets([]);
        setOpen(false);
        onCampaignCreated();
      } else {
        setError(response.message || 'Failed to create campaign');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const isValid = formData.title.trim() && 
                  formData.channels.length > 0 && 
                  (marketType === 'all' || selectedMarkets.length > 0);

  return (
    <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
      <DialogTrigger disableButtonEnhancement>
        <Button appearance="primary" icon={<Add24Regular />}>
          New Campaign
        </Button>
      </DialogTrigger>
      
      <DialogSurface>
        <DialogContent>
          <DialogTitle
            action={
              <Button
                appearance="subtle"
                aria-label="close"
                icon={<Dismiss24Regular />}
                onClick={() => setOpen(false)}
              />
            }
          >
            Create New Campaign
          </DialogTitle>
          
          <DialogBody className={styles.form}>
            <Field label="Campaign Title" required>
              <Input
                value={formData.title}
                onChange={(_, data) => 
                  setFormData(prev => ({ ...prev, title: data.value }))
                }
                placeholder="Enter campaign title..."
              />
            </Field>

            <Field label="Channels" required>
              <div className={styles.channelOptions}>
                {AVAILABLE_CHANNELS.map(channel => (
                  <Checkbox
                    key={channel}
                    label={channel}
                    checked={formData.channels.includes(channel)}
                    onChange={(_, data) => 
                      handleChannelChange(channel, data.checked === true)
                    }
                  />
                ))}
              </div>
            </Field>

            <Field label="Market Targeting" required>
              <div className={styles.channelOptions}>
                <Checkbox
                  label="All Markets"
                  checked={marketType === 'all'}
                  onChange={() => handleMarketTypeChange('all')}
                />
                <Checkbox
                  label="Specific Markets"
                  checked={marketType === 'specific'}
                  onChange={() => handleMarketTypeChange('specific')}
                />
                
                {marketType === 'specific' && (
                  <div className={styles.marketInput}>
                    <Text size={200}>Select Markets:</Text>
                    {AVAILABLE_MARKETS.map(market => (
                      <Checkbox
                        key={market}
                        label={market}
                        checked={selectedMarkets.includes(market)}
                        onChange={(_, data) => {
                          const newMarkets = data.checked
                            ? [...selectedMarkets, market]
                            : selectedMarkets.filter(m => m !== market);
                          handleSpecificMarketsChange(newMarkets);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Field>

            {error && (
              <Text className={styles.errorText}>{error}</Text>
            )}
          </DialogBody>
          
          <DialogActions>
            <Button 
              appearance="secondary" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              appearance="primary"
              disabled={!isValid || loading}
              onClick={handleSubmit}
            >
              {loading ? 'Creating...' : 'Create Campaign'}
            </Button>
          </DialogActions>
        </DialogContent>
      </DialogSurface>
    </Dialog>
  );
};
