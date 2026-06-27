'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser } from '@/lib/api/auth';
import { fetchConnectStatus, startStripeConnect, type ConnectStatus } from '@/lib/api/payments';
import { createSession } from '@/lib/api/sessions';
import { applyMentor } from '@/lib/api/users';

export default function MentorDashboard() {
  const user = getStoredUser();
  const router = useRouter();
  const [sessionForm, setSessionForm] = useState({ listing_id: '', scheduled_at: '' });
  const [connect, setConnect] = useState<ConnectStatus | null>(null);
  const [connectLoading, setConnectLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'mentor' || user?.role === 'admin') {
      fetchConnectStatus().then(setConnect).catch(() => setConnect({ connected: false }));
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
    await createSession({
      listing_id: sessionForm.listing_id,
      scheduled_at: new Date(sessionForm.scheduled_at).toISOString(),
    });
    alert('Session scheduled!');
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

      <section className="section">
        <h2>Schedule Session</h2>
        <form className="form" onSubmit={handleCreateSession}>
          <input
            placeholder="Listing ID"
            value={sessionForm.listing_id}
            onChange={(e) => setSessionForm({ ...sessionForm, listing_id: e.target.value })}
            required
          />
          <input
            type="datetime-local"
            value={sessionForm.scheduled_at}
            onChange={(e) => setSessionForm({ ...sessionForm, scheduled_at: e.target.value })}
            required
          />
          <button type="submit" className="btn">Schedule</button>
        </form>
      </section>
    </>
  );
}
