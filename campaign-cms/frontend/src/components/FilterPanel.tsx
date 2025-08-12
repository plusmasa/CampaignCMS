import React from 'react';
import {
  Input,
  Dropdown,
  Option,
  Field,
  makeStyles,
  shorthands,
  Text,
} from '@fluentui/react-components';
import { DatePicker } from '@fluentui/react-datepicker-compat';
import { Search24Regular } from '@fluentui/react-icons';
import type { CampaignState } from '../types/Campaign';

export type DateFilterOption = 
  | 'all' 
  | 'last7days' 
  | 'last30days' 
  | 'last90days' 
  | 'last365days' 
  | 'beforeCustom' 
  | 'afterCustom';

export type DateFieldOption = 'updatedAt' | 'startDate' | 'endDate';

const useStyles = makeStyles({
  panel: {
  width: '300px',
  boxSizing: 'border-box',
    height: '100vh',
    backgroundColor: 'var(--colorNeutralBackground2)',
    borderLeft: '1px solid var(--colorNeutralStroke2)',
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.padding('24px', '20px'),
  },
  filterSection: {
    marginBottom: '20px',
  },
  searchInput: {
    width: '100%',
  },
  dropdown: {
    width: '100%',
  },
  resultsText: {
    marginTop: '16px',
    ...shorthands.padding('8px', '0'),
    borderTop: '1px solid var(--colorNeutralStroke3)',
    fontSize: '12px',
    color: 'var(--colorNeutralForeground2)',
  },
  columnFlex: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '8px',
  },
});

