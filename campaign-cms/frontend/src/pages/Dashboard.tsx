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
} from '@fluentui/react-components';
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
import type { Campaign, CampaignFilters, CampaignState, Channel } from '../types/Campaign';
import { Header } from '../components/Header';
import { Loading } from '../components/Loading';
import { CreateCampaignModal } from '../components/CreateCampaignModal';
import { FilterPanel, type DateFilterOption } from '../components/FilterPanel';
import { LeftNavigation } from '../components/LeftNavigation';
import { format, isAfter, isBefore, subDays, startOfDay } from 'date-fns';

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
});

export const Dashboard: React.FC = () => {
  const styles = useStyles();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stateFilter, setStateFilter] = useState<CampaignState | 'all'>('all');
  const [marketFilter, setMarketFilter] = useState<string>('any');
  const [channelFilter, setChannelFilter] = useState<string>('any');
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(true);
  const [visibleColumns, setVisibleColumns] = useState<{
    title: boolean;
    campaignId: boolean;
    state: boolean;
    channels: boolean;
    markets: boolean;
    updatedAt: boolean;
    actions: boolean;
  }>({
    title: true,
    campaignId: false, // Hidden by default
    state: true,
    channels: true,
    markets: false, // Hidden by default
    updatedAt: true,
    actions: true,
  });
  const [filters, setFilters] = useState<CampaignFilters>({
    page: 1,
    limit: 50,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  // Load campaigns
  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await campaignService.getCampaigns(filters);
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
    channelFilter: string,
    dateFilter: DateFilterOption,
    customDate: Date | null
  ): Campaign[] => {
    let filtered = campaigns;

    // Apply state filter first
    if (stateFilter !== 'all') {
      filtered = filtered.filter(campaign => campaign.state === stateFilter);
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

    // Apply channel filter
    if (channelFilter !== 'any') {
      filtered = filtered.filter(campaign => {
        return campaign.channels.includes(channelFilter as Channel);
      });
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(campaign => {
        const campaignDate = new Date(campaign.updatedAt);
        
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

        // Search in channels
        if (campaign.channels.some(channel => channel.toLowerCase().includes(searchTerm))) {
          return true;
        }

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
        <Badge 
          appearance={
            item.state === 'Live' ? 'filled' :
            item.state === 'Scheduled' ? 'outline' :
            item.state === 'Draft' ? 'tint' : 'ghost'
          }
          color={
            item.state === 'Live' ? 'success' :
            item.state === 'Scheduled' ? 'important' :
            item.state === 'Draft' ? 'informative' : 'subtle'
          }
        >
          {item.state}
        </Badge>
      ),
    }),
    // Channels column (optional)
    visibleColumns.channels && createTableColumn<Campaign>({
      columnId: 'channels',
      renderHeaderCell: () => 'Channels',
      renderCell: (item) => (
        <Text>{item.channels.join(', ')}</Text>
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
            onClick={() => console.log('Edit campaign:', item.id)}
            title="Edit campaign"
          />
        </div>
      ),
    }),
  ].filter(Boolean) as TableColumnDefinition<Campaign>[];

  // Load campaigns on component mount and when filters change
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Remove search and state from filters since we're doing client-side filtering
        const backendFilters = { ...filters };
        delete backendFilters.search;
        delete backendFilters.state;
        
        const response = await campaignService.getCampaigns(backendFilters);
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

    loadData();
  }, [filters]);

  // Apply client-side filtering whenever campaigns, searchQuery, stateFilter, marketFilter, channelFilter, dateFilter, or customDate changes
  useEffect(() => {
    const filtered = searchCampaigns(campaigns, searchQuery, stateFilter, marketFilter, channelFilter, dateFilter, customDate);
    setFilteredCampaigns(filtered);
  }, [campaigns, searchQuery, stateFilter, marketFilter, channelFilter, dateFilter, customDate]);

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

  const handleChannelFilterChange = (channel: string) => {
    setChannelFilter(channel);
  };

  // Handle date filter change
  const handleDateFilterChange = (filter: DateFilterOption) => {
    setDateFilter(filter);
    // Reset custom date when changing away from custom options
    if (filter !== 'beforeCustom' && filter !== 'afterCustom') {
      setCustomDate(null);
    }
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
              <CreateCampaignModal onCampaignCreated={loadCampaigns} />
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
          {isFilterPanelOpen && (
            <FilterPanel
              searchQuery={searchQuery}
              stateFilter={stateFilter}
              marketFilter={marketFilter}
              channelFilter={channelFilter}
              dateFilter={dateFilter}
              customDate={customDate}
              onSearchChange={handleSearchChange}
              onStateFilterChange={handleStateFilterChange}
              onMarketFilterChange={handleMarketFilterChange}
              onChannelFilterChange={handleChannelFilterChange}
              onDateFilterChange={handleDateFilterChange}
              onCustomDateChange={handleCustomDateChange}
              totalCampaigns={0}
              filteredCount={0}
            />
          )}
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
              <CreateCampaignModal onCampaignCreated={loadCampaigns} />
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
                    icon={visibleColumns.channels ? <CheckboxChecked24Regular /> : <CheckboxUnchecked24Regular />}
                    onClick={() => toggleColumnVisibility('channels')}
                  >
                    Channels
                  </MenuItem>
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

        {isFilterPanelOpen && (
          <FilterPanel
            searchQuery={searchQuery}
            stateFilter={stateFilter}
            marketFilter={marketFilter}
            channelFilter={channelFilter}
            dateFilter={dateFilter}
            customDate={customDate}
            onSearchChange={handleSearchChange}
            onStateFilterChange={handleStateFilterChange}
            onMarketFilterChange={handleMarketFilterChange}
            onChannelFilterChange={handleChannelFilterChange}
            onDateFilterChange={handleDateFilterChange}
            onCustomDateChange={handleCustomDateChange}
            totalCampaigns={campaigns.length}
            filteredCount={filteredCampaigns.length}
          />
        )}
        </div>
      </div>
    </div>
  );
};
