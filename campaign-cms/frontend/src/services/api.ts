import axios from 'axios';
import type { Campaign, CreateCampaignRequest, UpdateCampaignRequest, ApiResponse, PaginatedResponse, CampaignFilters } from '../types/Campaign';

// Get API base URL from environment variables with fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Development logging
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL);
}

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
apiClient.interceptors.request.use((config) => {
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const campaignService = {
  // Get all campaigns with optional filters
  async getCampaigns(filters: CampaignFilters = {}): Promise<PaginatedResponse<Campaign>> {
    const params = new URLSearchParams();
    
    if (filters.state) params.append('state', filters.state);
    if (filters.channel) params.append('channel', filters.channel);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await apiClient.get(`/campaigns?${params.toString()}`);
    return response.data;
  },

  // Get single campaign by ID
  async getCampaign(id: number): Promise<ApiResponse<Campaign>> {
    const response = await apiClient.get(`/campaigns/${id}`);
    return response.data;
  },

  // Create new campaign
  async createCampaign(campaign: CreateCampaignRequest): Promise<ApiResponse<Campaign>> {
    const response = await apiClient.post('/campaigns', campaign);
    return response.data;
  },

  // Update existing campaign
  async updateCampaign(id: number, campaign: UpdateCampaignRequest): Promise<ApiResponse<Campaign>> {
    const response = await apiClient.put(`/campaigns/${id}`, campaign);
    return response.data;
  },

  // Delete campaign
  async deleteCampaign(id: number): Promise<ApiResponse<null>> {
    const response = await apiClient.delete(`/campaigns/${id}`);
    return response.data;
  },

  // Duplicate campaign -> creates a new Draft copied from the original
  async duplicateCampaign(id: number): Promise<ApiResponse<Campaign>> {
    const response = await apiClient.post(`/campaigns/${id}/duplicate`);
    return response.data;
  },

  // Workflow operations
  async transitionCampaignState(id: number, newState: string): Promise<ApiResponse<Campaign>> {
    const response = await apiClient.put(`/workflow/campaigns/${id}/transition`, { newState });
    return response.data;
  },

  // Schedule campaign
  async scheduleCampaign(id: number, startDate: string, endDate?: string): Promise<ApiResponse<Campaign>> {
    const response = await apiClient.post(`/workflow/campaigns/${id}/schedule`, { startDate, endDate });
    return response.data;
  },

  // Publish campaign (Draft -> Live now, or Scheduled if publishDate in the future)
  async publishCampaign(id: number, publishDate?: string): Promise<ApiResponse<Campaign>> {
    const path = `/workflow/publish/${id}`;
    const payload = publishDate ? { publishDate } : {};
    const response = await apiClient.post(path, payload);
    return response.data;
  },

  // Stop campaign
  async stopCampaign(id: number): Promise<ApiResponse<Campaign>> {
    const response = await apiClient.post(`/workflow/campaigns/${id}/stop`);
    return response.data;
  },

  // Unschedule campaign (Scheduled -> Draft)
  async unscheduleCampaign(id: number): Promise<ApiResponse<Campaign>> {
    const response = await apiClient.post(`/workflow/unschedule/${id}`);
    return response.data;
  },
};

// Health check services
export const healthService = {
  async checkApiHealth(): Promise<ApiResponse<{ status: string }>> {
    const response = await apiClient.get('/health');
    return response.data;
  },

  async checkDatabaseHealth(): Promise<ApiResponse<{ status: string }>> {
    const response = await apiClient.get('/db-health');
    return response.data;
  },
};
