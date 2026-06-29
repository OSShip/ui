'use client';

import { useState } from 'react';
import { linkContribution } from '@/lib/api/users';
import { useFormFeedback } from '@/hooks/use-form-feedback';
import { toastSuccess } from '@/lib/toast';

export function PRLinkForm() {
  const { fieldClass, btnClass, formClass, reportError, clearError } = useFormFeedback();
  const [prUrl, setPrUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    clearError();
    try {
      await linkContribution(prUrl);
      setPrUrl('');
      toastSuccess('PR linked', 'Your contribution was attached to your profile.');
    } catch (err) {
      reportError(err, 'Failed to link PR');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section">
      <h2>Link Contribution (PR)</h2>
      <p className="muted">Attach a merged or open pull request to track your OSS progress.</p>
      <form className={formClass} onSubmit={handleSubmit}>
        <input
          placeholder="https://github.com/org/repo/pull/123"
          className={fieldClass}
          value={prUrl}
          onChange={(e) => { clearError(); setPrUrl(e.target.value); }}
          required
        />
        <button type="submit" className={btnClass} disabled={submitting}>
          {submitting ? 'Linking...' : 'Link PR'}
        </button>
      </form>
    </section>
  );
}
