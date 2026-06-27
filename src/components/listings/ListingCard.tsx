import type { Listing } from '@/lib/api/listings';
import { formatPrice } from '@/lib/api/client';
import Link from 'next/link';

export function ListingCard({ listing }: { listing: Listing }) {
  const slotsLeft = listing.total_slots - listing.filled_slots;
  const mentorLabel = listing.mentor_display_name || listing.mentor_github_username || 'Mentor';
  const preview = listing.description.length > 120
    ? `${listing.description.slice(0, 120)}...`
    : listing.description;
  return (
    <Link href={`/listings/${listing.id}`} className="card">
      <h3>{listing.oss_project_name}</h3>
      <p className="muted mentor-line">with {mentorLabel}</p>
      <p className="muted">{preview}</p>
      <div className="meta">
        <span>{formatPrice(listing.price_cents)}</span>
        <span>{listing.duration_weeks} weeks</span>
        <span>{slotsLeft} slots left</span>
      </div>
    </Link>
  );
}
