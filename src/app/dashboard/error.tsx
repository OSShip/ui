'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error);
    }
  }, [error]);

  return (
    <div className="card">
      <h2>Something went wrong</h2>
      <p className="muted">We could not load this dashboard page. Please try again.</p>
      <button type="button" className="btn" onClick={reset}>Try again</button>
    </div>
  );
}
