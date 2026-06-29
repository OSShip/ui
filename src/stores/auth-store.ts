import { create } from 'zustand';
import { clearAuthToken, setAuthToken } from '@/lib/api/client';
import type { User } from '@/lib/api/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  hydrated: boolean;
  hydrate: () => void;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  hydrated: false,

  hydrate: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    const raw = localStorage.getItem('user');

    if (!token) {
      clearAuthToken();
    }

    set({
      token,
      user: raw ? (JSON.parse(raw) as User) : null,
      hydrated: true,
    });
  },

  setAuth: (token, user) => {
    setAuthToken(token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user });
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  clearAuth: () => {
    clearAuthToken();
    localStorage.removeItem('user');
    set({ token: null, user: null });
  },
}));
