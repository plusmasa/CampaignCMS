import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  makeStyles,
  shorthands,
  Badge,
  Title1,
  Title3,
  Text,
  Button,
  Card,
  Field,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Input,
  Spinner,
  MessageBar,
  Divider,
  tokens,
  Toaster,
  Toast,
  ToastTitle,
  useToastController,
  useId,
} from '@fluentui/react-components';
import { Radio, RadioGroup } from '@fluentui/react-components';
import { Dropdown, Option, Caption1 } from '@fluentui/react-components';
import { DatePicker } from '@fluentui/react-datepicker-compat';
import { Dismiss24Regular, Delete24Regular, Checkmark20Regular, Copy24Regular, Send16Regular, Calendar16Regular } from '@fluentui/react-icons';
import { campaignService } from '../services/api';
import { getBadgeStyle } from '../constants/stateBadge';
import type { Campaign } from '../types/Campaign';
import type { UpdateCampaignRequest } from '../types/Campaign';
import { LeftNavigation } from '../components/LeftNavigation';
import { Header } from '../components/Header';
import { AVAILABLE_MARKETS } from '../constants';
// Right rail will host campaign-specific controls soon

const useStyles = makeStyles({
  layout: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden'
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  pageHeaderWrapper: {
    ...shorthands.padding('16px', '32px'),
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    borderBottom: '1px solid var(--colorNeutralStroke2)'
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  statusBadge: {
    flexShrink: 0
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  body: {
    flex: 1,
    ...shorthands.padding('24px'),
    overflow: 'auto'
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('4px'),
    marginTop: '8px',
    marginBottom: '24px',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
  },
  infoLabel: {
    fontSize: '12px',
    color: 'var(--colorNeutralForeground2)',
    fontWeight: 600,
  },
  infoValue: {
    // Body 1
  },
  field: {
    maxWidth: '320px',
  },
  sectionDivider: {
    width: '100%',
  marginTop: tokens.spacingVerticalXXXL,
  marginBottom: tokens.spacingVerticalXL,
  },
  contentWithPanel: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden'
  },
  mainArea: {
    flex: 1,
    ...shorthands.padding('24px'),
    overflow: 'auto'
  },
  rightRail: {
    width: '300px',
    height: '100vh',
    backgroundColor: 'var(--colorNeutralBackground2)',
    borderLeft: '1px solid var(--colorNeutralStroke2)',
    ...shorthands.padding('24px', '20px'),
  },
  placeholderText: {
    marginTop: '24px',
  },
  editableTitleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  titleClickable: {
    cursor: 'text',
  },
  titleInput: {
    fontSize: '28px',
    fontWeight: 600,
    lineHeight: '36px',
    height: '40px',
    // Remove extra paddings so it feels inline
    ...shorthands.padding('0', '8px'),
  },
  titleActions: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
  },
  captionLink: {
    fontSize: '12px',
    color: 'var(--colorNeutralForeground2)',
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  railGroup: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('8px'),
  },
  railGroupLabel: {
    fontWeight: 600,
  },
  railCaption: {
    fontSize: '12px',
    color: 'var(--colorNeutralForeground2)'
  },
  railGroupSeparated: {
    marginTop: tokens.spacingVerticalXL,
  },
  railError: {
    fontSize: '12px',
    color: 'var(--colorStatusDangerForeground3)'
  },
  channelsCard: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '160px',
    marginTop: tokens.spacingVerticalM,
  }
});

interface CampaignEditorProps {
  isNewDraft?: boolean;
}

