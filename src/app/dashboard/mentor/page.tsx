'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useFormFeedback } from '@/hooks/use-form-feedback';
import { fetchMentorListings, type Listing } from '@/lib/api/listings';
import { fetchConnectStatus, startStripeConnect, type ConnectStatus } from '@/lib/api/payments';
import { createSession, fetchListingSessions, updateSession, type Session } from '@/lib/api/sessions';
import { ListingSelect } from '@/components/listings/ListingSelect';
import { SessionCalendar } from '@/components/sessions/SessionCalendar';
import { SessionSchedulePicker } from '@/components/sessions/SessionSchedulePicker';
import { toastError, toastSuccess } from '@/lib/toast';

export default function MentorDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const formFeedback = useFormFeedback();
  const [listings, setListings] = useState<Listing[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [listingId, setListingId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [connect, setConnect] = useState<ConnectStatus | null>(null);
  const [connectLoading, setConnectLoading] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [actingSessionId, setActingSessionId] = useState<string | null>(null);

  const loadSessions = useCallback(async (mentorListings: Listing[]) => {
    if (mentorListings.length === 0) {
      setSessions([]);
      setSessionsLoading(false);
      return;
    }
    setSessionsLoading(true);
    try {
      const all = await Promise.all(
        mentorListings.map((l) => fetchListingSessions(l.id).catch(() => [] as Session[])),
      );
      setSessions(all.flat());
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'mentor' || user?.role === 'admin') {
      fetchConnectStatus().then(setConnect).catch(() => setConnect({ connected: false }));
      fetchMentorListings(user.id)
        .then((data) => {
          setListings(data);
          return loadSessions(data);
        })
        .catch(() => {
          setListings([]);
          setSessions([]);
          setSessionsLoading(false);
        });
    }
  }, [user?.id, user?.role, loadSessions]);

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
      formFeedback.reportError(err, 'Stripe Connect failed');
      setConnectLoading(false);
    }
  }

  async function handleCreateSession(e: React.FormEvent) {
    e.preventDefault();
    formFeedback.clearError();

    if (!listingId) {
      formFeedback.reportError(new Error('Select a listing first'));
      return;
    }

    if (!scheduledAt) {
      formFeedback.reportError(new Error('Pick a future date and time for the session'));
      return;
    }

    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate.getTime() <= Date.now()) {
      formFeedback.reportError(new Error('Sessions cannot be scheduled in the past'));
      return;
    }

    setScheduling(true);
    try {
      await createSession({
        listing_id: listingId,
        scheduled_at: scheduledDate.toISOString(),
      });
      setScheduledAt('');
      toastSuccess('Session scheduled', scheduledDate.toLocaleString());
      await loadSessions(listings);
    } catch (err) {
      formFeedback.reportError(err, 'Failed to schedule session');
    } finally {
      setScheduling(false);
    }
  }

  async function handleStartSession(sessionId: string) {
    setActingSessionId(sessionId);
    try {
      await updateSession(sessionId, { is_active: true });
      toastSuccess('Session is now live');
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, is_active: true, status: 'live' } : s,
        ),
      );
    } catch (err) {
      toastError(err, 'Failed to start session');
    } finally {
      setActingSessionId(null);
    }
  }

  async function handleEndSession(sessionId: string) {
    setActingSessionId(sessionId);
    try {
      await updateSession(sessionId, { status: 'completed' });
      toastSuccess('Session ended');
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, is_active: false, status: 'completed' } : s,
        ),
      );
    } catch (err) {
      toastError(err, 'Failed to end session');
    } finally {
      setActingSessionId(null);
    }
  }

  const listingTitles = Object.fromEntries(
    listings.map((l) => [l.id, l.oss_project_name]),
  );

  if (authLoading) return <p className="muted">Loading...</p>;
  if (!user) return <p>Please <a href="/login">login</a>.</p>;

  return (
    <>
      <h1>Mentor Dashboard</h1>
      <p className="muted">Welcome, {user.display_name || user.email}</p>

      <section className="section">
        <button className="btn" onClick={() => router.push('/dashboard/mentor/listings/new')}>
          Create Listing
        </button>
      </section>

      {(user.role === 'mentor' || user.role === 'admin') && (
        <>
          <section className="section section-upcoming-sessions">
            <h2>My Sessions</h2>
            {sessionsLoading && <p className="muted">Loading sessions...</p>}
            {!sessionsLoading && (
              <SessionCalendar
                sessions={sessions}
                listingTitles={listingTitles}
                mode="mentor"
                onStartSession={handleStartSession}
                onEndSession={handleEndSession}
                actingSessionId={actingSessionId}
              />
            )}
          </section>

          <section className="section card">
            <h2>Stripe Connect</h2>
            <p className="muted">Connect your Stripe account to receive mentorship payouts.</p>
            {connect?.connected ? (
              <p>Connected: <code>{connect.account_id}</code></p>
            ) : (
              <button
                className={formFeedback.secondaryBtnClass}
                onClick={handleStripeConnect}
                disabled={connectLoading}
              >
                {connectLoading ? 'Redirecting...' : 'Connect Stripe'}
              </button>
            )}
          </section>

          <section className="section">
            <h2>Schedule Session</h2>
            {listings.length === 0 ? (
              <p className="muted">Create a listing first to schedule sessions.</p>
            ) : (
              <form className={`session-schedule-form ${formFeedback.hasError ? 'form-error' : ''}`} onSubmit={handleCreateSession}>
                <ListingSelect
                  listings={listings}
                  value={listingId}
                  onChange={(id) => {
                    formFeedback.clearError();
                    setListingId(id);
                  }}
                  hasError={formFeedback.hasError && !listingId}
                />

                <SessionSchedulePicker
                  value={scheduledAt}
                  onChange={(value) => {
                    formFeedback.clearError();
                    setScheduledAt(value);
                  }}
                  hasError={formFeedback.hasError && !scheduledAt}
                />

                <button
                  type="submit"
                  className={formFeedback.btnClass}
                  disabled={scheduling || !scheduledAt || !listingId}
                >
                  {scheduling ? 'Scheduling...' : 'Schedule'}
                </button>
              </form>
            )}
          </section>
        </>
      )}
    </>
  );
}
