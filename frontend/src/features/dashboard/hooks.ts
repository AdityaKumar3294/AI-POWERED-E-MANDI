import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from './api';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  farmer: () => [...dashboardKeys.all, 'farmer'] as const,
  buyer: () => [...dashboardKeys.all, 'buyer'] as const,
};

export function useFarmerDashboard() {
  return useQuery({
    queryKey: dashboardKeys.farmer(),
    queryFn: () => dashboardApi.getFarmerDashboard(),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useBuyerDashboard() {
  return useQuery({
    queryKey: dashboardKeys.buyer(),
    queryFn: () => dashboardApi.getBuyerDashboard(),
    staleTime: 1000 * 30, // 30 seconds
  });
}

