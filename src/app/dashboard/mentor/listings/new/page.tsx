'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useFormFeedback } from '@/hooks/use-form-feedback';
import { createListing } from '@/lib/api/listings';

export default function NewListingPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { fieldClass, btnClass, formClass, reportError, clearError } = useFormFeedback();
  const [form, setForm] = useState({
    oss_project_name: '', oss_repo_url: '', description: '',
    price_cents: 5000, duration_weeks: 4, total_slots: 5,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    try {
      await createListing(form);
      router.push('/dashboard/mentor');
    } catch (err) {
      reportError(err, 'Failed to create listing');
    }
  }

  function updateForm(patch: Partial<typeof form>) {
    clearError();
    setForm((prev) => ({ ...prev, ...patch }));
  }

  if (authLoading) return <p className="muted">Loading...</p>;
  if (!user) return <p>Please <a href="/login">login</a>.</p>;
  if (user.role !== 'mentor' && user.role !== 'admin') {
    return <p className="access-denied">Mentor access required.</p>;
  }

  return (
    <>
      <h1>New Mentorship Listing</h1>
      <form className={formClass} onSubmit={handleSubmit}>
        <input placeholder="Project name" className={fieldClass} value={form.oss_project_name} onChange={(e) => updateForm({ oss_project_name: e.target.value })} required />
        <input placeholder="Repo URL" className={fieldClass} value={form.oss_repo_url} onChange={(e) => updateForm({ oss_repo_url: e.target.value })} required />
        <textarea placeholder="Description" className={fieldClass} value={form.description} onChange={(e) => updateForm({ description: e.target.value })} rows={4} required />
        <input type="number" placeholder="Price (cents)" className={fieldClass} value={form.price_cents} onChange={(e) => updateForm({ price_cents: +e.target.value })} />
        <input type="number" placeholder="Duration (weeks)" className={fieldClass} value={form.duration_weeks} onChange={(e) => updateForm({ duration_weeks: +e.target.value })} />
        <input type="number" placeholder="Total slots" className={fieldClass} value={form.total_slots} onChange={(e) => updateForm({ total_slots: +e.target.value })} />
        <button type="submit" className={btnClass}>Publish Listing</button>
      </form>
    </>
  );
}
