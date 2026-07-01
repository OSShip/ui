import Link from 'next/link';
import type { Listing } from '@/lib/api/listings';
import { formatPrice } from '@/lib/api/client';

export function MentorListingCard({ listing }: { listing: Listing }) {
  const slotsLeft = listing.total_slots - listing.filled_slots;
  const fillPct = listing.total_slots > 0
    ? Math.round((listing.filled_slots / listing.total_slots) * 100)
    : 0;

  const preview = listing.description.length > 110
    ? `${listing.description.slice(0, 110)}…`
    : listing.description;

  return (
    <article className="card mentor-listing-card">
      <div className="mentor-listing-card-head">
        <h3>{listing.oss_project_name}</h3>
        <span className={`mentor-listing-status mentor-listing-status-${listing.status}`}>
          {listing.status}
        </span>
      </div>

      <p className="muted mentor-listing-desc">{preview}</p>

      <div className="meta mentor-listing-meta">
        <span>{formatPrice(listing.price_cents)}</span>
        <span>{listing.duration_weeks} weeks</span>
        <span>{slotsLeft} slots left</span>
      </div>

      <div className="mentor-listing-slots">
        <div className="mentor-listing-slots-bar" aria-hidden="true">
          <div
            className="mentor-listing-slots-fill"
            style={{ width: `${fillPct}%` }}
          />
        </div>
        <span className="mentor-listing-slots-label">
          {listing.filled_slots}/{listing.total_slots} enrolled
        </span>
      </div>

      <div className="mentor-listing-actions">
        <Link href={`/listings/${listing.id}`} className="mentor-listing-link">
          View catalog page →
        </Link>
        {listing.oss_repo_url && (
          <a
            href={listing.oss_repo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mentor-listing-repo"
          >
            Repository
          </a>
        )}
      </div>
    </article>
  );
}
