'use client';

import { useEffect, useRef, useState } from 'react';
import type { Listing } from '@/lib/api/listings';

interface ListingSelectProps {
  listings: Listing[];
  value: string;
  onChange: (listingId: string) => void;
  hasError?: boolean;
}

export function ListingSelect({ listings, value, onChange, hasError }: ListingSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = listings.find((l) => l.id === value);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  return (
    <div
      ref={rootRef}
      className={`listing-select ${open ? 'listing-select-open' : ''} ${hasError ? 'listing-select-error' : ''}`}
    >
      <span className="register-field-label">Mentorship listing</span>
      <button
        type="button"
        className="listing-select-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {selected ? (
          <>
            <span className="listing-select-name">{selected.oss_project_name}</span>
            <span className="listing-select-meta">
              {selected.filled_slots}/{selected.total_slots} filled · {selected.duration_weeks}w
            </span>
          </>
        ) : (
          <span className="listing-select-placeholder">Select a listing</span>
        )}
        <span className="listing-select-chevron" aria-hidden="true">
          {open ? '▴' : '▾'}
        </span>
      </button>

      {open && (
        <ul className="listing-select-menu" role="listbox">
          {listings.map((listing) => {
            const isSelected = listing.id === value;
            const slotsLeft = listing.total_slots - listing.filled_slots;
            return (
              <li key={listing.id} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  className={`listing-select-option ${isSelected ? 'listing-select-option-active' : ''}`}
                  onClick={() => {
                    onChange(listing.id);
                    setOpen(false);
                  }}
                >
                  <span className="listing-select-option-head">
                    <strong>{listing.oss_project_name}</strong>
                    {isSelected && <span className="listing-select-check">✓</span>}
                  </span>
                  <span className="listing-select-option-desc">
                    {listing.description.slice(0, 72)}
                    {listing.description.length > 72 ? '…' : ''}
                  </span>
                  <span className="listing-select-option-meta">
                    {slotsLeft} slot{slotsLeft === 1 ? '' : 's'} left · {listing.duration_weeks} weeks
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
