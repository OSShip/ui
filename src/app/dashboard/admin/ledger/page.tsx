'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/api/client';
import { fetchLedger, type LedgerEntry } from '@/lib/api/payments';

export default function AdminLedgerPage() {
  const [listingId, setListingId] = useState('');
  const [entries, setEntries] = useState<LedgerEntry[]>([]);

  async function loadLedger() {
    if (!listingId) return;
    try {
      const data = await fetchLedger(listingId);
      setEntries(data);
    } catch {
      setEntries([]);
    }
  }

  return (
    <>
      <h1>Payment Ledger</h1>
      <div className="form">
        <input placeholder="Listing ID" value={listingId} onChange={(e) => setListingId(e.target.value)} />
        <button className="btn" onClick={loadLedger}>Inspect</button>
      </div>
      {entries.map((e) => (
        <div key={e.id} className="card" style={{ marginTop: '1rem' }}>
          <p>{e.event_type} — {new Date(e.created_at).toLocaleString()}</p>
          <p>Gross: {formatPrice(e.gross_cents)} | Fee: {formatPrice(e.platform_fee_cents)} | Mentor: {formatPrice(e.mentor_payout_cents)}</p>
        </div>
      ))}
    </>
  );
}
