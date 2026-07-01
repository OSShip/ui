'use client';

import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/api/client';

export interface ListingDraft {
  oss_project_name: string;
  oss_repo_url: string;
  description: string;
  price_cents: number;
  duration_weeks: number;
  total_slots: number;
}

interface ListingDraftPreviewProps {
  draft: ListingDraft;
  mentorName: string;
  compact?: boolean;
}

export function ListingDraftPreview({ draft, mentorName, compact }: ListingDraftPreviewProps) {
  const preview = draft.description.length > 120
    ? `${draft.description.slice(0, 120)}…`
    : draft.description || 'Your mentorship description will appear here as students browse the catalog.';

  const projectName = draft.oss_project_name.trim() || 'Your OSS project';

  return (
    <motion.div
      layout
      className={`listing-draft-preview${compact ? ' listing-draft-preview-compact' : ''}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <p className="listing-draft-eyebrow">Live catalog preview</p>
      <motion.article layout className="listing-draft-card">
        <div className="listing-draft-card-glow" aria-hidden="true" />
        <h3>{projectName}</h3>
        <p className="muted mentor-line">with {mentorName}</p>
        <p className="listing-draft-desc muted">{preview}</p>
        <div className="meta listing-draft-meta">
          <span>{formatPrice(Math.max(draft.price_cents, 0))}</span>
          <span>{draft.duration_weeks} weeks</span>
          <span>{draft.total_slots} slots</span>
        </div>
        {draft.oss_repo_url && (
          <p className="listing-draft-repo muted">{draft.oss_repo_url.replace(/^https?:\/\//, '')}</p>
        )}
      </motion.article>
    </motion.div>
  );
}