interface FilterPanelProps {
  searchQuery: string;
  stateFilter: CampaignState | 'all';
  marketFilter: string;
  partnerFilter: string; // 'any' | 'none' | partnerId as string
  partners: Array<{ id: number; name: string; active: boolean }>;
  dateFilter: DateFilterOption;
  dateField: DateFieldOption;
  customDate: Date | null;
  onSearchChange: (value: string) => void;
  onStateFilterChange: (state: CampaignState | 'all') => void;
  onMarketFilterChange: (market: string) => void;
  onPartnerFilterChange: (partner: string) => void;
  onDateFilterChange: (filter: DateFilterOption) => void;
  onDateFieldChange: (field: DateFieldOption) => void;
  onCustomDateChange: (date: Date | null) => void;
  totalCampaigns: number;
  filteredCount: number;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  searchQuery,
  stateFilter,
  marketFilter,
  partnerFilter,
  partners,
  dateFilter,
  dateField,
  customDate,
  onSearchChange,
  onStateFilterChange,
  onMarketFilterChange,
  onPartnerFilterChange,
  onDateFilterChange,
  onDateFieldChange,
  onCustomDateChange,
  totalCampaigns,
  filteredCount,
}) => {
  const styles = useStyles();

  return (
    <div className={styles.panel}>
      <div className={styles.filterSection}>
        <Field label="Search">
          <Input
            className={styles.searchInput}
            placeholder="Search campaigns..."
            contentBefore={<Search24Regular />}
            value={searchQuery}
            onChange={(_, data) => onSearchChange(data.value)}
          />
        </Field>
      </div>

      <div className={styles.filterSection}>
        <Field label="Campaign State">
          <Dropdown 
            className={styles.dropdown}
            placeholder="All States" 
            defaultSelectedOptions={["all"]}
            defaultValue="All States"
            onOptionSelect={(_, data) => {
              if (data.optionValue) {
                onStateFilterChange(data.optionValue as CampaignState | 'all');
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
      </div>

      <div className={styles.filterSection}>
        <Field label="Market">
          <Dropdown 
            className={styles.dropdown}
            placeholder="Any Market" 
            defaultSelectedOptions={["any"]}
            defaultValue="Any Market"
            onOptionSelect={(_, data) => {
              if (data.optionValue) {
                onMarketFilterChange(data.optionValue);
              }
            }}
          >
            <Option value="any">Any Market</Option>
            <Option value="all">All Markets</Option>
            <Option value="US">US</Option>
            <Option value="UK">UK</Option>
            <Option value="CA">CA</Option>
            <Option value="AU">AU</Option>
            <Option value="DE">DE</Option>
            <Option value="FR">FR</Option>
            <Option value="JP">JP</Option>
          </Dropdown>
        </Field>
      </div>

      <div className={styles.filterSection}>
        <Field label="Partner">
          <Dropdown
            className={styles.dropdown}
            placeholder="Any Partner"
            defaultSelectedOptions={["any"]}
            defaultValue="Any Partner"
            onOptionSelect={(_, data) => {
              if (data.optionValue !== undefined) {
                onPartnerFilterChange(String(data.optionValue));
              }
            }}
          >
            <Option value="any">Any Partner</Option>
            <Option value="none">No Partner</Option>
            {partners.map(p => (
              <Option key={p.id} value={String(p.id)}>{p.name}</Option>
            ))}
          </Dropdown>
        </Field>
      </div>

  {/* Channel filter removed */}

      <div className={styles.filterSection}>
        <Field label="Filter by Date">
          {/* Date field selector */}
          <div className={styles.columnFlex}>
            <Dropdown
              className={styles.dropdown}
              placeholder="Last modified"
              defaultSelectedOptions={[dateField]}
              defaultValue={
                dateField === 'updatedAt' ? 'Last modified' : dateField === 'startDate' ? 'Start date' : 'End date'
              }
              onOptionSelect={(_, data) => {
                if (data.optionValue) {
                  onDateFieldChange(data.optionValue as DateFieldOption);
                }
              }}
            >
              <Option value="updatedAt">Last modified</Option>
              <Option value="startDate">Start date</Option>
              <Option value="endDate">End date</Option>
            </Dropdown>

            {/* Date range selector */}
            <Dropdown 
              className={styles.dropdown}
              placeholder="Any Date" 
              defaultSelectedOptions={["all"]}
              defaultValue="Any Date"
              onOptionSelect={(_, data) => {
                if (data.optionValue) {
                  onDateFilterChange(data.optionValue as DateFilterOption);
                }
              }}
            >
              <Option value="all">Any Date</Option>
              <Option value="last7days">Last 7 Days</Option>
              <Option value="last30days">Last 30 Days</Option>
              <Option value="last90days">Last 90 Days</Option>
              <Option value="last365days">Last 365 Days</Option>
              <Option value="beforeCustom">Before Custom Date</Option>
              <Option value="afterCustom">After Custom Date</Option>
            </Dropdown>
          </div>
        </Field>
        
        {(dateFilter === 'beforeCustom' || dateFilter === 'afterCustom') && (
          <Field label="Select Date" style={{ marginTop: '12px' }}>
            <DatePicker
              placeholder="Select a date"
              value={customDate}
              onSelectDate={(date: Date | null | undefined) => onCustomDateChange(date || null)}
              formatDate={(date: Date | undefined) => {
                return date ? date.toLocaleDateString() : '';
              }}
            />
          </Field>
        )}
      </div>

      {/* Results counter */}
      <div className={styles.resultsText}>
        <Text size={200}>
          Showing {filteredCount} of {totalCampaigns} campaigns
          {searchQuery && (
            <>
              <br />
              Matching "{searchQuery}"
            </>
          )}
          {stateFilter !== 'all' && (
            <>
              <br />
              In {stateFilter} state
            </>
          )}
          {marketFilter !== 'any' && (
            <>
              <br />
              In {marketFilter === 'all' ? 'all markets' : marketFilter + ' market'}
            </>
          )}
          {partnerFilter !== 'any' && (
            <>
              <br />
              {partnerFilter === 'none' ? 'Without a partner' : `Partner: ${(partners.find(p => String(p.id) === partnerFilter)?.name) || '—'}`}
            </>
          )}
          {/* Channel summary removed */}
      {dateFilter !== 'all' && (
            <>
        <br />
        {dateFilter === 'last7days' && `${dateField === 'updatedAt' ? 'Modified' : dateField === 'startDate' ? 'Start date' : 'End date'} in last 7 days`}
        {dateFilter === 'last30days' && `${dateField === 'updatedAt' ? 'Modified' : dateField === 'startDate' ? 'Start date' : 'End date'} in last 30 days`}
        {dateFilter === 'last90days' && `${dateField === 'updatedAt' ? 'Modified' : dateField === 'startDate' ? 'Start date' : 'End date'} in last 90 days`}
        {dateFilter === 'last365days' && `${dateField === 'updatedAt' ? 'Modified' : dateField === 'startDate' ? 'Start date' : 'End date'} in last 365 days`}
        {dateFilter === 'beforeCustom' && customDate && `${dateField === 'updatedAt' ? 'Modified' : dateField === 'startDate' ? 'Start date' : 'End date'} before ${customDate.toLocaleDateString()}`}
        {dateFilter === 'afterCustom' && customDate && `${dateField === 'updatedAt' ? 'Modified' : dateField === 'startDate' ? 'Start date' : 'End date'} after ${customDate.toLocaleDateString()}`}
            </>
          )}
        </Text>
      </div>
    </div>
  );
};
