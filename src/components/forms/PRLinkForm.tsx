'use client';

import { useState } from 'react';
import { linkContribution } from '@/lib/api/users';

export function PRLinkForm() {
  const [prUrl, setPrUrl] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      await linkContribution(prUrl);
      setPrUrl('');
      setMessage('PR linked successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to link PR');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section">
      <h2>Link Contribution (PR)</h2>
      <p className="muted">Attach a merged or open pull request to track your OSS progress.</p>
      <form className="form" onSubmit={handleSubmit}>
        <input
          placeholder="https://github.com/org/repo/pull/123"
          value={prUrl}
          onChange={(e) => setPrUrl(e.target.value)}
          required
        />
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Linking...' : 'Link PR'}
        </button>
      </form>
      {message && <p className="muted">{message}</p>}
      {error && <p className="error">{error}</p>}
    </section>
  );
}
