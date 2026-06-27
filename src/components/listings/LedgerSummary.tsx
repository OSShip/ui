import { formatPrice } from '@/lib/api/client';

export function LedgerSummary({
  summary,
}: {
  summary: {
    total_gross_cents: number;
    total_mentor_payout_cents: number;
    total_platform_fee_cents: number;
    transaction_count: number;
  };
}) {
  return (
    <div className="card">
      <h3>payout_transparency.log</h3>
      <p className="muted">aggregated · anonymized · public</p>
      <ul className="stats">
        <li><strong>{formatPrice(summary.total_gross_cents)}</strong> total processed</li>
        <li><strong>{formatPrice(summary.total_mentor_payout_cents)}</strong> to mentors</li>
        <li><strong>{formatPrice(summary.total_platform_fee_cents)}</strong> platform fees</li>
        <li><strong>{summary.transaction_count}</strong> transactions</li>
      </ul>
    </div>
  );
}
