import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { orderApi } from './api';
import { productKeys } from '../products/hooks';
import type { CreateOrderInput } from './schemas';
import type { OrderStatus } from '@/types';

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

export function useOrders() {
  return useQuery({
    queryKey: orderKeys.lists(),
    queryFn: () => orderApi.getMyOrders(),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => orderApi.getOrderById(id),
    enabled: Boolean(id),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: CreateOrderInput) => orderApi.createOrder(data),
    onSuccess: (data) => {
      // Invalidate products, orders and dashboards
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      toast.success(`Order #${data.order._id.slice(-6)} placed successfully!`);
      navigate('/buyer/orders');
    },
    onError: (err: any, variables) => {
      // Handle out-of-stock races (400 or 409) with specific explanation & refetch
      if (err.statusCode === 400 || err.statusCode === 409) {
        toast.error(
          err.message || 'Out-of-stock conflict: The requested quantity is no longer available.',
          { duration: 6000 }
        );
      } else {
        toast.error(err.message || 'Failed to place order.');
      }

      // Automatically refetch the product so buyer sees updated live stock
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      orderApi.updateOrderStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.order._id) });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`Order status updated to ${data.order.status}.`);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update order status.');
    },
  });
}

