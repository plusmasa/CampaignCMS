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
import { Dropdown, Option } from '@fluentui/react-components';
import { DatePicker } from '@fluentui/react-datepicker-compat';
import { Dismiss24Regular, Delete24Regular, Checkmark20Regular, Copy24Regular, Send16Regular, Calendar16Regular, LayerDiagonalSparkle16Regular } from '@fluentui/react-icons';
import { campaignService, typesService, aiService } from '../services/api';
import { getBadgeStyle } from '../constants/stateBadge';
import type { Campaign, CampaignType } from '../types/Campaign';
import type { UpdateCampaignRequest } from '../types/Campaign';
import { LeftNavigation } from '../components/LeftNavigation';
import { Header } from '../components/Header';
import { AVAILABLE_MARKETS } from '../constants';
import { typeLabel, hasMeaningfulConfig } from '../utils/campaignTypeHelpers';
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
  marginBottom: tokens.spacingVerticalXXL,
  },
  contentHeading: {
  display: 'block',
  marginBottom: tokens.spacingVerticalXXXL,
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
  endSubsection: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalS),
    marginLeft: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalS,
    marginBottom: tokens.spacingVerticalS,
  width: '100%',
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
  // Ensure right-rail controls align to the same width
  railControl: {
  width: '100%',
  maxWidth: '100%',
  minWidth: 0,
  },
  // Force Fluent v8 DatePicker internal input to stretch full width
  datePickerFull: {
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    // v8 classname targeting
    '& .ms-TextField': { width: '100%' },
    '& .ms-TextField-fieldGroup': { width: '100%' },
    '& input': { width: '100%' },
  },
  channelsCard: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '160px',
    marginTop: tokens.spacingVerticalM,
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('12px'),
  },
  subtleDivider: {
    width: '1px',
    height: '16px',
    backgroundColor: 'var(--colorNeutralStroke2)',
  },
  inlineLink: {
    color: 'var(--colorBrandForegroundLink)',
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  configForm: {
    display: 'flex',
    flexDirection: 'column',
    // Uniform vertical spacing between all controls within the card
    ...shorthands.gap(tokens.spacingVerticalL),
  },
  // Use inside the content card so every input stack has the same spacing
  formRow: {
    display: 'flex',
    flexDirection: 'column',
    // Match the card form gap for consistent rhythm
    ...shorthands.gap(tokens.spacingVerticalL),
    marginTop: 0,
    marginBottom: 0,
  },
  fullWidthCard: {
    width: '100%',
    backgroundColor: 'var(--colorNeutralBackground1)',
    ...shorthands.padding('16px', '16px'),
    border: '1px solid var(--colorNeutralStroke2)'
  },
  variantHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacingVerticalM,
  },
  variantActions: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalS),
  },
  addVariantRow: {
    marginTop: tokens.spacingVerticalL,
  }
});

interface CampaignEditorProps {
  isNewDraft?: boolean;
}

