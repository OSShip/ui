import { api } from './client';

export interface Session {
  id: string;
  listing_id: string;
  scheduled_at: string;
  jitsi_url: string;
  status: string;
}

export async function fetchListingSessions(listingId: string): Promise<Session[]> {
  return api<Session[]>(`/sessions/listings/${listingId}`);
}

export async function joinSession(sessionId: string): Promise<{ jitsi_url: string }> {
  return api<{ jitsi_url: string }>(`/sessions/${sessionId}/join`, { method: 'POST' });
}

export async function createSession(payload: { listing_id: string; scheduled_at: string }) {
  return api('/sessions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
