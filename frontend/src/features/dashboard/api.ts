import { apiClient } from '@/lib/api';
import type { FarmerDashboardData, BuyerDashboardData } from '@/types';

export interface FarmerDashboardResponse {
  success: boolean;
  dashboard: FarmerDashboardData;
}

export interface BuyerDashboardResponse {
  success: boolean;
  dashboard: BuyerDashboardData;
}

export const dashboardApi = {
  getFarmerDashboard: async (): Promise<FarmerDashboardResponse> => {
    return apiClient<FarmerDashboardResponse>('/api/farmer/dashboard', {
      method: 'GET',
    });
  },

  getBuyerDashboard: async (): Promise<BuyerDashboardResponse> => {
    return apiClient<BuyerDashboardResponse>('/api/buyer/dashboard', {
      method: 'GET',
    });
  },
};

