import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authApi } from './api';
import { useAuthStore } from '@/stores/auth';
import type { LoginInput, RegisterInput } from './schemas';

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

export function useCurrentUser() {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => authApi.getMe(),
    enabled: Boolean(token),
    select: (data) => data.user,
  });
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (credentials: LoginInput) => authApi.login(credentials),
    onSuccess: (data) => {
      if (data.token && data.user) {
        setAuth(data.token, data.user);
        toast.success(`Welcome back, ${data.user.name}!`);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Login failed. Please check your credentials.');
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterInput) => authApi.register(payload),
    onSuccess: (data) => {
      toast.success(data.message || 'Account created successfully! Please log in.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Registration failed. Email may already be in use.');
    },
  });
}

