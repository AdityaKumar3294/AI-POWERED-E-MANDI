import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productApi, type ProductsResponse } from './api';
import type { ProductFilterParams } from './schemas';
import type { ProductStatus } from '@/types';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: ProductFilterParams) => [...productKeys.lists(), filters || {}] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  my: () => [...productKeys.all, 'my'] as const,
};

export function useProducts(filters?: ProductFilterParams) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productApi.getProducts(filters),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productApi.getProductById(id),
    enabled: Boolean(id),
  });
}

export function useMyProducts() {
  return useQuery({
    queryKey: productKeys.my(),
    queryFn: () => productApi.getMyProducts(),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => productApi.createProduct(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Produce listed successfully in the marketplace!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to list product.');
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      productApi.updateProduct(id, formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(data.product._id) });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Product updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update product.');
    },
  });
}

export function useUpdateProductStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ProductStatus }) => {
      const formData = new FormData();
      formData.append('status', status);
      return productApi.updateProduct(id, formData);
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: productKeys.my() });
      const previousMyProducts = queryClient.getQueryData<ProductsResponse>(productKeys.my());

      if (previousMyProducts) {
        queryClient.setQueryData<ProductsResponse>(productKeys.my(), {
          ...previousMyProducts,
          products: previousMyProducts.products.map((p) =>
            p._id === id ? { ...p, status } : p
          ),
        });
      }
      return { previousMyProducts };
    },
    onError: (err: any, _vars, context) => {
      if (context?.previousMyProducts) {
        queryClient.setQueryData(productKeys.my(), context.previousMyProducts);
      }
      toast.error(err.message || 'Failed to update produce status');
    },
    onSuccess: () => {
      toast.success('Status updated successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Product deleted successfully.');
    },
    onError: (err: any) => {
      if (err.statusCode === 409 || err.status === 409 || (err.message && err.message.toLowerCase().includes('order'))) {
        toast.error('Cannot delete: this product has pending or confirmed orders. You can set it to Inactive instead.');
      } else {
        toast.error(err.message || 'Failed to delete product.');
      }
    },
  });
}
