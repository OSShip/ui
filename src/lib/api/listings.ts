import { api } from './client';

export interface Listing {
  id: string;
  mentor_id: string;
  mentor_display_name?: string;
  mentor_github_username?: string;
  oss_project_name: string;
  oss_repo_url: string;
  description: string;
  price_cents: number;
  duration_weeks: number;
  total_slots: number;
  filled_slots: number;
  status: string;
}

export interface PayoutSummary {
  total_gross_cents: number;
  total_mentor_payout_cents: number;
  total_platform_fee_cents: number;
  transaction_count: number;
}

export async function fetchListings(ossProject?: string): Promise<Listing[]> {
  const q = ossProject ? `&oss_project=${encodeURIComponent(ossProject)}` : '';
  return api<Listing[]>(`/listings?status=active${q}`);
}

export async function fetchListing(id: string): Promise<Listing> {
  return api<Listing>(`/listings/${id}`);
}

export async function fetchMentorListings(mentorId: string): Promise<Listing[]> {
  const listings = await fetchListings();
  return listings.filter((l) => l.mentor_id === mentorId);
}

export async function createListing(
  payload: Omit<Listing, 'id' | 'mentor_id' | 'filled_slots' | 'status'> & { status?: string },
) {
  return api<Listing>('/listings', { method: 'POST', body: JSON.stringify(payload) });
}

export async function fetchPayoutSummary(): Promise<PayoutSummary> {
  return api<PayoutSummary>('/public/payout-summary');
}

export async function serverFetchListings(ossProject?: string): Promise<Listing[]> {
  try {
    const base = process.env.INTERNAL_API_URL || 'http://gateway:8080/api/v1';
    const q = ossProject ? `&oss_project=${encodeURIComponent(ossProject)}` : '';
    const res = await fetch(`${base}/listings?status=active${q}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function serverFetchListing(id: string): Promise<Listing | null> {
  try {
    const base = process.env.INTERNAL_API_URL || 'http://gateway:8080/api/v1';
    const res = await fetch(`${base}/listings/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function serverFetchPayoutSummary(): Promise<PayoutSummary | null> {
  try {
    const base = process.env.INTERNAL_API_URL || 'http://gateway:8080/api/v1';
    const res = await fetch(`${base}/public/payout-summary`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
