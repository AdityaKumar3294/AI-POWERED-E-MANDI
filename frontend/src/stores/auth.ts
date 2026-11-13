import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';
import { API_URL } from '@/lib/api';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isRestoring: boolean;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isRestoring: true,

      setAuth: (token: string, user: User) => {
        set({
          token,
          user,
          isAuthenticated: true,
          isRestoring: false,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isRestoring: false,
        });
      },

      restoreSession: async () => {
        const token = get().token;
        if (!token) {
          set({ isRestoring: false, isAuthenticated: false, user: null });
          return;
        }

        try {
          const res = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && data.user) {
              set({
                user: data.user,
                isAuthenticated: true,
                isRestoring: false,
              });
              return;
            }
          }

          // If token expired or invalid (401 / 403)
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isRestoring: false,
          });
        } catch {
          // If backend unreachable, retain cached session for offline PWA view
          set({ isRestoring: false });
        }
      },
    }),
    {
      name: 'emandi-auth-session',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

