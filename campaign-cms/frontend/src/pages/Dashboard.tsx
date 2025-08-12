import React, { useState, useEffect } from 'react';
import {
  Button,
  makeStyles,
  shorthands,
  DataGrid,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridBody,
  DataGridRow,
  DataGridCell,
  createTableColumn,
  Badge,
  Text,
  Title2,
  MessageBar,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  tokens,
} from '@fluentui/react-components';
// Note: column animations removed per request; DataGrid uses default behavior.
import type { TableColumnDefinition } from '@fluentui/react-components';
import {
  ArrowCircleRight24Regular,
  Filter24Regular,
  LayoutColumnTwo24Regular,
  CheckboxChecked24Regular,
  CheckboxUnchecked24Regular,
  ArrowUpload16Regular,
} from '@fluentui/react-icons';
import { campaignService } from '../services/api';
import { partnerService } from '../services/api';
import { getBadgeStyle } from '../constants/stateBadge';
import type { Campaign, CampaignState } from '../types/Campaign';
import { Header } from '../components/Header';
import { Loading } from '../components/Loading';
// CreateCampaignModal removed in Phase 5 in favor of dedicated editor page
import { FilterPanel, type DateFilterOption, type DateFieldOption } from '../components/FilterPanel';
import { LeftNavigation } from '../components/LeftNavigation';
import { format, isAfter, isBefore, subDays, startOfDay } from 'date-fns';

// (no-op)

type VisibleColumns = {
  title: boolean;
  campaignId: boolean;
  state: boolean;
  partner: boolean;
  startDate: boolean;
  endDate: boolean;
  markets: boolean;
  updatedAt: boolean;
  actions: boolean;
};

const useStyles = makeStyles({
  root: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  contentWithPanel: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.overflow('hidden'),
    ...shorthands.padding('0', '24px'),
  },
  container: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.overflow('hidden'),
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    ...shorthands.gap('8px'),
    ...shorthands.padding('16px', '24px'),
    borderBottom: '1px solid var(--colorNeutralStroke2)',
  },
  filterToggle: {
    // Styles for filter toggle button
  },
  dataGrid: {
    flex: 1,
    ...shorthands.overflow('auto'),
  },
  // no grid wrapper
  actionsColumn: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
  },
  errorMessage: {
    ...shorthands.margin('16px', '24px'),
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    ...shorthands.gap('16px'),
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('12px'),
  },
  // removed table animation styles
  // Animated right rail container (kept mounted for transitions)
  panelContainer: {
    overflow: 'hidden',
    width: '300px', // matches FilterPanel width including border/padding via border-box
  flex: '0 0 auto', // prevent shrinking; width controls actual size
    transitionProperty: 'width',
    transitionDuration: tokens.durationFast,
    transitionTimingFunction: tokens.curveEasyEase,
  },
  panelContainerClosed: {
    width: '0px',
  },
  panelInner: {
    height: '100%',
    transform: 'translateX(0)',
    opacity: 1,
  width: '100%',
    transitionProperty: 'transform, opacity',
    transitionDuration: tokens.durationFast,
    transitionTimingFunction: tokens.curveEasyEase,
    willChange: 'transform, opacity',
  },
  panelInnerClosed: {
    transform: 'translateX(100%)',
    opacity: 0,
  },
});

