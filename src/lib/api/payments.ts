import { api } from './client';

export interface ConnectStatus {
  connected: boolean;
  account_id?: string;
}

export interface LedgerEntry {
  id: string;
  event_type: string;
  gross_cents: number;
  platform_fee_cents: number;
  mentor_payout_cents: number;
  created_at: string;
}

export async function fetchConnectStatus(): Promise<ConnectStatus> {
  return api<ConnectStatus>('/payments/connect/status');
}

export async function startStripeConnect(returnUrl: string, refreshUrl: string) {
  return api<{ onboarding_url: string; account_id: string }>('/payments/connect/onboard', {
    method: 'POST',
    body: JSON.stringify({ return_url: returnUrl, refresh_url: refreshUrl }),
  });
}

export async function fetchLedger(listingId: string): Promise<LedgerEntry[]> {
  return api<LedgerEntry[]>(`/payments/ledger/${listingId}`);
}

export async function createEnrollment(listingId: string) {
  return api<{ id: string }>('/users/enrollments', {
    method: 'POST',
    body: JSON.stringify({ listing_id: listingId }),
  });
}

export async function createCheckout(payload: {
  listing_id: string;
  student_id: string;
  mentor_id: string;
  enrollment_id: string;
  amount_cents: number;
  success_url: string;
  cancel_url: string;
}) {
  return api<{ checkout_url: string }>('/payments/checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
