// Campaign types matching backend API
export interface Campaign {
  id: number;
  campaignId: string;
  title: string;
  state: CampaignState;
  startDate?: string;
  endDate?: string;
  channels: Channel[];
  markets: string | string[]; // "all" or array of market codes
  channelConfig: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type CampaignState = 'Draft' | 'Scheduled' | 'Live' | 'Complete' | 'Deleted';

export type Channel = 'Email' | 'BNP' | 'Rewards Dashboard';

export interface CreateCampaignRequest {
  title: string;
  channels: Channel[];
  markets: string | string[];
  startDate?: string;
  endDate?: string;
  channelConfig?: Record<string, unknown>;
}

export interface UpdateCampaignRequest extends Partial<CreateCampaignRequest> {
  state?: CampaignState;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter and search types
export interface CampaignFilters {
  state?: CampaignState;
  channel?: Channel;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
