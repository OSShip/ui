'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PayoutBreakdown } from '@/components/listings/PayoutBreakdown';
import { useAuth } from '@/hooks/use-auth';
import { useFormFeedback } from '@/hooks/use-form-feedback';
import { calculateFees, formatPrice } from '@/lib/api/client';
import { fetchListing, type Listing } from '@/lib/api/listings';
import { createCheckout, createEnrollment } from '@/lib/api/payments';
import { toastError } from '@/lib/toast';

export default function CheckoutPage() {
  const { listingId } = useParams<{ listingId: string }>();
  const searchParams = useSearchParams();
  const paid = searchParams.get('paid') === '1';
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { btnClass, reportError } = useFormFeedback();

  useEffect(() => {
    fetchListing(listingId)
      .then(setListing)
      .catch((err) => toastError(err, 'Listing not found'));
  }, [listingId]);

  async function handleCheckout() {
    if (!user || !listing) return;
    setLoading(true);
    try {
      const enrollment = await createEnrollment(listing.id);
      const checkout = await createCheckout({
        listing_id: listing.id,
        student_id: user.id,
        mentor_id: listing.mentor_id,
        enrollment_id: enrollment.id,
        amount_cents: listing.price_cents,
        success_url: `${window.location.origin}/dashboard/student?paid=1`,
        cancel_url: `${window.location.origin}/checkout/${listing.id}`,
      });
      window.location.href = checkout.checkout_url;
    } catch (err) {
      reportError(err, 'Checkout failed');
      setLoading(false);
    }
  }

  if (!listing) return <p className="muted">Loading checkout...</p>;

  const { fee, payout } = calculateFees(listing.price_cents);

  if (paid) {
    return (
      <div className="card">
        <h1>Payment complete</h1>
        <p>Your enrollment for <strong>{listing.oss_project_name}</strong> is active.</p>
        <Link href="/dashboard/student" className="btn">Go to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="checkout">
      <h1>Checkout — {listing.oss_project_name}</h1>
      <p className="muted">{listing.duration_weeks} weeks · {listing.total_slots - listing.filled_slots} slots left</p>

      <PayoutBreakdown gross={listing.price_cents} fee={fee} payout={payout} />

      <div className="card" style={{ marginTop: '1rem' }}>
        <h3>What happens next</h3>
        <ul className="stats">
          <li>Secure payment via Stripe Checkout (PCI handled by Stripe)</li>
          <li>Mentor receives {formatPrice(payout)} after the platform fee</li>
          <li>Enrollment activates immediately after payment</li>
        </ul>
      </div>

      {!user && (
        <p className="checkout-login-hint">
          Please <Link href={`/login?next=/checkout/${listing.id}`}>log in</Link> to enroll.
        </p>
      )}

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
        <button type="button" className={btnClass} onClick={handleCheckout} disabled={!user || loading}>
          {loading ? 'Processing...' : `Pay ${formatPrice(listing.price_cents)}`}
        </button>
        <Link href={`/listings/${listing.id}`} className="btn secondary">Back to listing</Link>
      </div>
    </div>
  );
}
