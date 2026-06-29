import { logger } from '@/lib/logger';

function normalizeApiBase(raw: string): string {
  const trimmed = raw.replace(/\/$/, '');
  if (!trimmed) return '/api/v1';
  if (trimmed.endsWith('/api/v1')) return trimmed;
  if (trimmed.endsWith('/api')) return `${trimmed}/v1`;
  // Absolute gateway URL without /api/v1 (e.g. http://host:8080)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return `${trimmed}/api/v1`;
  }
  return trimmed;
}

export const API_URL = normalizeApiBase(process.env.NEXT_PUBLIC_API_URL || '/api/v1');

export const PLATFORM_FEE_PERCENT = 10;

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  logger.debug('api request', { path, method: options.method ?? 'GET', status: res.status });
  if (!res.ok) {
    const text = await res.text();
    logger.warn('api error', { path, status: res.status, body: text.slice(0, 200) });
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function calculateFees(priceCents: number) {
  const fee = Math.round(priceCents * PLATFORM_FEE_PERCENT / 100);
  return { fee, payout: priceCents - fee };
}

export function setAuthToken(token: string) {
  localStorage.setItem('token', token);
  if (typeof document !== 'undefined') {
    document.cookie = `token=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  }
}

export function clearAuthToken() {
  localStorage.removeItem('token');
  if (typeof document !== 'undefined') {
    document.cookie = 'token=; path=/; max-age=0';
  }
}
