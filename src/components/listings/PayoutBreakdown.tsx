import { formatPrice } from '@/lib/api/client';

export function PayoutBreakdown({ gross, fee, payout }: { gross: number; fee: number; payout: number }) {
  return (
    <div className="card">
      <h3>Payment Breakdown</h3>
      <ul className="stats">
        <li>Total: {formatPrice(gross)}</li>
        <li>Platform fee: {formatPrice(fee)}</li>
        <li>Mentor receives: <strong>{formatPrice(payout)}</strong></li>
      </ul>
    </div>
  );
}
