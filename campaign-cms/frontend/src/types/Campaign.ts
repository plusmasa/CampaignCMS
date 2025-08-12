// Campaign types matching backend API
export interface Campaign {
  id: number;
  campaignId: string;
  type?: CampaignType;
  templateVersion?: number;
  title: string;
  state: CampaignState;
  startDate?: string;
  endDate?: string;
  markets: string | string[]; // "all" or array of market codes
  partnerId?: number | null;
  partner?: { id: number; name: string; active: boolean } | null;
  config?: unknown;
  createdAt: string;
  updatedAt: string;
}

export type CampaignState = 'Draft' | 'Scheduled' | 'Live' | 'Complete' | 'Deleted';

export type CampaignType = 'OFFER' | 'POLL' | 'QUIZ' | 'QUEST' | 'HERO_BANNER';

export interface CreateCampaignRequest {
  title: string;
  markets: string | string[];
  startDate?: string;
  endDate?: string;
  partnerId?: number | null;
}

export interface CreateCampaignWithTypeRequest extends CreateCampaignRequest {
  type: CampaignType;
  preset?: { questionCount?: number };
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
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
