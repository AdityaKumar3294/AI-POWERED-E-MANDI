import { apiClient } from '@/lib/api';
import type { AuthResponse, User } from '@/types';
import type { LoginInput, RegisterInput } from './schemas';

export const authApi = {
  login: async (credentials: LoginInput): Promise<AuthResponse> => {
    return apiClient<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (payload: RegisterInput): Promise<AuthResponse> => {
    return apiClient<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getMe: async (): Promise<{ success: boolean; user: User }> => {
    return apiClient<{ success: boolean; user: User }>('/api/auth/me', {
      method: 'GET',
    });
  },
};

