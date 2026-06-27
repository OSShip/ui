import { api, clearAuthToken, setAuthToken } from './client';

export interface User {
  id: string;
  email: string;
  role: string;
  display_name?: string;
  github_username?: string;
}

export async function login(email: string, password: string) {
  const data = await api<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setAuthToken(data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
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
  setAuthToken(data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

export function logout() {
  clearAuthToken();
  localStorage.removeItem('user');
}
