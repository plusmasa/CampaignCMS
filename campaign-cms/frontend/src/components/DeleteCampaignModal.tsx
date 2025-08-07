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
  Text,
  makeStyles,
} from '@fluentui/react-components';
import { Delete24Regular, Warning24Regular } from '@fluentui/react-icons';
import { campaignService } from '../services/api';
import type { Campaign } from '../types/Campaign';

const useStyles = makeStyles({
  warningContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  warningIcon: {
    color: '#d13438',
    fontSize: '24px',
  },
  campaignInfo: {
    backgroundColor: '#f3f2f1',
    padding: '12px',
    borderRadius: '4px',
    marginTop: '12px',
  },
  errorText: {
    color: '#d13438',
  },
  deleteButton: {
    backgroundColor: '#d13438',
  },
});

interface DeleteCampaignModalProps {
  campaign: Campaign;
  onCampaignDeleted: () => void;
}

export const DeleteCampaignModal: React.FC<DeleteCampaignModalProps> = ({
  campaign,
  onCampaignDeleted,
}) => {
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await campaignService.deleteCampaign(campaign.id);
      
      if (response.success) {
        setOpen(false);
        onCampaignDeleted();
      } else {
        setError(response.message || 'Failed to delete campaign');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete campaign');
    } finally {
      setLoading(false);
    }
  };

  const canDelete = campaign.state === 'Draft';

  return (
    <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
      <DialogTrigger disableButtonEnhancement>
        <Button
          appearance="subtle"
          icon={<Delete24Regular />}
          size="small"
          disabled={!canDelete}
          title={canDelete ? 'Delete campaign' : 'Only draft campaigns can be deleted'}
        />
      </DialogTrigger>
      
      <DialogSurface>
        <DialogContent>
          <DialogTitle>
            Delete Campaign
          </DialogTitle>
          
          <DialogBody>
            <div className={styles.warningContent}>
              <Warning24Regular className={styles.warningIcon} />
              <div>
                <Text weight="semibold">Are you sure you want to delete this campaign?</Text>
                <br />
                <Text>This action cannot be undone.</Text>
              </div>
            </div>

            <div className={styles.campaignInfo}>
              <Text weight="semibold">Campaign Details:</Text>
              <br />
              <Text><strong>Title:</strong> {campaign.title}</Text>
              <br />
              <Text><strong>State:</strong> {campaign.state}</Text>
              <br />
              <Text><strong>Channels:</strong> {campaign.channels.join(', ')}</Text>
            </div>

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
              disabled={loading}
              onClick={handleDelete}
              className={styles.deleteButton}
            >
              {loading ? 'Deleting...' : 'Delete Campaign'}
            </Button>
          </DialogActions>
        </DialogContent>
      </DialogSurface>
    </Dialog>
  );
};
