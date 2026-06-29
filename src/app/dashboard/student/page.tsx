'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { fetchListing, type Listing } from '@/lib/api/listings';
import { fetchListingSessions, type Session } from '@/lib/api/sessions';
import { applyMentor, fetchEnrollments, type Enrollment } from '@/lib/api/users';
import { PRLinkForm } from '@/components/forms/PRLinkForm';
import { SessionCalendar } from '@/components/sessions/SessionCalendar';
import { toastError, toastSuccess } from '@/lib/toast';

export default function StudentDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [listingMap, setListingMap] = useState<Record<string, Listing>>({});
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetchEnrollments(user.id)
      .then(async (data) => {
        setEnrollments(data);
        const listings = await Promise.all(
          data.map((e) => fetchListing(e.listing_id).catch(() => null)),
        );
        const map: Record<string, Listing> = {};
        listings.forEach((listing) => {
          if (listing) map[listing.id] = listing;
        });
        setListingMap(map);

        const allSessions = await Promise.all(
          data.map((e) => fetchListingSessions(e.listing_id).catch(() => [] as Session[])),
        );
        setSessions(allSessions.flat());
      })
      .catch((err) => toastError(err, 'Failed to load enrollments'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  async function handleApplyMentor() {
    try {
      await applyMentor(user?.github_username);
      toastSuccess('Application submitted', 'An admin will review your GitHub history.');
    } catch (err) {
      toastError(err, 'Application failed');
    }
  }

  const listingTitles = Object.fromEntries(
    Object.entries(listingMap).map(([id, listing]) => [id, listing.oss_project_name]),
  );

  if (authLoading) return <p className="muted">Loading...</p>;
  if (!user) return <p>Please <a href="/login">login</a>.</p>;

  return (
    <>
      <h1>Student Dashboard</h1>
      <p className="muted">Welcome, {user.display_name || user.email}</p>

      {user.role === 'student' && (
        <section className="section">
          <button type="button" className="btn secondary" onClick={handleApplyMentor}>
            Apply as Mentor
          </button>
        </section>
      )}

      <section className="section">
        <h2>My Enrollments</h2>
        {loading && <p className="muted">Loading enrollments...</p>}
        {!loading && enrollments.length === 0 && <p className="muted">No enrollments yet.</p>}
        {!loading && enrollments.length > 0 && (
          <div className="grid">
            {enrollments.map((enrollment) => {
              const listing = listingMap[enrollment.listing_id];
              return (
                <div key={enrollment.id} className="card enrollment-card">
                  <h3>{listing?.oss_project_name || 'Mentorship listing'}</h3>
                  <p className="muted">
                    {listing?.mentor_display_name || listing?.mentor_github_username || 'Mentor'}
                    {' · '}
                    {enrollment.status}
                  </p>
                  {listing && (
                    <p className="muted">{listing.duration_weeks} weeks · {listing.description.slice(0, 80)}...</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="section section-upcoming-sessions">
        <h2>Upcoming Sessions</h2>
        <SessionCalendar sessions={sessions} listingTitles={listingTitles} />
      </section>

      <PRLinkForm />
    </>
  );
}