// Type-specific config shapes (frontend mirrors of backend schemas)
type OfferBanner = { imageUrl?: string; header?: string; description?: string };
type OfferConfig = { banners?: OfferBanner[] };
type PollConfig = { question?: string; options?: [string, string]; recordSelection?: boolean };
type QuizQuestion = { prompt?: string; choices?: [string, string, string]; correctIndex?: 0 | 1 | 2 };
type QuizConfig = { questions?: QuizQuestion[] };
type QuestAction = { key?: string; header?: string; description?: string; cooldownDays?: number | null; images?: { complete?: string; incomplete?: string } };
type QuestConfig = { actions?: QuestAction[]; reward?: { type?: string; value?: string }; display?: { image?: string; header?: string; description?: string } };
type AvailableType = { type: 'OFFER' | 'POLL' | 'QUIZ' | 'QUEST'; label: string; presets: Array<{ label: string; questionCount?: number }> };
type ChannelConfig = { bingUrl?: string } & Record<string, unknown>;
type AnyConfig = OfferConfig | PollConfig | QuizConfig | QuestConfig | Record<string, unknown>;
type Variant = { id: string; market?: string; config: AnyConfig };

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
  // AI Duplicate modal state
  const [aiOpen, setAiOpen] = useState(false);
  const [aiSourceIndex, setAiSourceIndex] = useState<number | null>(null);
  const [aiTargetMarket, setAiTargetMarket] = useState<string>('');
  const [aiBusy, setAiBusy] = useState(false);
  // Type management
  const [changingType, setChangingType] = useState(false);
  const [newType, setNewType] = useState<'OFFER' | 'POLL' | 'QUIZ' | 'QUEST'>('OFFER');
  const [quizPreset, setQuizPreset] = useState<number | undefined>(undefined);
  const [availableTypes, setAvailableTypes] = useState<AvailableType[]>([]);
  // Multi-variant config editing
  const [variantsDraft, setVariantsDraft] = useState<Variant[]>([]);
  // Channel-specific settings
  const [bingUrl, setBingUrl] = useState<string>('');
  // Content validation errors will surface in the page-level error bar
  // Guard to prevent duplicate draft creation in React StrictMode / HMR
  const hasCreatedRef = useRef(false);
  // Helper: currently used markets across variants (for filtering/guards)
  const usedMarkets = React.useMemo(() => (variantsDraft.map(v => v.market).filter(Boolean) as string[]), [variantsDraft]);

  // Right rail: Start date/time (PST for demo)
  const [startDateLocal, setStartDateLocal] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<string>('09:00'); // HH:mm
  // Right rail: End date/time (PST for demo)
  const [endDateLocal, setEndDateLocal] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<string>(''); // HH:mm, empty until date is picked
  // End options mode: none (no end), relative (after X units), specific (date/time)
  type EndMode = 'none' | 'relative' | 'specific';
  const [endMode, setEndMode] = useState<EndMode>('none');
  const [endAfterAmount, setEndAfterAmount] = useState<string>(''); // integer-only string
  const [endAfterUnit, setEndAfterUnit] = useState<'Hours' | 'Days' | 'Months'>('Hours');

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
    // Validate only when specific mode and both dates & times are provided
    if (endMode === 'specific') {
      if (startDateLocal && endDateLocal && startTime && endTime) {
        const startUtc = toUtcMsFromPst(startDateLocal, startTime);
        const endUtc = toUtcMsFromPst(endDateLocal, endTime);
        return endUtc <= startUtc;
      }
      return false;
    }
    return false;
  }, [endMode, startDateLocal, endDateLocal, startTime, endTime, toUtcMsFromPst]);

  // Determine if publish/schedule actions should be enabled based on end selection requirements
  const endSelectionIncomplete = React.useMemo(() => {
    if (campaign?.state !== 'Draft') return false;
    if (endMode === 'none') return false;
    if (endMode === 'relative') {
      const validInt = /^[0-9]+$/.test(endAfterAmount) && Number(endAfterAmount) > 0;
      return !(validInt && endAfterUnit);
    }
    // specific
    return !(endDateLocal && endTime);
  }, [campaign?.state, endMode, endAfterAmount, endAfterUnit, endDateLocal, endTime]);

  // Shared badge style for state
  const badgeStyle = getBadgeStyle(campaign?.state);

  const loadCampaign = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const resp = await campaignService.getCampaign(id);
      if (resp.success && resp.data) {
        setCampaign(resp.data);
        setTitleDraft(resp.data.title);
        // Build variants from config (supports legacy config)
        const cfgUnknown = resp.data.config as unknown;
        let nextVariants: Variant[] = [];
        const cfgObj = cfgUnknown && typeof cfgUnknown === 'object' ? (cfgUnknown as { variants?: Array<{ id?: string; market?: string; config?: AnyConfig }> }) : {};
        const maybeVariants = Array.isArray(cfgObj.variants) ? cfgObj.variants : null;
        if (maybeVariants) {
          nextVariants = maybeVariants.map((v, idx) => ({
            id: String(v.id ?? `${Date.now()}-${idx}`),
            market: v.market,
            config: (v.config ?? {}) as AnyConfig,
          }));
          if (nextVariants.length === 0) {
            nextVariants = [{ id: String(Date.now()), market: undefined, config: {} }];
          }
        } else {
          const inferredMarket = Array.isArray(resp.data.markets) && resp.data.markets.length === 1 ? resp.data.markets[0] : undefined;
          nextVariants = [{ id: String(Date.now()), market: inferredMarket, config: (resp.data.config ?? {}) as AnyConfig }];
        }
        setVariantsDraft(nextVariants);
        const cc = (resp.data.channelConfig as ChannelConfig | undefined) ?? {};
        setBingUrl(cc.bingUrl ?? '');
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
            // Initialize single empty variant for new draft
            setVariantsDraft([{ id: String(Date.now()), market: undefined, config: (resp.data.config ?? {}) as AnyConfig }]);
            const cc = (resp.data.channelConfig as ChannelConfig | undefined) ?? {};
            setBingUrl(cc.bingUrl ?? '');
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
  if (campaign.state === 'Draft') setEndMode('specific');
    } else {
      setEndDateLocal(null);
  // When no date, ensure time is cleared for clearer UX
  setEndTime('');
  if (campaign?.state === 'Draft') setEndMode('none');
    }
  }, [campaign?.endDate, campaign?.state]);

  // Markets per variant; no global selectedMarkets

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
  // Save multi-variant content first so validation issues block the save clearly
  const cfgResp = await campaignService.updateConfig(campaign.id, { variants: variantsDraft.map(v => ({ market: v.market, config: v.config })) });
      if (!cfgResp.success) {
        setError(cfgResp.message || 'Content validation failed');
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
      if (endMode === 'specific' && endDateLocal) {
        const [eh, em] = endTime.split(':').map(Number);
        const de = new Date(endDateLocal);
        de.setHours(eh, em, 0, 0);
        const utcMsEnd = de.getTime() + 8 * 60 * 60 * 1000;
        isoEnd = new Date(utcMsEnd).toISOString();
      }
  const payload: UpdateCampaignRequest = { title: titleDraft };
      if (isoStart !== undefined) payload.startDate = isoStart;
      if (endMode === 'none') {
        (payload as unknown as { endDate: null }).endDate = null;
      } else if (isoEnd !== undefined) {
        payload.endDate = isoEnd;
      }
  // Persist Bing URL into channelConfig, preserving any other keys
  const nextChannelConfig: ChannelConfig = { ...((campaign.channelConfig as ChannelConfig | undefined) ?? {}) };
  nextChannelConfig.bingUrl = bingUrl;
  (payload as unknown as { channelConfig?: ChannelConfig }).channelConfig = nextChannelConfig;
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

  const handleApplyTypeChange = async () => {
    if (!campaign) return;
    try {
      const preset = newType === 'QUIZ' && quizPreset ? { questionCount: quizPreset } : undefined;
      const resp = await campaignService.changeType(campaign.id, newType, preset);
      if (resp.success) {
        await loadCampaign(campaign.id);
        setChangingType(false);
        setQuizPreset(undefined);
      } else {
        setError(resp.message || 'Failed to change type');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to change type');
    }
  };

  const canChangeType = campaign?.state === 'Draft' && !hasMeaningfulConfig(campaign?.type, campaign?.config);

  // Load available types (labels + presets) once
  useEffect(() => {
    const loadTypes = async () => {
      try {
        const resp = await typesService.getTypes();
        if (resp.success && Array.isArray(resp.data)) {
          setAvailableTypes(resp.data as AvailableType[]);
        }
      } catch {
        // ignore
      }
    };
    loadTypes();
  }, []);

  // Content renderer replaced by multi-variant UI below

  const variantsValid = React.useMemo(() => {
    if (!campaign) return false;
    if (!variantsDraft || variantsDraft.length === 0) return false;
    const markets = variantsDraft.map(v => v.market).filter(Boolean) as string[];
    if (markets.length !== variantsDraft.length) return false;
    return new Set(markets).size === markets.length;
  }, [variantsDraft, campaign]);

  const handlePublishNow = async () => {
    if (!campaign) return;
    try {
      setPublishing(true);
  // 1) Save content first so read-only mode reflects latest inputs
  const cfgResp = await campaignService.updateConfig(campaign.id, { variants: variantsDraft.map(v => ({ market: v.market, config: v.config })) });
      if (!cfgResp.success) {
        setError(cfgResp.message || 'Content validation failed');
        return;
      }

      // 2) Persist markets and channel settings (e.g., Bing URL)
      const nextChannelConfig: ChannelConfig = { ...((campaign.channelConfig as ChannelConfig | undefined) ?? {}) };
      nextChannelConfig.bingUrl = bingUrl;

      // 3) Compute endDate if needed for immediate publish
      let endIso: string | null | undefined = undefined;
      if (endMode === 'relative') {
        const amt = parseInt(endAfterAmount, 10);
        if (!isNaN(amt) && amt > 0) {
          const base = new Date();
          if (endAfterUnit === 'Hours') base.setHours(base.getHours() + amt);
          else if (endAfterUnit === 'Days') base.setDate(base.getDate() + amt);
          else base.setMonth(base.getMonth() + amt);
          endIso = base.toISOString();
        }
      } else if (endMode === 'specific' && endDateLocal) {
        // Convert selected local PST end date/time to UTC ISO
        const [eh, em] = endTime.split(':').map(Number);
        const de = new Date(endDateLocal);
        de.setHours(eh, em, 0, 0);
        endIso = new Date(de.getTime() + 8 * 60 * 60 * 1000).toISOString();
      } else if (endMode === 'none') {
        endIso = null; // explicitly clear end date
      }

      const updatePayload: Partial<UpdateCampaignRequest> & { channelConfig?: ChannelConfig } = {
        channelConfig: nextChannelConfig,
      };
      if (endIso !== undefined) {
        // undefined => leave unchanged; null => clear; string => set
        (updatePayload as unknown as { endDate: string | null }).endDate = endIso as string | null;
      }
      await campaignService.updateCampaign(campaign.id, updatePayload as UpdateCampaignRequest);

      // 4) Transition to Live
      const resp = await campaignService.publishCampaign(campaign.id);
      if (resp.success && resp.data) {
        // Reload to ensure we have the latest persisted config and metadata
        await loadCampaign(resp.data.id);
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
  // 1) Save content first so read-only mode reflects latest inputs
  const cfgResp = await campaignService.updateConfig(campaign.id, { variants: variantsDraft.map(v => ({ market: v.market, config: v.config })) });
      if (!cfgResp.success) {
        setError(cfgResp.message || 'Content validation failed');
        return;
      }

      // 2) Persist markets and channel settings before scheduling
      const nextChannelConfig: ChannelConfig = { ...((campaign.channelConfig as ChannelConfig | undefined) ?? {}) };
      nextChannelConfig.bingUrl = bingUrl;
  await campaignService.updateCampaign(campaign.id, { channelConfig: nextChannelConfig } as UpdateCampaignRequest);
      // Convert selected local PST date/time to ISO UTC
      const [hh, mm] = startTime.split(':').map(Number);
      const d = new Date(startDateLocal);
      d.setHours(hh, mm, 0, 0);
      const startUtcIso = new Date(d.getTime() + 8 * 60 * 60 * 1000).toISOString();
      let endUtcIso: string | undefined;
      if (endMode === 'specific' && endDateLocal) {
        const [eh, em] = endTime.split(':').map(Number);
        const de = new Date(endDateLocal);
        de.setHours(eh, em, 0, 0);
        endUtcIso = new Date(de.getTime() + 8 * 60 * 60 * 1000).toISOString();
      } else if (endMode === 'relative') {
        const amt = parseInt(endAfterAmount, 10);
        if (!isNaN(amt) && amt > 0) {
          const baseUtc = new Date(startUtcIso);
          if (endAfterUnit === 'Hours') baseUtc.setHours(baseUtc.getHours() + amt);
          else if (endAfterUnit === 'Days') baseUtc.setDate(baseUtc.getDate() + amt);
          else baseUtc.setMonth(baseUtc.getMonth() + amt);
          endUtcIso = baseUtc.toISOString();
        }
      } else if (endMode === 'none') {
        endUtcIso = undefined;
      }
      const resp = await campaignService.scheduleCampaign(campaign.id, startUtcIso, endUtcIso);
      if (resp.success && resp.data) {
        await loadCampaign(resp.data.id);
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

  const handleAiGenerate = async () => {
    if (!campaign) return;
    if (aiSourceIndex === null || aiSourceIndex < 0 || aiSourceIndex >= variantsDraft.length) return;
    if (!aiTargetMarket) return;
    try {
      setAiBusy(true);
      const source = variantsDraft[aiSourceIndex];
  const resp = await aiService.suggestVariant((campaign.type as CampaignType) || 'OFFER', source.config, aiTargetMarket);
      if (resp.success && resp.data) {
        const suggestion = resp.data;
        const next: Variant = { id: `${source.id}-ai-${Date.now()}`, market: suggestion.market, config: suggestion.config as AnyConfig };
        const arr = [...variantsDraft];
        arr.splice(aiSourceIndex + 1, 0, next);
        setVariantsDraft(arr);
        setAiOpen(false);
      } else {
        setError(resp.message || 'Failed to generate AI suggestion');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate AI suggestion');
    } finally {
      setAiBusy(false);
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
  {campaign?.state === 'Draft' && (
    <Button
      appearance="secondary"
      icon={<LayerDiagonalSparkle16Regular />}
      disabled={!campaign || usedMarkets.length >= AVAILABLE_MARKETS.length || variantsDraft.length === 0}
      onClick={() => {
        setAiSourceIndex(0);
        // pick first unused market by default
        const firstUnused = AVAILABLE_MARKETS.find(m => !usedMarkets.includes(m));
        setAiTargetMarket(firstUnused || '');
        setAiOpen(true);
      }}
    >
      AI Duplicate
    </Button>
  )}

      {/* Primary action last (rightmost) */}
      {campaign?.state === 'Live' && (
        <Button appearance="primary" onClick={() => setStopOpen(true)} disabled={!campaign || stopping}>Stop</Button>
      )}
      {campaign?.state === 'Scheduled' && (
        <Button appearance="primary" onClick={handleUnschedule} disabled={!campaign || unscheduling}>Unschedule</Button>
      )}
      {campaign?.state === 'Draft' && publishMode === 'now' && (
        <Button appearance="primary" icon={<Send16Regular />} onClick={() => setPublishOpen(true)} disabled={!campaign || publishing || !variantsValid || endSelectionIncomplete}>Publish</Button>
      )}
      {campaign?.state === 'Draft' && publishMode === 'later' && (
        <Button appearance="primary" icon={<Calendar16Regular />} onClick={() => setScheduleOpen(true)} disabled={!campaign || scheduling || !variantsValid || !startDateLocal || !startTime || endSelectionIncomplete || scheduleInvalid}>Schedule</Button>
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

                {/* Campaign type moved from header to body */}
                <div className={styles.infoSection}>
                  <Text className={styles.infoLabel}>Campaign type</Text>
                  <Text size={400} className={styles.infoValue}>{typeLabel(campaign.type)}</Text>
                  {canChangeType && (
                    <span
                      className={styles.inlineLink}
                      onClick={() => {
                        setChangingType(true);
                        setNewType((campaign.type as 'OFFER' | 'POLL' | 'QUIZ' | 'QUEST') || 'OFFER');
                      }}
                    >
                      Change
                    </span>
                  )}
                </div>

                {/* Divider across main content */}
                <Divider className={styles.sectionDivider} />

                {/* Content (multi-variant) */}
                <Title3 className={styles.contentHeading}>Content</Title3>
                {campaign && (
                  <div className={styles.formRow}>
                    {campaign.state === 'Draft' ? (
                      <>
                        {variantsDraft.map((v, idx) => {
                          const t = campaign.type || 'OFFER';
                          const available = AVAILABLE_MARKETS.filter(m => !usedMarkets.includes(m) || v.market === m);
                          return (
                            <Card key={v.id} appearance="filled" className={styles.fullWidthCard}>
                              <div className={styles.variantHeaderRow}>
                                <Field className={styles.field} label="Market">
                                  <Dropdown
                                    selectedOptions={[v.market || '']}
                                    placeholder="Select a market"
                                    button={{ children: v.market || 'Select a market' }}
                                    onOptionSelect={(_, data) => {
                                      const next = [...variantsDraft];
                                      next[idx] = { ...v, market: (data.optionValue as string) };
                                      setVariantsDraft(next);
                                    }}
                                  >
                                    {available.map(m => (
                                      <Option key={m} value={m}>{m}</Option>
                                    ))}
                                  </Dropdown>
                                </Field>
                                <div className={styles.variantActions}>
                                  <Button
                                    appearance="secondary"
                                    size="small"
                                    onClick={() => {
                                      if (usedMarkets.length >= AVAILABLE_MARKETS.length) return;
                                      const copy = { id: `${v.id}-copy-${Date.now()}`, market: undefined, config: JSON.parse(JSON.stringify(v.config || {})) } as Variant;
                                      const next = [...variantsDraft];
                                      next.splice(idx + 1, 0, copy);
                                      setVariantsDraft(next);
                                    }}
                                    disabled={usedMarkets.length >= AVAILABLE_MARKETS.length}
                                  >
                                    Duplicate
                                  </Button>
                                  <Button
                                    appearance="secondary"
                                    size="small"
                                    icon={<LayerDiagonalSparkle16Regular />}
                                    onClick={() => {
                                      const firstUnused = AVAILABLE_MARKETS.find(m => !usedMarkets.includes(m));
                                      setAiSourceIndex(idx);
                                      setAiTargetMarket(firstUnused || '');
                                      setAiOpen(true);
                                    }}
                                    disabled={usedMarkets.length >= AVAILABLE_MARKETS.length}
                                  >
                                    AI Duplicate
                                  </Button>
                                  <Button
                                    appearance="secondary"
                                    size="small"
                                    icon={<Delete24Regular />}
                                    onClick={() => {
                                      if (variantsDraft.length <= 1) return;
                                      setVariantsDraft(variantsDraft.filter((_, i) => i !== idx));
                                    }}
                                    disabled={variantsDraft.length <= 1}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                              <div className={styles.configForm}>
                                {t === 'OFFER' && (
                                  <>
                                    <Text>Offer Banners</Text>
                                    {Array.isArray((v.config as OfferConfig).banners)
                                      ? (v.config as OfferConfig).banners!.map((b: OfferBanner, bIdx: number) => (
                                          <div key={bIdx} className={styles.formRow}>
                                            <Field label={`Image URL #${bIdx + 1}`}>
                                              <Input value={b.imageUrl || ''} onChange={(_, d) => {
                                                const next = [...variantsDraft];
                                                const cfg = { ...(next[idx].config as OfferConfig) };
                                                const arr = Array.isArray(cfg.banners) ? [...cfg.banners] : ([] as OfferBanner[]);
                                                arr[bIdx] = { ...(arr[bIdx] || {}), imageUrl: d.value };
                                                cfg.banners = arr;
                                                next[idx] = { ...next[idx], config: cfg };
                                                setVariantsDraft(next);
                                              }} />
                                            </Field>
                                            <Field label="Header">
                                              <Input value={b.header || ''} onChange={(_, d) => {
                                                const next = [...variantsDraft];
                                                const cfg = { ...(next[idx].config as OfferConfig) };
                                                const arr = Array.isArray(cfg.banners) ? [...cfg.banners] : ([] as OfferBanner[]);
                                                arr[bIdx] = { ...(arr[bIdx] || {}), header: d.value };
                                                cfg.banners = arr;
                                                next[idx] = { ...next[idx], config: cfg };
                                                setVariantsDraft(next);
                                              }} />
                                            </Field>
                                            <Field label="Description">
                                              <Input value={b.description || ''} onChange={(_, d) => {
                                                const next = [...variantsDraft];
                                                const cfg = { ...(next[idx].config as OfferConfig) };
                                                const arr = Array.isArray(cfg.banners) ? [...cfg.banners] : ([] as OfferBanner[]);
                                                arr[bIdx] = { ...(arr[bIdx] || {}), description: d.value };
                                                cfg.banners = arr;
                                                next[idx] = { ...next[idx], config: cfg };
                                                setVariantsDraft(next);
                                              }} />
                                            </Field>
                                          </div>
                                        ))
                                      : (
                                        <Button onClick={() => {
                                          const next = [...variantsDraft];
                                          next[idx] = { ...next[idx], config: { banners: [{ imageUrl: '', header: '', description: '' }] } as OfferConfig };
                                          setVariantsDraft(next);
                                        }}>Add banner</Button>
                                      )}
                                  </>
                                )}
                                {t === 'POLL' && (
                                  <div className={styles.formRow}>
                                    <Field label="Question">
                                      <Input value={(v.config as PollConfig).question || ''} onChange={(_, d) => {
                                        const next = [...variantsDraft];
                                        next[idx] = { ...next[idx], config: { ...(v.config as PollConfig), question: d.value } };
                                        setVariantsDraft(next);
                                      }} />
                                    </Field>
                                    <Field label="Option A">
                                      <Input value={(((v.config as PollConfig).options?.[0]) ?? '')} onChange={(_, d) => {
                                        const current = (v.config as PollConfig);
                                        const opts = current.options ? ([...current.options] as [string, string]) : (['', ''] as [string, string]);
                                        opts[0] = d.value;
                                        const next = [...variantsDraft];
                                        next[idx] = { ...next[idx], config: { ...current, options: opts } };
                                        setVariantsDraft(next);
                                      }} />
                                    </Field>
                                    <Field label="Option B">
                                      <Input value={(((v.config as PollConfig).options?.[1]) ?? '')} onChange={(_, d) => {
                                        const current = (v.config as PollConfig);
                                        const opts = current.options ? ([...current.options] as [string, string]) : (['', ''] as [string, string]);
                                        opts[1] = d.value;
                                        const next = [...variantsDraft];
                                        next[idx] = { ...next[idx], config: { ...current, options: opts } };
                                        setVariantsDraft(next);
                                      }} />
                                    </Field>
                                  </div>
                                )}
                                {t === 'QUIZ' && (
                                  <>
                                    <Text>Quiz Questions</Text>
                                    {Array.isArray((v.config as QuizConfig).questions)
                                      ? (v.config as QuizConfig).questions!.map((q: QuizQuestion, qIdx: number) => (
                                          <div key={qIdx} className={styles.formRow}>
                                            <Field label={`Prompt #${qIdx + 1}`}>
                                              <Input value={q.prompt || ''} onChange={(_, d) => {
                                                const next = [...variantsDraft];
                                                const cfg = { ...(next[idx].config as QuizConfig) };
                                                const arr = Array.isArray(cfg.questions) ? ([...cfg.questions] as QuizConfig['questions']) : ([] as QuizConfig['questions']);
                                                const qItem = { ...(arr?.[qIdx] || ({} as QuizQuestion)) } as QuizQuestion;
                                                qItem.prompt = d.value;
                                                const newArr = arr ? [...(arr as QuizQuestion[])] : [];
                                                newArr[qIdx] = qItem;
                                                cfg.questions = newArr as QuizQuestion[];
                                                next[idx] = { ...next[idx], config: cfg };
                                                setVariantsDraft(next);
                                              }} />
                                            </Field>
                                            {[0, 1, 2].map((ci) => (
                                              <Field key={ci} label={`Choice ${ci + 1}`}>
                                                <Input value={(q.choices?.[ci] ?? '')} onChange={(_, d) => {
                                                  const next = [...variantsDraft];
                                                  const cfg = { ...(next[idx].config as QuizConfig) };
                                                  const arr = Array.isArray(cfg.questions) ? ([...cfg.questions] as QuizQuestion[]) : ([] as QuizQuestion[]);
                                                  const qItem = { ...(arr[qIdx] || ({} as QuizQuestion)) };
                                                  const choices = Array.isArray(qItem.choices) ? ([...qItem.choices] as [string, string, string]) : (['', '', ''] as [string, string, string]);
                                                  choices[ci] = d.value;
                                                  qItem.choices = choices as [string, string, string];
                                                  arr[qIdx] = qItem;
                                                  cfg.questions = arr;
                                                  next[idx] = { ...next[idx], config: cfg };
                                                  setVariantsDraft(next);
                                                }} />
                                              </Field>
                                            ))}
                                          </div>
                                        ))
                                      : null}
                                  </>
                                )}
                                {t === 'QUEST' && (
                                  <div className={styles.formRow}>
                                    <Text>Quest Display</Text>
                                    <Field label="Header">
                                      <Input value={(v.config as QuestConfig).display?.header || ''} onChange={(_, d) => {
                                        const next = [...variantsDraft];
                                        const qc = (v.config as QuestConfig);
                                        const display = { ...(qc.display || {}) } as NonNullable<QuestConfig['display']>;
                                        display.header = d.value;
                                        next[idx] = { ...next[idx], config: { ...qc, display } };
                                        setVariantsDraft(next);
                                      }} />
                                    </Field>
                                    <Field label="Description">
                                      <Input value={(v.config as QuestConfig).display?.description || ''} onChange={(_, d) => {
                                        const next = [...variantsDraft];
                                        const qc = (v.config as QuestConfig);
                                        const display = { ...(qc.display || {}) } as NonNullable<QuestConfig['display']>;
                                        display.description = d.value;
                                        next[idx] = { ...next[idx], config: { ...qc, display } };
                                        setVariantsDraft(next);
                                      }} />
                                    </Field>
                                  </div>
                                )}
                                {/* Bing URL as last field (global) */}
                                <div className={styles.formRow}>
                                  <Field label="Bing URL">
                                    <Input value={bingUrl} onChange={(_, d) => setBingUrl(d.value)} placeholder="https://www.bing.com/..." />
                                  </Field>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                        <div className={styles.addVariantRow}>
                          <Button
                            appearance="secondary"
                            onClick={() => {
                              if (usedMarkets.length >= AVAILABLE_MARKETS.length) return;
                              setVariantsDraft(vs => ([...vs, { id: String(Date.now()), market: undefined, config: {} }]));
                            }}
                            disabled={usedMarkets.length >= AVAILABLE_MARKETS.length}
                          >
                            Add content
                          </Button>
                        </div>
                      </>
                    ) : (
                      // Read-only view: show persisted variants from campaign.config
                      (() => {
                        const cfg = (campaign.config as { variants?: Array<{ market?: string; config: AnyConfig }> } | undefined) || {};
                        const list: Array<{ market?: string; config: AnyConfig }> = Array.isArray(cfg.variants)
                          ? cfg.variants
                          : [{ market: Array.isArray(campaign.markets) ? campaign.markets[0] : undefined, config: (campaign.config ?? {}) as AnyConfig }];
                        const dashIfEmpty = (v?: string | null) => (v && String(v).trim() ? String(v) : '—');
                        const t = campaign.type || 'OFFER';
                        return (
                          <>
                            {list.map((v, idx) => (
                              <Card key={`${v.market || 'unassigned'}-${idx}`} appearance="filled" className={styles.fullWidthCard}>
                                <div className={styles.variantHeaderRow}>
                                  <Field className={styles.field} label="Market">
                                    <Text size={400} className={styles.infoValue}>{v.market || '—'}</Text>
                                  </Field>
                                </div>
                                <div className={styles.configForm}>
                                  {t === 'OFFER' && (
                                    (() => {
                                      const banners = (v.config as OfferConfig).banners;
                                      if (!Array.isArray(banners) || banners.length === 0) {
                                        return <Text size={400}>—</Text>;
                                      }
                                      return (
                                        <>
                                          {banners.map((b: OfferBanner, bIdx: number) => (
                                            <div key={bIdx} className={styles.formRow}>
                                              <Field label={`Image URL #${bIdx + 1}`}>
                                                <Text size={400} className={styles.infoValue}>{dashIfEmpty(b.imageUrl)}</Text>
                                              </Field>
                                              <Field label="Header">
                                                <Text size={400} className={styles.infoValue}>{dashIfEmpty(b.header)}</Text>
                                              </Field>
                                              <Field label="Description">
                                                <Text size={400} className={styles.infoValue}>{dashIfEmpty(b.description)}</Text>
                                              </Field>
                                            </div>
                                          ))}
                                        </>
                                      );
                                    })()
                                  )}
                                  {t === 'POLL' && (
                                    <div className={styles.formRow}>
                                      <Field label="Question">
                                        <Text size={400} className={styles.infoValue}>{dashIfEmpty((v.config as PollConfig).question)}</Text>
                                      </Field>
                                      <Field label="Option A">
                                        <Text size={400} className={styles.infoValue}>{dashIfEmpty((v.config as PollConfig).options?.[0])}</Text>
                                      </Field>
                                      <Field label="Option B">
                                        <Text size={400} className={styles.infoValue}>{dashIfEmpty((v.config as PollConfig).options?.[1])}</Text>
                                      </Field>
                                    </div>
                                  )}
                                  {t === 'QUIZ' && (
                                    (() => {
                                      const questions = (v.config as QuizConfig).questions;
                                      if (!Array.isArray(questions) || questions.length === 0) {
                                        return <Text size={400}>—</Text>;
                                      }
                                      return (
                                        <>
                                          {questions.map((q: QuizQuestion, qIdx: number) => (
                                            <div key={qIdx} className={styles.formRow}>
                                              <Field label={`Prompt #${qIdx + 1}`}>
                                                <Text size={400} className={styles.infoValue}>{dashIfEmpty(q.prompt)}</Text>
                                              </Field>
                                              {[0, 1, 2].map((ci) => (
                                                <Field key={ci} label={`Choice ${ci + 1}`}>
                                                  <Text size={400} className={styles.infoValue}>{dashIfEmpty(q.choices?.[ci])}</Text>
                                                </Field>
                                              ))}
                                            </div>
                                          ))}
                                        </>
                                      );
                                    })()
                                  )}
                                  {t === 'QUEST' && (
                                    <div className={styles.formRow}>
                                      <Field label="Header">
                                        <Text size={400} className={styles.infoValue}>{dashIfEmpty((v.config as QuestConfig).display?.header)}</Text>
                                      </Field>
                                      <Field label="Description">
                                        <Text size={400} className={styles.infoValue}>{dashIfEmpty((v.config as QuestConfig).display?.description)}</Text>
                                      </Field>
                                    </div>
                                  )}
                                  {/* Bing URL (global) */}
                                  <div className={styles.formRow}>
                                    <Field label="Bing URL">
                                      <Text size={400} className={styles.infoValue}>{dashIfEmpty(((campaign.channelConfig as ChannelConfig | undefined)?.bingUrl) ?? '')}</Text>
                                    </Field>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </>
                        );
                      })()
                    )}
                  </div>
                )}
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
                        className={`${styles.railControl} ${styles.datePickerFull}`}
                        placeholder="Select a start date"
                        value={startDateLocal}
                        onSelectDate={(date: Date | null | undefined) => setStartDateLocal(date ?? null)}
                        formatDate={(date?: Date) => (date ? date.toLocaleDateString() : '')}
                        style={{ width: '100%' }}
                      />
                      <Input
                        className={styles.railControl}
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
                  <RadioGroup value={endMode} onChange={(_, d) => setEndMode(d.value as 'none' | 'relative' | 'specific')}>
                    <Radio value="none" label="Does not end" />
                    <div>
                      <Radio value="relative" label="End after X time" />
                      {endMode === 'relative' && (
                        <div className={styles.endSubsection}>
                          <Input
                            className={styles.railControl}
                            inputMode="numeric"
                            value={endAfterAmount}
                            onChange={(_, data) => {
                              // Allow only integers
                              const v = data.value.replace(/[^0-9]/g, '');
                              setEndAfterAmount(v);
                            }}
                            placeholder="Enter a number"
                          />
                          <Dropdown
                            className={styles.railControl}
                            selectedOptions={[endAfterUnit]}
                            button={{ children: endAfterUnit }}
                            onOptionSelect={(_, data) => setEndAfterUnit((data.optionValue as 'Hours' | 'Days' | 'Months') ?? 'Hours')}
                          >
                            <Option value="Hours">Hours</Option>
                            <Option value="Days">Days</Option>
                            <Option value="Months">Months</Option>
                          </Dropdown>
                        </div>
                      )}
                    </div>
                    <div>
                      <Radio value="specific" label="End on a specific date" />
                      {endMode === 'specific' && (
                        <div className={styles.endSubsection}>
                          <DatePicker
                            className={`${styles.railControl} ${styles.datePickerFull}`}
                            placeholder="Select an end date"
                            value={endDateLocal}
                            onSelectDate={(date: Date | null | undefined) => {
                              if (date) {
                                setEndDateLocal(date);
                                setEndTime(prev => prev || '18:00');
                              } else {
                                setEndDateLocal(null);
                                setEndTime('');
                              }
                            }}
                            formatDate={(date?: Date) => (date ? date.toLocaleDateString() : '')}
                            style={{ width: '100%' }}
                          />
                          <Input
                            className={styles.railControl}
                            type="time"
                            value={endTime}
                            placeholder="Select a time"
                            onChange={(_, d) => setEndTime(d.value)}
                          />
                          {scheduleInvalid && (
                            <Text className={styles.railError} role="alert">End must be after Start.</Text>
                          )}
                          <Text className={styles.railCaption}>PST Timezone for demo purposes</Text>
                        </div>
                      )}
                    </div>
                  </RadioGroup>
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
                <Button appearance="primary" icon={<Send16Regular />} onClick={async () => { setPublishOpen(false); await handlePublishNow(); }} disabled={publishing || !variantsValid}>
                  Publish
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      )}

      {/* Schedule Confirmation Modal (Draft, Schedule for later) */}
      {/* Change Type Modal (Draft, empty config only) */}
      {campaign?.state === 'Draft' && changingType && (
        <Dialog open={changingType} onOpenChange={(_, d) => setChangingType(d.open)}>
          <DialogSurface>
            <DialogBody>
              <DialogTitle action={<Button appearance="subtle" aria-label="close" icon={<Dismiss24Regular />} onClick={() => setChangingType(false)} />}>Change campaign type</DialogTitle>
              <DialogContent>
                <Field label="Type">
                  <Dropdown selectedOptions={[newType]} onOptionSelect={(_, data) => setNewType((data.optionValue as 'OFFER' | 'POLL' | 'QUIZ' | 'QUEST') ?? 'OFFER')}>
                    {availableTypes.map(t => (
                      <Option key={t.type} value={t.type}>{t.label}</Option>
                    ))}
                  </Dropdown>
                </Field>
                {newType === 'QUIZ' && (
                  <Field label="Preset">
                    <Dropdown selectedOptions={[String(quizPreset ?? '')]} onOptionSelect={(_, data) => setQuizPreset(data.optionValue ? Number(data.optionValue) : undefined)}>
                      <Option value="">Default (3)</Option>
                      <Option value="3">3 questions</Option>
                      <Option value="10">10 questions</Option>
                    </Dropdown>
                  </Field>
                )}
                <MessageBar intent="info">Changing type will reset content to the selected template.</MessageBar>
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={() => setChangingType(false)}>Cancel</Button>
                <Button appearance="primary" onClick={handleApplyTypeChange}>Apply</Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      )}
      {campaign?.state === 'Draft' && publishMode === 'later' && (
        <Dialog open={scheduleOpen} onOpenChange={(_, data) => setScheduleOpen(data.open)}>
          <DialogSurface>
            <DialogBody>
              <DialogTitle action={<Button appearance="subtle" aria-label="close" icon={<Dismiss24Regular />} onClick={() => setScheduleOpen(false)} />}>Are you sure you want to schedule this campaign?</DialogTitle>
              <DialogContent>
                <Text>
                  {(() => {
                    const startStr = startDateLocal ? `${startDateLocal.toLocaleDateString()} ${formatTimeAmPmPst(startTime)}` : '';
                    const endStr = endMode === 'specific' && endDateLocal ? `${endDateLocal.toLocaleDateString()} ${formatTimeAmPmPst(endTime)}` : '';
                    if (startStr) {
                      if (endMode === 'relative') {
                        const rel = endAfterAmount && endAfterUnit ? `${endAfterAmount} ${endAfterUnit.toLowerCase()}` : '';
                        return `Users will start seeing your content on ${startStr}. Users will stop seeing your content ${rel ? `after ${rel}` : 'after the configured duration'}.`;
                      }
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
                <Button appearance="primary" icon={<Calendar16Regular />} onClick={async () => { setScheduleOpen(false); await handleSchedule(); }} disabled={scheduling || !variantsValid || !startDateLocal || !startTime}>
                  Schedule
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      )}

      {/* AI Duplicate Modal (Draft) */}
      {campaign?.state === 'Draft' && (
        <Dialog open={aiOpen} onOpenChange={(_, d) => setAiOpen(d.open)}>
          <DialogSurface>
            <DialogBody>
              <DialogTitle action={<Button appearance="subtle" aria-label="close" icon={<Dismiss24Regular />} onClick={() => setAiOpen(false)} />}>AI Duplicate content</DialogTitle>
              <DialogContent>
                <div className={styles.formRow}>
                  <Text>Based on: {aiSourceIndex !== null ? (variantsDraft[aiSourceIndex]?.market || 'Unassigned') : '—'}</Text>
                  <Field label="Target market">
                    <Dropdown
                      selectedOptions={[aiTargetMarket]}
                      placeholder="Select a market"
                      button={{ children: aiTargetMarket || 'Select a market' }}
                      onOptionSelect={(_, data) => setAiTargetMarket((data.optionValue as string) || '')}
                    >
                      {AVAILABLE_MARKETS.filter(m => !usedMarkets.includes(m)).map(m => (
                        <Option key={m} value={m}>{m}</Option>
                      ))}
                    </Dropdown>
                  </Field>
                  {usedMarkets.length >= AVAILABLE_MARKETS.length && (
                    <MessageBar intent="warning">All markets are already used.</MessageBar>
                  )}
                </div>
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={() => setAiOpen(false)}>Cancel</Button>
                <Button appearance="primary" onClick={handleAiGenerate} disabled={aiBusy || !aiTargetMarket || usedMarkets.includes(aiTargetMarket)}>
                  {aiBusy ? 'Generating…' : 'Generate'}
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
