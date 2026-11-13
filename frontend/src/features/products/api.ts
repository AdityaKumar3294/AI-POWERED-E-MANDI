import { apiClient } from '@/lib/api';
import type { Product } from '@/types';
import type { ProductFilterParams } from './schemas';

export interface ProductsResponse {
  success: boolean;
  count: number;
  products: Product[];
}

export interface ProductDetailResponse {
  success: boolean;
  product: Product;
}

export const productApi = {
  getProducts: async (params?: ProductFilterParams): Promise<ProductsResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.search && params.search.trim()) {
      searchParams.set('search', params.search.trim());
    }
    if (params?.grade) {
      searchParams.set('grade', params.grade);
    }
    if (params?.minPrice !== undefined && params.minPrice !== null && !isNaN(params.minPrice)) {
      searchParams.set('minPrice', String(params.minPrice));
    }
    if (params?.maxPrice !== undefined && params.maxPrice !== null && !isNaN(params.maxPrice)) {
      searchParams.set('maxPrice', String(params.maxPrice));
    }
    if (params?.sortBy) {
      searchParams.set('sortBy', params.sortBy);
    }
    if (params?.order) {
      searchParams.set('order', params.order);
    }

    const queryStr = searchParams.toString();
    const endpoint = queryStr ? `/api/products?${queryStr}` : '/api/products';
    return apiClient<ProductsResponse>(endpoint, { method: 'GET' });
  },

  getProductById: async (id: string): Promise<ProductDetailResponse> => {
    return apiClient<ProductDetailResponse>(`/api/products/${id}`, { method: 'GET' });
  },

  getMyProducts: async (): Promise<ProductsResponse> => {
    return apiClient<ProductsResponse>('/api/products/my', { method: 'GET' });
  },

  createProduct: async (formData: FormData): Promise<ProductDetailResponse> => {
    return apiClient<ProductDetailResponse>('/api/products', {
      method: 'POST',
      body: formData,
    });
  },

  updateProduct: async (id: string, formData: FormData): Promise<ProductDetailResponse> => {
    return apiClient<ProductDetailResponse>(`/api/products/${id}`, {
      method: 'PUT',
      body: formData,
    });
  },

  deleteProduct: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient<{ success: boolean; message: string }>(`/api/products/${id}`, {
      method: 'DELETE',
    });
  },
};

