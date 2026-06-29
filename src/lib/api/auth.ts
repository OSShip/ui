import { api } from './client';
import { useAuthStore } from '@/stores/auth-store';

export interface User {
  id: string;
  email: string;
  role: string;
  display_name?: string;
  github_username?: string;
}

export async function fetchMe(): Promise<User> {
  return api<User>('/auth/me');
}

export async function login(email: string, password: string) {
  const data = await api<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  useAuthStore.getState().setAuth(data.token, data.user);
  return data;
}

export async function register(payload: {
  email: string;
  password: string;
  role?: string;
  display_name?: string;
  github_username?: string;
}) {
  const data = await api<{ token: string; user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  useAuthStore.getState().setAuth(data.token, data.user);
  return data;
}

/** @deprecated Prefer useAuth() hook for reactive auth state */
export function getStoredUser(): User | null {
  const { hydrated, user } = useAuthStore.getState();
  if (hydrated) return user;
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  return raw ? (JSON.parse(raw) as User) : null;
}

export function logout() {
  useAuthStore.getState().clearAuth();
}