export const Dashboard: React.FC = () => {
  const styles = useStyles();
  // no animation keyframes
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stateFilter, setStateFilter] = useState<CampaignState | 'all'>('all');
  const [marketFilter, setMarketFilter] = useState<string>('any');
  const [partnerFilter, setPartnerFilter] = useState<string>('any');
  // channel filter removed
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');
  const [dateField, setDateField] = useState<DateFieldOption>('updatedAt');
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(true);
  const [partners, setPartners] = useState<Array<{ id: number; name: string; active: boolean }>>([]);
  // removed gridPulse state
  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>(() => {
    const defaults: VisibleColumns = {
      title: true,
      campaignId: false, // Hidden by default
      state: true,
      // channels removed
      partner: false,
      startDate: false, // Hidden by default
      endDate: false, // Hidden by default
      markets: false, // Hidden by default
      updatedAt: true,
      actions: true,
    };
    try {
      const KEY = 'dashboard.visibleColumns.v1';
      const raw = typeof window !== 'undefined' ? localStorage.getItem(KEY) : null;
      if (raw) {
        const saved = JSON.parse(raw) as Partial<VisibleColumns> | null;
        const keys: (keyof VisibleColumns)[] = [
          'title',
          'campaignId',
          'state',
          'partner',
          'startDate',
          'endDate',
          'markets',
          'updatedAt',
          'actions',
        ];
        const merged: VisibleColumns = { ...defaults };
        if (saved && typeof saved === 'object') {
          keys.forEach((k) => {
            const v = saved[k];
            if (typeof v === 'boolean') {
              merged[k] = v;
            }
          });
        }
        // Enforce required column
        merged.title = true;
        return merged;
      }
    } catch {
      // ignore storage errors
    }
    return { ...defaults };
  });
  // Backend fetch currently ignores client-side filters except pagination; simplified for Phase 5 draft work

  // Load campaigns
  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
  const response = await campaignService.getCampaigns({ page: 1, limit: 100, sortBy: 'updatedAt', sortOrder: 'desc' });
      if (response.success && response.data) {
        setCampaigns(response.data);
      } else {
        setError(response.message || 'Failed to load campaigns');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  // Client-side search function
  const searchCampaigns = (
    campaigns: Campaign[], 
    query: string, 
    stateFilter: CampaignState | 'all', 
    marketFilter: string,
    partnerFilter: string,
  dateFilter: DateFilterOption,
  dateField: DateFieldOption,
    customDate: Date | null
  ): Campaign[] => {
  let filtered = campaigns.filter(c => c.state !== 'Deleted');

    // Apply state filter first
    if (stateFilter !== 'all') {
      filtered = filtered.filter(campaign => campaign.state === stateFilter);
    }

    // Apply partner filter
    if (partnerFilter !== 'any') {
      if (partnerFilter === 'none') {
        filtered = filtered.filter(c => !c.partnerId);
      } else {
        const pid = Number(partnerFilter);
        filtered = filtered.filter(c => c.partnerId === pid);
      }
    }

    // Apply market filter
    if (marketFilter !== 'any') {
      filtered = filtered.filter(campaign => {
        if (marketFilter === 'all') {
          // Show campaigns that target all markets
          return campaign.markets === 'all';
        } else {
          // Show campaigns that include this specific market or target all markets
          if (campaign.markets === 'all') {
            return true; // Global campaigns appear in all market filters
          }
          if (Array.isArray(campaign.markets)) {
            return campaign.markets.includes(marketFilter);
          }
          return false;
        }
      });
    }

  // Channel filtering removed

  // Apply date filter (based on selected date field)
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(campaign => {
    let source: string | undefined;
    if (dateField === 'updatedAt') source = campaign.updatedAt as unknown as string;
    else if (dateField === 'startDate') source = campaign.startDate as unknown as string | undefined;
    else if (dateField === 'endDate') source = campaign.endDate as unknown as string | undefined;
    if (!source) return false;
    const campaignDate = new Date(source);
        
        switch (dateFilter) {
          case 'last7days':
            return isAfter(campaignDate, subDays(now, 7));
          case 'last30days':
            return isAfter(campaignDate, subDays(now, 30));
          case 'last90days':
            return isAfter(campaignDate, subDays(now, 90));
          case 'last365days':
            return isAfter(campaignDate, subDays(now, 365));
          case 'beforeCustom':
            return customDate ? isBefore(campaignDate, startOfDay(customDate)) : true;
          case 'afterCustom':
            return customDate ? isAfter(campaignDate, startOfDay(customDate)) : true;
          default:
            return true;
        }
      });
    }

    // Apply search query
    if (query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      filtered = filtered.filter(campaign => {
        // Search in title
        if (campaign.title.toLowerCase().includes(searchTerm)) {
          return true;
        }

        // Search in state
        if (campaign.state.toLowerCase().includes(searchTerm)) {
          return true;
        }

  // Channel search removed

        // Search in markets
        if (typeof campaign.markets === 'string') {
          if (campaign.markets.toLowerCase().includes(searchTerm)) {
            return true;
          }
        } else if (Array.isArray(campaign.markets)) {
          if (campaign.markets.some(market => market.toLowerCase().includes(searchTerm))) {
            return true;
          }
        }

        // Search in formatted dates
        const createdDate = format(new Date(campaign.createdAt), 'MMM dd, yyyy').toLowerCase();
        const updatedDate = format(new Date(campaign.updatedAt), 'MMM dd, yyyy').toLowerCase();
        if (createdDate.includes(searchTerm) || updatedDate.includes(searchTerm)) {
          return true;
        }

        // Search in formatted years
        const createdYear = format(new Date(campaign.createdAt), 'yyyy');
        const updatedYear = format(new Date(campaign.updatedAt), 'yyyy');
        if (createdYear.includes(searchTerm) || updatedYear.includes(searchTerm)) {
          return true;
        }

        return false;
      });
    }

    return filtered;
  };

  // Define columns for the DataGrid (moved inside component to access styles)
  const columns: TableColumnDefinition<Campaign>[] = [
    // Title column (always visible - required)
    visibleColumns.title && createTableColumn<Campaign>({
      columnId: 'title',
      compare: (a, b) => a.title.localeCompare(b.title),
      renderHeaderCell: () => 'Campaign Name',
      renderCell: (item) => (
        <Text weight="semibold">{item.title}</Text>
      ),
    }),
    // Campaign ID column (optional, hidden by default)
    visibleColumns.campaignId && createTableColumn<Campaign>({
      columnId: 'campaignId',
      compare: (a, b) => a.campaignId.localeCompare(b.campaignId),
      renderHeaderCell: () => 'Campaign ID',
      renderCell: (item) => (
        <Text style={{ fontFamily: 'monospace' }}>{item.campaignId}</Text>
      ),
    }),
    // State column (optional)
  visibleColumns.state && createTableColumn<Campaign>({
      columnId: 'state',
      compare: (a, b) => a.state.localeCompare(b.state),
      renderHeaderCell: () => 'State',
      renderCell: (item) => (
    <Badge {...getBadgeStyle(item.state)}>
          {item.state}
        </Badge>
      ),
    }),
    // Channels column (optional)
  // Channels column removed
    // Partner column (optional)
    visibleColumns.partner && createTableColumn<Campaign>({
      columnId: 'partner',
      compare: (a, b) => (a.partner?.name || '').localeCompare(b.partner?.name || ''),
      renderHeaderCell: () => 'Partner',
      renderCell: (item) => (
        <Text>{item.partner?.name || 'No Partner'}</Text>
      ),
    }),
    // Start Date column (optional)
    visibleColumns.startDate && createTableColumn<Campaign>({
      columnId: 'startDate',
      compare: (a, b) => {
        const ta = a.startDate ? new Date(a.startDate).getTime() : 0;
        const tb = b.startDate ? new Date(b.startDate).getTime() : 0;
        return ta - tb;
      },
      renderHeaderCell: () => 'Start Date',
      renderCell: (item) => (
        <Text>
          {item.state === 'Draft' ? '-' : (item.startDate ? format(new Date(item.startDate), 'MMM dd, yyyy') : '-')}
        </Text>
      ),
    }),
    // End Date column (optional)
    visibleColumns.endDate && createTableColumn<Campaign>({
      columnId: 'endDate',
      compare: (a, b) => {
        const ta = a.endDate ? new Date(a.endDate).getTime() : 0;
        const tb = b.endDate ? new Date(b.endDate).getTime() : 0;
        return ta - tb;
      },
      renderHeaderCell: () => 'End Date',
      renderCell: (item) => (
        <Text>
          {item.state === 'Draft' ? '-' : (item.endDate ? format(new Date(item.endDate), 'MMM dd, yyyy') : 'No end date')}
        </Text>
      ),
    }),
    // Markets column (optional, hidden by default)
    visibleColumns.markets && createTableColumn<Campaign>({
      columnId: 'markets',
      renderHeaderCell: () => 'Markets',
      renderCell: (item) => (
        <Text>
          {item.markets === 'all' ? 'All Markets' : 
           Array.isArray(item.markets) ? item.markets.join(', ') : 
           item.markets}
        </Text>
      ),
    }),
    // Last Modified column (optional)
    visibleColumns.updatedAt && createTableColumn<Campaign>({
      columnId: 'updatedAt',
      compare: (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      renderHeaderCell: () => 'Last Modified',
      renderCell: (item) => (
        <Text>{format(new Date(item.updatedAt), 'MMM dd, yyyy')}</Text>
      ),
    }),
    // Actions column (optional)
    visibleColumns.actions && createTableColumn<Campaign>({
      columnId: 'actions',
      renderHeaderCell: () => 'Actions',
      renderCell: (item) => (
        <div className={styles.actionsColumn}>
          <Button
            appearance="subtle"
            icon={<ArrowCircleRight24Regular />}
            size="small"
            onClick={() => window.open(`/campaigns/${item.id}`, '_blank')}
            title="Edit campaign"
          />
        </div>
      ),
    }),
  ].filter(Boolean) as TableColumnDefinition<Campaign>[];

  // Load campaigns on component mount and when filters change
  useEffect(() => { loadCampaigns(); }, []);
  // Persist visible columns whenever they change
  useEffect(() => {
    try {
      const KEY = 'dashboard.visibleColumns.v1';
      // Ensure required column stays true
      const toStore = { ...visibleColumns, title: true };
      localStorage.setItem(KEY, JSON.stringify(toStore));
    } catch {
      // ignore storage errors
    }
  }, [visibleColumns]);
  useEffect(() => {
    const loadPartners = async () => {
      try {
        const res = await partnerService.list();
        if (res.success && Array.isArray(res.data)) {
          setPartners(res.data);
        }
      } catch {
        // ignore
      }
    };
    loadPartners();
  }, []);

  // Apply client-side filtering whenever campaigns, searchQuery, stateFilter, marketFilter, partnerFilter, dateFilter, dateField, or customDate changes
  useEffect(() => {
    const filtered = searchCampaigns(campaigns, searchQuery, stateFilter, marketFilter, partnerFilter, dateFilter, dateField, customDate);
    setFilteredCampaigns(filtered);
  }, [campaigns, searchQuery, stateFilter, marketFilter, partnerFilter, dateFilter, dateField, customDate]);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  // Handle state filter change
  const handleStateFilterChange = (state: CampaignState | 'all') => {
    setStateFilter(state);
  };

  // Handle market filter change
  const handleMarketFilterChange = (market: string) => {
    setMarketFilter(market);
  };
  const handlePartnerFilterChange = (partner: string) => {
    setPartnerFilter(partner);
  };

  // channel filter removed

  // Handle date filter change
  const handleDateFilterChange = (filter: DateFilterOption) => {
    setDateFilter(filter);
    // Reset custom date when changing away from custom options
    if (filter !== 'beforeCustom' && filter !== 'afterCustom') {
      setCustomDate(null);
    }
  };
  const handleDateFieldChange = (field: DateFieldOption) => {
    setDateField(field);
  };

  // Handle custom date change
  const handleCustomDateChange = (date: Date | null) => {
    setCustomDate(date);
  };

  // Toggle filter panel visibility
  const toggleFilterPanel = () => {
    setIsFilterPanelOpen(!isFilterPanelOpen);
  };

  // Toggle column visibility
  const toggleColumnVisibility = (columnKey: keyof typeof visibleColumns) => {
    // Prevent hiding the title column as it's required
    if (columnKey === 'title') return;
    
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  if (loading && filteredCampaigns.length === 0) {
    return (
      <div className={styles.container}>
        <Header 
          title="Campaign Management" 
          subtitle="This is a demo of a proposed internal tool for self serve campaign management. All this data is fake so feel free to play around."
          actions={
            <div className={styles.headerActions}>
              <Button
                appearance="secondary"
                icon={<ArrowUpload16Regular />}
              >
                Bulk Upload Campaigns
              </Button>
              <Button appearance="primary" onClick={() => window.open('/campaigns/new', '_blank')}>New Campaign</Button>
            </div>
          }
        />
        <div className={styles.content}>
          <main className={styles.main}>
            <div className={styles.toolbar}>
              <Button
                appearance="subtle"
                icon={<Filter24Regular />}
                onClick={toggleFilterPanel}
                className={styles.filterToggle}
                title={isFilterPanelOpen ? "Hide filters" : "Show filters"}
              />
            </div>
            <Loading message="Loading campaigns..." />
          </main>
          <div className={`${styles.panelContainer} ${!isFilterPanelOpen ? styles.panelContainerClosed : ''}`}>
            <div className={`${styles.panelInner} ${!isFilterPanelOpen ? styles.panelInnerClosed : ''}`}>
              <FilterPanel
                searchQuery={searchQuery}
                stateFilter={stateFilter}
                marketFilter={marketFilter}
                partnerFilter={partnerFilter}
                partners={partners}
                // channelFilter removed
              dateFilter={dateFilter}
              dateField={dateField}
                customDate={customDate}
                onSearchChange={handleSearchChange}
                onStateFilterChange={handleStateFilterChange}
                onMarketFilterChange={handleMarketFilterChange}
                onPartnerFilterChange={handlePartnerFilterChange}
                // onChannelFilterChange removed
              onDateFilterChange={handleDateFilterChange}
              onDateFieldChange={handleDateFieldChange}
                onCustomDateChange={handleCustomDateChange}
                totalCampaigns={0}
                filteredCount={0}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <LeftNavigation 
        activeItem="campaigns" 
        onItemClick={(itemId) => console.log('Navigate to:', itemId)} 
      />
      
      <div className={styles.mainContent}>
        <Header 
          title="Campaign Management" 
          subtitle="This is a demo of a proposed internal tool for self serve campaign management. All this data is fake so feel free to play around."
          actions={
            <div className={styles.headerActions}>
              <Button
                appearance="secondary"
                icon={<ArrowUpload16Regular />}
              >
                Bulk Upload Campaigns
              </Button>
              <Button appearance="primary" onClick={() => window.open('/campaigns/new', '_blank')}>New Campaign</Button>
            </div>
          }
        />
        
  <div className={styles.contentWithPanel}>
          <main className={styles.main}>
          {error && (
            <MessageBar intent="error" className={styles.errorMessage}>
              <Title2>Error Loading Campaigns</Title2>
              <Text>{error}</Text>
              <Button appearance="primary" onClick={loadCampaigns}>
                Retry
              </Button>
            </MessageBar>
          )}

          <div className={styles.toolbar}>
            <Menu persistOnItemClick>
              <MenuTrigger>
                <Button
                  appearance="subtle"
                  icon={<LayoutColumnTwo24Regular />}
                  title="Select columns"
                />
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  <MenuItem
                    icon={visibleColumns.title ? <CheckboxChecked24Regular /> : <CheckboxUnchecked24Regular />}
                    disabled={true}
                  >
                    Campaign Name (Required)
                  </MenuItem>
                  <MenuItem
                    icon={visibleColumns.campaignId ? <CheckboxChecked24Regular /> : <CheckboxUnchecked24Regular />}
                    onClick={() => toggleColumnVisibility('campaignId')}
                  >
                    Campaign ID
                  </MenuItem>
                  <MenuItem
                    icon={visibleColumns.state ? <CheckboxChecked24Regular /> : <CheckboxUnchecked24Regular />}
                    onClick={() => toggleColumnVisibility('state')}
                  >
                    State
                  </MenuItem>
                  <MenuItem
                    icon={visibleColumns.partner ? <CheckboxChecked24Regular /> : <CheckboxUnchecked24Regular />}
                    onClick={() => toggleColumnVisibility('partner')}
                  >
                    Partner
                  </MenuItem>
                  <MenuItem
                    icon={visibleColumns.startDate ? <CheckboxChecked24Regular /> : <CheckboxUnchecked24Regular />}
                    onClick={() => toggleColumnVisibility('startDate')}
                  >
                    Start Date
                  </MenuItem>
                  <MenuItem
                    icon={visibleColumns.endDate ? <CheckboxChecked24Regular /> : <CheckboxUnchecked24Regular />}
                    onClick={() => toggleColumnVisibility('endDate')}
                  >
                    End Date
                  </MenuItem>
                  {/* Channels column removed */}
                  <MenuItem
                    icon={visibleColumns.markets ? <CheckboxChecked24Regular /> : <CheckboxUnchecked24Regular />}
                    onClick={() => toggleColumnVisibility('markets')}
                  >
                    Markets
                  </MenuItem>
                  <MenuItem
                    icon={visibleColumns.updatedAt ? <CheckboxChecked24Regular /> : <CheckboxUnchecked24Regular />}
                    onClick={() => toggleColumnVisibility('updatedAt')}
                  >
                    Last Modified
                  </MenuItem>
                  <MenuItem
                    icon={visibleColumns.actions ? <CheckboxChecked24Regular /> : <CheckboxUnchecked24Regular />}
                    onClick={() => toggleColumnVisibility('actions')}
                  >
                    Actions
                  </MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
            
              <Button
              appearance="subtle"
              icon={<Filter24Regular />}
              onClick={toggleFilterPanel}
              className={styles.filterToggle}
              title={isFilterPanelOpen ? "Hide filters" : "Show filters"}
            />
          </div>

          <DataGrid
            items={filteredCampaigns}
            columns={columns}
            sortable
            className={styles.dataGrid}
            focusMode="composite"
          >
            <DataGridHeader>
              <DataGridRow>
                {({ renderHeaderCell }) => (
                  <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
                )}
              </DataGridRow>
            </DataGridHeader>
            <DataGridBody<Campaign>>
              {({ item, rowId }) => (
                <DataGridRow<Campaign> key={rowId}>
                  {({ renderCell }) => (
                    <DataGridCell>{renderCell(item)}</DataGridCell>
                  )}
                </DataGridRow>
              )}
            </DataGridBody>
          </DataGrid>

          {filteredCampaigns.length === 0 && !loading && (
            <div className={styles.emptyState}>
              <Text size={400}>
                {campaigns.length === 0 
                  ? "No campaigns found. Create your first campaign to get started."
                  : searchQuery || stateFilter !== 'all'
                  ? "No campaigns match your current filters."
                  : "No campaigns found."
                }
              </Text>
            </div>
          )}
        </main>

        <div className={`${styles.panelContainer} ${!isFilterPanelOpen ? styles.panelContainerClosed : ''}`}>
          <div className={`${styles.panelInner} ${!isFilterPanelOpen ? styles.panelInnerClosed : ''}`}>
              <FilterPanel
              searchQuery={searchQuery}
              stateFilter={stateFilter}
              marketFilter={marketFilter}
              partnerFilter={partnerFilter}
              partners={partners}
                // channelFilter removed
              dateFilter={dateFilter}
              dateField={dateField}
              customDate={customDate}
              onSearchChange={handleSearchChange}
              onStateFilterChange={handleStateFilterChange}
              onMarketFilterChange={handleMarketFilterChange}
              onPartnerFilterChange={handlePartnerFilterChange}
                // onChannelFilterChange removed
              onDateFilterChange={handleDateFilterChange}
              onDateFieldChange={handleDateFieldChange}
              onCustomDateChange={handleCustomDateChange}
              totalCampaigns={campaigns.length}
              filteredCount={filteredCampaigns.length}
            />
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
