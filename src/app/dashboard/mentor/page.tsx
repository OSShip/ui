'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser } from '@/lib/api/auth';
import { fetchMentorListings, type Listing } from '@/lib/api/listings';
import { fetchConnectStatus, startStripeConnect, type ConnectStatus } from '@/lib/api/payments';
import { createSession } from '@/lib/api/sessions';
import { applyMentor } from '@/lib/api/users';

export default function MentorDashboard() {
  const user = getStoredUser();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [sessionForm, setSessionForm] = useState({ listing_id: '', scheduled_at: '' });
  const [connect, setConnect] = useState<ConnectStatus | null>(null);
  const [connectLoading, setConnectLoading] = useState(false);
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    if (user?.role === 'mentor' || user?.role === 'admin') {
      fetchConnectStatus().then(setConnect).catch(() => setConnect({ connected: false }));
      fetchMentorListings(user.id)
        .then(setListings)
        .catch(() => setListings([]));
    }
  }, [user]);

  async function handleApplyMentor() {
    try {
      await applyMentor(user?.github_username);
      alert('Application submitted! An admin will review your GitHub history.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Application failed');
    }
  }

  async function handleStripeConnect() {
    setConnectLoading(true);
    try {
      const origin = window.location.origin;
      const { onboarding_url } = await startStripeConnect(
        `${origin}/dashboard/mentor?connected=1`,
        `${origin}/dashboard/mentor`,
      );
      window.location.href = onboarding_url;
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Stripe Connect failed');
      setConnectLoading(false);
    }
  }

  async function handleCreateSession(e: React.FormEvent) {
    e.preventDefault();
    setScheduling(true);
    try {
      await createSession({
        listing_id: sessionForm.listing_id,
        scheduled_at: new Date(sessionForm.scheduled_at).toISOString(),
      });
      setSessionForm({ listing_id: sessionForm.listing_id, scheduled_at: '' });
      alert('Session scheduled!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to schedule session');
    } finally {
      setScheduling(false);
    }
  }

  if (!user) return <p>Please <a href="/login">login</a>.</p>;

  return (
    <>
      <h1>Mentor Dashboard</h1>
      <p className="muted">Welcome, {user.display_name || user.email}</p>

      <section className="section">
        <button className="btn" onClick={() => router.push('/dashboard/mentor/listings/new')}>
          Create Listing
        </button>
        {user.role === 'student' && (
          <button className="btn secondary" style={{ marginLeft: '1rem' }} onClick={handleApplyMentor}>
            Apply as Mentor
          </button>
        )}
      </section>

      {(user.role === 'mentor' || user.role === 'admin') && (
        <section className="section card">
          <h2>Stripe Connect</h2>
          <p className="muted">Connect your Stripe account to receive mentorship payouts.</p>
          {connect?.connected ? (
            <p>Connected: <code>{connect.account_id}</code></p>
          ) : (
            <button className="btn" onClick={handleStripeConnect} disabled={connectLoading}>
              {connectLoading ? 'Redirecting...' : 'Connect Stripe'}
            </button>
          )}
        </section>
      )}

      {(user.role === 'mentor' || user.role === 'admin') && (
        <section className="section">
          <h2>Schedule Session</h2>
          {listings.length === 0 ? (
            <p className="muted">Create a listing first to schedule sessions.</p>
          ) : (
            <form className="form" onSubmit={handleCreateSession}>
              <label className="register-field">
                <span>Mentorship listing</span>
                <select
                  value={sessionForm.listing_id}
                  onChange={(e) => setSessionForm({ ...sessionForm, listing_id: e.target.value })}
                  required
                >
                  <option value="">Select a listing</option>
                  {listings.map((listing) => (
                    <option key={listing.id} value={listing.id}>
                      {listing.oss_project_name} ({listing.filled_slots}/{listing.total_slots} filled)
                    </option>
                  ))}
                </select>
              </label>
              <input
                type="datetime-local"
                value={sessionForm.scheduled_at}
                onChange={(e) => setSessionForm({ ...sessionForm, scheduled_at: e.target.value })}
                required
              />
              <button type="submit" className="btn" disabled={scheduling}>
                {scheduling ? 'Scheduling...' : 'Schedule'}
              </button>
            </form>
          )}
        </section>
      )}
    </>
  );
}
