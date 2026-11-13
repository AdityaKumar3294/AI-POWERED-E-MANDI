import { apiClient } from '@/lib/api';
import type { Order, OrderStatus } from '@/types';
import type { CreateOrderInput } from './schemas';

export interface OrdersResponse {
  success: boolean;
  count: number;
  orders: Order[];
}

export interface OrderDetailResponse {
  success: boolean;
  order: Order;
}

export const orderApi = {
  createOrder: async (data: CreateOrderInput): Promise<OrderDetailResponse> => {
    return apiClient<OrderDetailResponse>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMyOrders: async (): Promise<OrdersResponse> => {
    return apiClient<OrdersResponse>('/api/orders', {
      method: 'GET',
    });
  },

  getOrderById: async (id: string): Promise<OrderDetailResponse> => {
    return apiClient<OrderDetailResponse>(`/api/orders/${id}`, {
      method: 'GET',
    });
  },

  updateOrderStatus: async (id: string, status: OrderStatus): Promise<OrderDetailResponse> => {
    return apiClient<OrderDetailResponse>(`/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

