import React, { useState, useEffect } from 'react';
import {
  Button,
  Input,
  Dropdown,
  Option,
  Field,
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
} from '@fluentui/react-components';
import type { TableColumnDefinition } from '@fluentui/react-components';
import {
  Edit24Regular,
  Search24Regular,
} from '@fluentui/react-icons';
import { campaignService } from '../services/api';
import type { Campaign, CampaignFilters, CampaignState } from '../types/Campaign';
import { Header } from '../components/Header';
import { Loading } from '../components/Loading';
import { CreateCampaignModal } from '../components/CreateCampaignModal';
import { DeleteCampaignModal } from '../components/DeleteCampaignModal';
import { format } from 'date-fns';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  main: {
    flex: 1,
    ...shorthands.padding('24px', '32px'),
    // Remove overflow: auto to prevent clipping dropdown popups
    // overflow: 'auto',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('16px'),
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  searchInput: {
    minWidth: '300px',
  },
  stateDropdown: {
    minWidth: '180px',
  },
  dataGrid: {
    maxHeight: 'calc(100vh - 300px)',
  },
  stateColumn: {
    display: 'flex',
    alignItems: 'center',
  },
  actionsColumn: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
  },
  errorMessage: {
    marginBottom: '16px',
  },
  emptyState: {
    textAlign: 'center',
    marginTop: '48px',
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
  const searchCampaigns = (campaigns: Campaign[], query: string, stateFilter: CampaignState | 'all'): Campaign[] => {
    let filtered = campaigns;

    // Apply state filter first
    if (stateFilter !== 'all') {
      filtered = filtered.filter(campaign => campaign.state === stateFilter);
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
    createTableColumn<Campaign>({
      columnId: 'title',
      compare: (a, b) => a.title.localeCompare(b.title),
      renderHeaderCell: () => 'Campaign Name',
      renderCell: (item) => (
        <Text weight="semibold">{item.title}</Text>
      ),
    }),
    createTableColumn<Campaign>({
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
    createTableColumn<Campaign>({
      columnId: 'channels',
      renderHeaderCell: () => 'Channels',
      renderCell: (item) => (
        <Text>{item.channels.join(', ')}</Text>
      ),
    }),
    createTableColumn<Campaign>({
      columnId: 'updatedAt',
      compare: (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      renderHeaderCell: () => 'Last Modified',
      renderCell: (item) => (
        <Text>{format(new Date(item.updatedAt), 'MMM dd, yyyy')}</Text>
      ),
    }),
    createTableColumn<Campaign>({
      columnId: 'actions',
      renderHeaderCell: () => 'Actions',
      renderCell: (item) => (
        <div className={styles.actionsColumn}>
          <Button
            appearance="subtle"
            icon={<Edit24Regular />}
            size="small"
            onClick={() => console.log('Edit campaign:', item.id)}
            title="Edit campaign"
          />
          <DeleteCampaignModal 
            campaign={item} 
            onCampaignDeleted={loadCampaigns} 
          />
        </div>
      ),
    }),
  ];

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

  // Apply client-side filtering whenever campaigns, searchQuery, or stateFilter changes
  useEffect(() => {
    const filtered = searchCampaigns(campaigns, searchQuery, stateFilter);
    setFilteredCampaigns(filtered);
  }, [campaigns, searchQuery, stateFilter]);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  // Handle state filter change
  const handleStateFilterChange = (state: CampaignState | 'all') => {
    setStateFilter(state);
  };

  if (loading && filteredCampaigns.length === 0) {
    return (
      <div className={styles.container}>
        <Header 
          title="Campaign Management" 
          subtitle="Manage your marketing campaigns"
          actions={<CreateCampaignModal onCampaignCreated={loadCampaigns} />}
        />
        <Loading message="Loading campaigns..." />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header 
        title="Campaign Management" 
        subtitle="Manage your marketing campaigns"
        actions={<CreateCampaignModal onCampaignCreated={loadCampaigns} />}
      />
      
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
          <Input
            className={styles.searchInput}
            placeholder="Search campaigns..."
            contentBefore={<Search24Regular />}
            value={searchQuery}
            onChange={(_, data) => handleSearchChange(data.value)}
          />

          <Field label="Filter by State">
            <Dropdown 
              className={styles.stateDropdown}
              placeholder="All States" 
              defaultSelectedOptions={["all"]}
              defaultValue="All States"
              onOptionSelect={(_, data) => {
                if (data.optionValue) {
                  handleStateFilterChange(data.optionValue as CampaignState | 'all');
                }
              }}
            >
              <Option value="all">All States</Option>
              <Option value="Draft">Draft</Option>
              <Option value="Scheduled">Scheduled</Option>
              <Option value="Live">Live</Option>
              <Option value="Complete">Complete</Option>
            </Dropdown>
          </Field>
          
          {(searchQuery || stateFilter !== 'all') && (
            <Text size={200}>
              Showing {filteredCampaigns.length} of {campaigns.length} campaigns
              {searchQuery && ` matching "${searchQuery}"`}
              {stateFilter !== 'all' && ` in ${stateFilter} state`}
            </Text>
          )}
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
    </div>
  );
};