export const CampaignEditor: React.FC<CampaignEditorProps> = ({ isNewDraft }) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const params = useParams();
  const toasterId = useId('campaign-toaster');
  const { dispatchToast } = useToastController(toasterId);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('New campaign draft');
  // Local input state for the edit dialog so users can clear text while editing
  const [titleInput, setTitleInput] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [stopOpen, setStopOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState<boolean>(!!isNewDraft);
  const [stopping, setStopping] = useState<boolean>(false);
  const [unscheduling, setUnscheduling] = useState<boolean>(false);
  const [publishMode, setPublishMode] = useState<'now' | 'later'>('now');
  const [publishOpen, setPublishOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  // Guard to prevent duplicate draft creation in React StrictMode / HMR
  const hasCreatedRef = useRef(false);
  // Draft-only: selected markets for targeting. Validation will be required before scheduling.
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);

  // Right rail: Start date/time (PST for demo)
  const [startDateLocal, setStartDateLocal] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<string>('09:00'); // HH:mm
  // Right rail: End date/time (PST for demo)
  const [endDateLocal, setEndDateLocal] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<string>(''); // HH:mm, empty until date is picked

  // Format a HH:mm string into 12-hour time with am/pm and PST suffix
  const formatTimeAmPmPst = useCallback((hhmm: string) => {
    if (!hhmm || !/^[0-2]?\d:\d{2}$/.test(hhmm)) return hhmm;
    const [hStr, mStr] = hhmm.split(':');
    let h = Number(hStr);
    const ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12;
    if (h === 0) h = 12;
    const hh12 = String(h).padStart(2, '0');
    return `${hh12}:${mStr} ${ampm} PST`;
  }, []);

  const toUtcMsFromPst = useCallback((date: Date, hhmm: string) => {
    const [hh, mm] = hhmm.split(':').map(Number);
    const d = new Date(date);
    d.setHours(hh, mm, 0, 0);
    return d.getTime() + 8 * 60 * 60 * 1000; // PST -> UTC
  }, []);

  // Display helper: format ISO date/time in Pacific Time (handles PST/PDT)
  const formatInPacific = useCallback((iso: string) => {
    try {
      const date = new Date(iso);
      const dateStr = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      }).format(date);
      const timeStr = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short', // e.g., PST/PDT
      }).format(date);
      return { dateStr, timeStr };
    } catch {
      return { dateStr: '—', timeStr: '—' };
    }
  }, []);

  const scheduleInvalid = React.useMemo(() => {
    // Only validate when both dates AND times are provided
    if (startDateLocal && endDateLocal && startTime && endTime) {
      const startUtc = toUtcMsFromPst(startDateLocal, startTime);
      const endUtc = toUtcMsFromPst(endDateLocal, endTime);
      return endUtc <= startUtc;
    }
    return false;
  }, [startDateLocal, endDateLocal, startTime, endTime, toUtcMsFromPst]);

  // Shared badge style for state
  const badgeStyle = getBadgeStyle(campaign?.state);

  const loadCampaign = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const resp = await campaignService.getCampaign(id);
      if (resp.success && resp.data) {
        setCampaign(resp.data);
        setTitleDraft(resp.data.title);
      } else {
        setError(resp.message || 'Failed to load campaign');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load campaign');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new draft campaign automatically when isNewDraft is true
  useEffect(() => {
    const init = async () => {
      if (isNewDraft) {
        // Avoid duplicate creates if already created
        if (hasCreatedRef.current) {
          return;
        }
        try {
          hasCreatedRef.current = true;
          setCreating(true);
          const resp = await campaignService.createCampaign({
            title: 'New campaign draft',
            channels: [],
            markets: 'all'
          });
          if (resp.success && resp.data) {
            setCampaign(resp.data);
            setTitleDraft(resp.data.title);
            // Navigate to canonical route to prevent future re-creates on re-mounts
            navigate(`/campaigns/${resp.data.id}`, { replace: true });
          } else {
            setError(resp.message || 'Failed to create draft');
            hasCreatedRef.current = false; // allow retry on next mount if needed
          }
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Failed to create draft');
          hasCreatedRef.current = false; // allow retry on next mount if needed
        } finally {
          setCreating(false);
          setLoading(false);
        }
      } else if (params.id) {
        const idNum = Number(params.id);
        if (!isNaN(idNum)) {
          loadCampaign(idNum);
        }
      }
    };
    init();
  }, [isNewDraft, params.id, loadCampaign, navigate]);

  // Prefill Start controls from campaign.startDate (stored in UTC), convert back to PST for display
  useEffect(() => {
    if (campaign?.startDate) {
      const utc = new Date(campaign.startDate);
      const pstMs = utc.getTime() - 8 * 60 * 60 * 1000; // UTC -> PST
      const pst = new Date(pstMs);
      setStartDateLocal(pst);
      const hh = String(pst.getHours()).padStart(2, '0');
      const mm = String(pst.getMinutes()).padStart(2, '0');
      setStartTime(`${hh}:${mm}`);
    } else {
      setStartDateLocal(null);
    }
  }, [campaign?.startDate]);

  // Prefill End controls from campaign.endDate (stored in UTC), convert back to PST for display
  useEffect(() => {
    if (campaign?.endDate) {
      const utc = new Date(campaign.endDate);
      const pstMs = utc.getTime() - 8 * 60 * 60 * 1000; // UTC -> PST
      const pst = new Date(pstMs);
      setEndDateLocal(pst);
      const hh = String(pst.getHours()).padStart(2, '0');
      const mm = String(pst.getMinutes()).padStart(2, '0');
      setEndTime(`${hh}:${mm}`);
    } else {
      setEndDateLocal(null);
  // When no date, ensure time is cleared for clearer UX
  setEndTime('');
    }
  }, [campaign?.endDate]);

  // Initialize markets selection from campaign
  useEffect(() => {
    if (!campaign) {
      setSelectedMarkets([]);
      return;
    }
    if (Array.isArray(campaign.markets)) {
      setSelectedMarkets(campaign.markets);
    } else if (campaign.markets === 'all') {
      // Show empty selection by default per requirements
      setSelectedMarkets([]);
    } else {
      setSelectedMarkets([]);
    }
  }, [campaign]);

  const handleSaveTitle = async () => {
    if (!campaign) return;
    try {
      setSaving(true);
      const newTitle = titleInput;
      const resp = await campaignService.updateCampaign(campaign.id, { title: newTitle });
      if (resp.success && resp.data) {
        setCampaign(resp.data);
        setTitleDraft(newTitle);
        setIsEditingTitle(false);
      } else {
        setError(resp.message || 'Failed to update title');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update title');
    } finally {
      setSaving(false);
    }
  };

  const startEditingTitle = () => {
    setTitleInput(titleDraft);
    setIsEditingTitle(true);
  };

  const cancelEditingTitle = () => {
    setIsEditingTitle(false);
    setTitleInput(titleDraft);
  };

  const handleDelete = async () => {
    if (!campaign) return;
    try {
      await campaignService.deleteCampaign(campaign.id);
      navigate('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete draft');
    }
  };

  const handleSaveDraft = async () => {
    if (!campaign) return;
    try {
      setSaving(true);
      if (scheduleInvalid) {
        setError('End must be after Start.');
        return;
      }
      let isoStart: string | undefined;
      let isoEnd: string | undefined;
      if (startDateLocal) {
        // Compose PST time (UTC-8 standard; ignoring DST for demo purposes as requested)
        const [hh, mm] = startTime.split(':').map(Number);
        const d = new Date(startDateLocal);
        d.setHours(hh, mm, 0, 0);
        // Convert PST to UTC by adding 8 hours offset
        const utcMs = d.getTime() + 8 * 60 * 60 * 1000;
        isoStart = new Date(utcMs).toISOString();
      }
      if (endDateLocal) {
        const [eh, em] = endTime.split(':').map(Number);
        const de = new Date(endDateLocal);
        de.setHours(eh, em, 0, 0);
        const utcMsEnd = de.getTime() + 8 * 60 * 60 * 1000;
        isoEnd = new Date(utcMsEnd).toISOString();
      }
      const payload: UpdateCampaignRequest = { title: titleDraft };
      if (isoStart !== undefined) payload.startDate = isoStart;
      if (isoEnd !== undefined) payload.endDate = isoEnd;
  // NOTE: Campaign cannot be scheduled unless Target market is configured (validation to be implemented later)
  payload.markets = selectedMarkets; // empty array means not configured yet in this draft
      await campaignService.updateCampaign(campaign.id, payload);
      await loadCampaign(campaign.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async () => {
    if (!campaign) return;
    try {
      const resp = await campaignService.duplicateCampaign(campaign.id);
      if (resp.success && resp.data) {
        const url = `/campaigns/${resp.data.id}`;
        window.open(url, '_blank', 'noopener');
      } else if (!resp.success) {
        setError(resp.message || 'Failed to duplicate campaign');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to duplicate campaign');
    }
  };

  const marketsSelected = selectedMarkets && selectedMarkets.length > 0;

  const handlePublishNow = async () => {
    if (!campaign) return;
    try {
      setPublishing(true);
  // Persist markets selection before publishing so it carries into non-Draft states
  await campaignService.updateCampaign(campaign.id, { markets: selectedMarkets });
      const resp = await campaignService.publishCampaign(campaign.id);
      if (resp.success && resp.data) {
        setCampaign(resp.data);
        dispatchToast(
          <Toast>
            <ToastTitle>Your campaign is now live</ToastTitle>
          </Toast>,
          { intent: 'success', timeout: 3000 }
        );
      } else if (!resp.success) {
        setError(resp.message || 'Failed to publish campaign');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to publish campaign');
    } finally {
      setPublishing(false);
    }
  };

  const handleSchedule = async () => {
    if (!campaign) return;
    try {
      if (!startDateLocal) return; // guard
      setScheduling(true);
  // Persist markets selection prior to scheduling
  await campaignService.updateCampaign(campaign.id, { markets: selectedMarkets });
      // Convert selected local PST date/time to ISO UTC
      const [hh, mm] = startTime.split(':').map(Number);
      const d = new Date(startDateLocal);
      d.setHours(hh, mm, 0, 0);
      const startUtcIso = new Date(d.getTime() + 8 * 60 * 60 * 1000).toISOString();
      let endUtcIso: string | undefined;
      if (endDateLocal) {
        const [eh, em] = endTime.split(':').map(Number);
        const de = new Date(endDateLocal);
        de.setHours(eh, em, 0, 0);
        endUtcIso = new Date(de.getTime() + 8 * 60 * 60 * 1000).toISOString();
      }
      const resp = await campaignService.scheduleCampaign(campaign.id, startUtcIso, endUtcIso);
      if (resp.success && resp.data) {
        setCampaign(resp.data);
        dispatchToast(
          <Toast>
            <ToastTitle>Your campaign is now scheduled</ToastTitle>
          </Toast>,
          { intent: 'success', timeout: 3000 }
        );
      } else if (!resp.success) {
        setError(resp.message || 'Failed to schedule campaign');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to schedule campaign');
    } finally {
      setScheduling(false);
    }
  };

  const handleStop = async () => {
    if (!campaign || campaign.state !== 'Live') return;
    try {
      setStopping(true);
      const resp = await campaignService.stopCampaign(campaign.id);
      if (resp.success && resp.data) {
        setCampaign(resp.data);
        dispatchToast(
          <Toast>
            <ToastTitle>Your campaign is now complete</ToastTitle>
          </Toast>,
          { intent: 'success', timeout: 3000 }
        );
      } else if (!resp.success) {
        setError(resp.message || 'Failed to stop campaign');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to stop campaign');
    } finally {
      setStopping(false);
    }
  };

  const handleUnschedule = async () => {
    if (!campaign || campaign.state !== 'Scheduled') return;
    try {
      setUnscheduling(true);
      const resp = await campaignService.unscheduleCampaign(campaign.id);
      if (resp.success && resp.data) {
        setCampaign(resp.data);
        dispatchToast(
          <Toast>
            <ToastTitle>Your campaign is now a draft</ToastTitle>
          </Toast>,
          { intent: 'success', timeout: 3000 }
        );
      } else if (!resp.success) {
        setError(resp.message || 'Failed to unschedule campaign');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to unschedule campaign');
    } finally {
      setUnscheduling(false);
    }
  };

  const headerActions = (
    <div className={styles.headerActions}>
      {/* Secondary actions first */}
      {campaign?.state === 'Draft' && (
        <Button appearance="secondary" onClick={handleSaveDraft} disabled={!campaign || saving || scheduleInvalid}>
          {saving ? 'Saving…' : 'Save Draft'}
        </Button>
      )}
      {campaign?.state === 'Draft' && (
        <Button appearance="secondary" icon={<Delete24Regular />} onClick={() => setDeleteOpen(true)} disabled={!campaign}>
          Delete draft
        </Button>
      )}
      <Button appearance="secondary" onClick={handleDuplicate} disabled={!campaign}>Duplicate</Button>

      {/* Primary action last (rightmost) */}
      {campaign?.state === 'Live' && (
        <Button appearance="primary" onClick={() => setStopOpen(true)} disabled={!campaign || stopping}>Stop</Button>
      )}
      {campaign?.state === 'Scheduled' && (
        <Button appearance="primary" onClick={handleUnschedule} disabled={!campaign || unscheduling}>Unschedule</Button>
      )}
      {campaign?.state === 'Draft' && publishMode === 'now' && (
        <Button appearance="primary" icon={<Send16Regular />} onClick={() => setPublishOpen(true)} disabled={!campaign || publishing || !marketsSelected}>Publish</Button>
      )}
      {campaign?.state === 'Draft' && publishMode === 'later' && (
        <Button appearance="primary" icon={<Calendar16Regular />} onClick={() => setScheduleOpen(true)} disabled={!campaign || scheduling || !marketsSelected || !startDateLocal || !startTime}>Schedule</Button>
      )}
    </div>
  );

  return (
    <div className={styles.layout}>
  <Toaster toasterId={toasterId} />
      <LeftNavigation activeItem="campaigns" onItemClick={(id) => id === 'campaigns' && navigate('/')} />
      <div className={styles.mainContent}>
        <Header
          title="Campaign Draft"
          actions={headerActions}
          customLeft={
            <div>
              <Badge {...badgeStyle} className={styles.statusBadge}>{campaign?.state || 'Draft'}</Badge>
              <div className={styles.editableTitleWrapper}>
                {isEditingTitle ? (
                  <Input
                    className={styles.titleInput}
                    value={titleInput}
                    onChange={(_, d) => setTitleInput(d.value)}
                    autoFocus
                    placeholder="Enter a campaign name"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && titleInput.trim()) {
                        e.preventDefault();
                        handleSaveTitle();
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        cancelEditingTitle();
                      }
                    }}
                    contentAfter={
                      <div className={styles.titleActions}>
                        <Button
                          size="small"
                          appearance="subtle"
                          icon={<Checkmark20Regular />}
                          onClick={handleSaveTitle}
                          disabled={saving || !titleInput.trim()}
                          aria-label="Save title"
                        />
                        <Button
                          size="small"
                          appearance="subtle"
                          icon={<Dismiss24Regular />}
                          onClick={cancelEditingTitle}
                          aria-label="Cancel editing"
                        />
                      </div>
                    }
                  />
                ) : (
                  <div
                    className={`${styles.editableTitleWrapper} ${styles.titleClickable}`}
                    role="button"
                    tabIndex={0}
                    aria-label="Edit title"
                    onClick={startEditingTitle}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        startEditingTitle();
                      }
                    }}
                  >
                    <Title1>{titleDraft}</Title1>
                  </div>
                )}
              </div>
            </div>
          }
        />
        <div className={styles.contentWithPanel}>
          <div className={styles.mainArea}>
            {loading && <Spinner label={creating ? 'Creating draft…' : 'Loading…'} />}
            {error && (
              <MessageBar intent="error">{error}</MessageBar>
            )}
            {campaign && !loading && (
              <div>
                {/* Campaign ID (read-only, all states) */}
                <div className={styles.infoSection}>
                  <Text className={styles.infoLabel}>Campaign ID</Text>
                  <div className={styles.infoRow}>
                    <Text size={400} className={styles.infoValue}>{campaign.campaignId || '—'}</Text>
                    {campaign.campaignId && (
                      <Button
                        size="small"
                        appearance="subtle"
                        icon={<Copy24Regular />}
                        aria-label="Copy Campaign ID"
                        title="Copy Campaign ID"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(campaign.campaignId);
                          } catch {
                            // no-op fallback if clipboard is unavailable
                          }
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Target market group */}
                <div className={styles.infoSection}>
                  <Text className={styles.infoLabel}>Target market</Text>
                  {campaign.state === 'Draft' ? (
                    <>
                      <Field className={styles.field}>
                        <Dropdown
                          multiselect
                          placeholder="Select a market"
                          selectedOptions={selectedMarkets}
                          button={
                            selectedMarkets.length > 0
                              ? {
                                  children:
                                    selectedMarkets.length === AVAILABLE_MARKETS.length
                                      ? 'All Markets'
                                      : `${selectedMarkets.length} market${selectedMarkets.length > 1 ? 's' : ''} selected`,
                                }
                              : undefined
                          }
                          onOptionSelect={(_, data) => {
                            const next = (data.selectedOptions as string[] | undefined) ?? selectedMarkets;
                            setSelectedMarkets(next);
                          }}
                        >
                          {AVAILABLE_MARKETS.map(m => (
                            <Option key={m} value={m}>{m}</Option>
                          ))}
                        </Dropdown>
                      </Field>
                      {selectedMarkets.length > 0 && (
                        <Caption1>{selectedMarkets.join(', ')}</Caption1>
                      )}
                    </>
                  ) : (
                    <Text size={400} className={styles.infoValue}>
                      {campaign.markets === 'all'
                        ? 'All Markets'
                        : Array.isArray(campaign.markets) && campaign.markets.length > 0
                          ? campaign.markets.join(', ')
                          : '—'}
                    </Text>
                  )}
                </div>

                {/* Divider across main content */}
                <Divider className={styles.sectionDivider} />

                {/* Channels section */}
                <Title3>Channels</Title3>
                <Card className={styles.channelsCard} role="region" aria-label="Channels card">
                  <Text>Channel configuration placeholder</Text>
                </Card>
              </div>
            )}
          </div>
          {/* Always-visible right rail */}
          <div className={styles.rightRail} aria-label="Campaign right rail">
            <div className={styles.railGroup}>
              <Text className={styles.railGroupLabel}>Start</Text>
              {campaign?.state === 'Draft' ? (
                <>
                  <RadioGroup value={publishMode} onChange={(_, data) => setPublishMode(data.value as 'now' | 'later')}>
                    <Radio value="now" label="Publish now" />
                    <Radio value="later" label="Schedule for later" />
                  </RadioGroup>
                  {publishMode === 'later' && (
                    <>
                      <DatePicker
                        placeholder="Select a start date"
                        value={startDateLocal}
                        onSelectDate={(date: Date | null | undefined) => setStartDateLocal(date ?? null)}
                        formatDate={(date?: Date) => (date ? date.toLocaleDateString() : '')}
                      />
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(_, d) => setStartTime(d.value)}
                      />
                      <Text className={styles.railCaption}>PST Timezone for demo purposes</Text>
                    </>
                  )}
                </>
              ) : (
                (() => {
                  const f = campaign?.startDate ? formatInPacific(campaign.startDate) : null;
                  return (
                    <>
                      <Text size={400}>{f ? f.dateStr : '—'}</Text>
                      <Text size={400}>{f ? f.timeStr : '—'}</Text>
                    </>
                  );
                })()
              )}
            </div>
            <div className={`${styles.railGroup} ${styles.railGroupSeparated}`}>
              <Text className={styles.railGroupLabel}>End</Text>
              {campaign?.state === 'Draft' ? (
                <>
                  <DatePicker
                    placeholder="Select an end date"
                    value={endDateLocal}
                    onSelectDate={(date: Date | null | undefined) => {
                      // Update date, and if selecting a date and no time chosen yet, default to 6:00 PM
                      if (date) {
                        setEndDateLocal(date);
                        setEndTime(prev => prev || '18:00');
                      } else {
                        // Clearing date should clear time as well
                        setEndDateLocal(null);
                        setEndTime('');
                      }
                    }}
                    formatDate={(date?: Date) => (date ? date.toLocaleDateString() : '')}
                  />
                  <Input
                    type="time"
                    value={endTime}
                    placeholder="Select a time"
                    onChange={(_, d) => setEndTime(d.value)}
                  />
                  {scheduleInvalid && (
                    <Text className={styles.railError} role="alert">End must be after Start.</Text>
                  )}
                  <Text className={styles.railCaption}>PST Timezone for demo purposes</Text>
                </>
              ) : (
                campaign?.endDate ? (
                  (() => {
                    const f = formatInPacific(campaign.endDate);
                    return (
                      <>
                        <Text size={400}>{f.dateStr}</Text>
                        <Text size={400}>{f.timeStr}</Text>
                      </>
                    );
                  })()
                ) : (
                  <Text size={400}>Runs until manually stopped</Text>
                )
              )}
            </div>
          </div>
        </div>
      </div>
  {/* Inline title editing implemented above; modal removed */}

      {/* Delete Confirmation Modal (only for Draft) */}
      {campaign?.state === 'Draft' && (
        <Dialog open={deleteOpen} onOpenChange={(_, data) => setDeleteOpen(data.open)}>
          <DialogSurface>
            <DialogBody>
              <DialogTitle action={<Button appearance="subtle" aria-label="close" icon={<Dismiss24Regular />} onClick={() => setDeleteOpen(false)} />}>Are you sure you want to delete this draft?</DialogTitle>
              <DialogContent>
                <Text>All your changes will be lost.</Text>
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                <Button appearance="primary" style={{ background: 'var(--colorStatusDangerBackground3)', color: 'var(--colorNeutralForegroundOnBrand)' }} onClick={handleDelete}>
                  Delete draft
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      )}

      {/* Stop Confirmation Modal (only for Live) */}
      {campaign?.state === 'Live' && (
        <Dialog open={stopOpen} onOpenChange={(_, data) => setStopOpen(data.open)}>
          <DialogSurface>
            <DialogBody>
              <DialogTitle action={<Button appearance="subtle" aria-label="close" icon={<Dismiss24Regular />} onClick={() => setStopOpen(false)} />}>Are you sure you want to stop this campaign?</DialogTitle>
              <DialogContent>
                <Text>Users will no longer see this content in the Microsoft experiences.</Text>
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={() => setStopOpen(false)}>Cancel</Button>
                <Button appearance="primary" onClick={async () => { setStopOpen(false); await handleStop(); }} disabled={stopping}>
                  Stop Campaign
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      )}

      {/* Publish Confirmation Modal (Draft, Publish now) */}
      {campaign?.state === 'Draft' && publishMode === 'now' && (
        <Dialog open={publishOpen} onOpenChange={(_, data) => setPublishOpen(data.open)}>
          <DialogSurface>
            <DialogBody>
              <DialogTitle action={<Button appearance="subtle" aria-label="close" icon={<Dismiss24Regular />} onClick={() => setPublishOpen(false)} />}>Are you sure you want to publish this campaign?</DialogTitle>
              <DialogContent>
                <Text>Users will see this content across the channels you configured.</Text>
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={() => setPublishOpen(false)}>Cancel</Button>
                <Button appearance="primary" icon={<Send16Regular />} onClick={async () => { setPublishOpen(false); await handlePublishNow(); }} disabled={publishing || !marketsSelected}>
                  Publish
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      )}

      {/* Schedule Confirmation Modal (Draft, Schedule for later) */}
      {campaign?.state === 'Draft' && publishMode === 'later' && (
        <Dialog open={scheduleOpen} onOpenChange={(_, data) => setScheduleOpen(data.open)}>
          <DialogSurface>
            <DialogBody>
              <DialogTitle action={<Button appearance="subtle" aria-label="close" icon={<Dismiss24Regular />} onClick={() => setScheduleOpen(false)} />}>Are you sure you want to schedule this campaign?</DialogTitle>
              <DialogContent>
                <Text>
                  {(() => {
                    const startStr = startDateLocal ? `${startDateLocal.toLocaleDateString()} ${formatTimeAmPmPst(startTime)}` : '';
                    const endStr = endDateLocal ? `${endDateLocal.toLocaleDateString()} ${formatTimeAmPmPst(endTime)}` : '';
                    if (startStr) {
                      if (endStr) {
                        return `Users will start seeing your content on ${startStr}. Users will stop seeing your content on ${endStr}.`;
                      }
                      return `Users will start seeing your content on ${startStr}. This campaign will be visible to users until you manually stop it.`;
                    }
                    return '';
                  })()}
                </Text>
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={() => setScheduleOpen(false)}>Cancel</Button>
                <Button appearance="primary" icon={<Calendar16Regular />} onClick={async () => { setScheduleOpen(false); await handleSchedule(); }} disabled={scheduling || !marketsSelected || !startDateLocal || !startTime}>
                  Schedule
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      )}
    </div>
  );
};

export default CampaignEditor;
