'use client';

import type { Session } from '@/lib/api/sessions';

interface SessionCalendarProps {
  sessions: Session[];
  listingTitles?: Record<string, string>;
  onJoin?: (sessionId: string) => void;
}

export function SessionCalendar({ sessions, listingTitles, onJoin }: SessionCalendarProps) {
  if (sessions.length === 0) {
    return <p className="muted">No sessions scheduled.</p>;
  }

  const byDate = sessions.reduce<Record<string, Session[]>>((acc, session) => {
    const date = new Date(session.scheduled_at).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {});

  const sortedDates = Object.keys(byDate).sort(
    (a, b) => new Date(byDate[a][0].scheduled_at).getTime() - new Date(byDate[b][0].scheduled_at).getTime(),
  );

  return (
    <div className="session-calendar">
      {sortedDates.map((date) => (
        <div key={date} className="session-calendar-day">
          <h3 className="session-calendar-date">{date}</h3>
          <ul className="stats">
            {byDate[date]
              .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
              .map((session) => (
                <li key={session.id} className="card session-calendar-item">
                  <p>
                    <strong>{new Date(session.scheduled_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</strong>
                    {listingTitles?.[session.listing_id] && (
                      <span> — {listingTitles[session.listing_id]}</span>
                    )}
                    <span className="muted"> ({session.status})</span>
                  </p>
                  {onJoin && (
                    <button type="button" className="btn secondary" onClick={() => onJoin(session.id)}>
                      Join Session
                    </button>
                  )}
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
