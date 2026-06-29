'use client';

import Link from 'next/link';
import {
  formatCountdown,
  formatSessionDateTime,
  useSessionTiming,
} from '@/hooks/use-session-timing';
import type { Session } from '@/lib/api/sessions';

function SessionCountdown({ scheduledAt, status, isActive }: { scheduledAt: string; status: string; isActive: boolean }) {
  const { canJoin, inCountdownWindow, msUntilStart, msUntilLobby } =
    useSessionTiming(scheduledAt);

  if (status === 'completed') {
    return <span className="session-countdown session-countdown-ended">Session ended</span>;
  }

  if (isActive) {
    return <span className="session-countdown session-countdown-live">Live now</span>;
  }

  if (inCountdownWindow) {
    return (
      <span className="session-countdown session-countdown-active">
        Starts in {formatCountdown(msUntilStart)} · waiting for mentor
      </span>
    );
  }

  if (canJoin) {
    return (
      <span className="session-countdown session-countdown-waiting">
        Lobby open · waiting for mentor to start
      </span>
    );
  }

  const showLobbyCountdown = msUntilLobby <= 24 * 60 * 60 * 1000;
  return (
    <span className="session-countdown session-countdown-waiting">
      {showLobbyCountdown
        ? `Lobby opens in ${formatCountdown(msUntilLobby)}`
        : formatSessionDateTime(scheduledAt)}
    </span>
  );
}

interface SessionCalendarProps {
  sessions: Session[];
  listingTitles?: Record<string, string>;
  mode?: 'student' | 'mentor';
  onStartSession?: (sessionId: string) => void;
  onEndSession?: (sessionId: string) => void;
  actingSessionId?: string | null;
}

function SessionJoinAction({
  sessionId,
  scheduledAt,
  status,
  isActive,
}: {
  sessionId: string;
  scheduledAt: string;
  status: string;
  isActive: boolean;
}) {
  const { canJoin } = useSessionTiming(scheduledAt);

  if (status === 'completed' || status === 'cancelled') {
    return null;
  }

  if (!isActive || !canJoin) {
    return (
      <button type="button" className="btn secondary" disabled>
        Join Session
      </button>
    );
  }

  return (
    <Link href={`/sessions/${sessionId}/room`} className="btn secondary">
      Join Session
    </Link>
  );
}

function SessionMentorActions({
  session,
  onStartSession,
  onEndSession,
  actingSessionId,
}: {
  session: Session;
  onStartSession?: (sessionId: string) => void;
  onEndSession?: (sessionId: string) => void;
  actingSessionId?: string | null;
}) {
  const isCompleted = session.status === 'completed' || session.status === 'cancelled';
  if (isCompleted) return null;

  const isActing = actingSessionId === session.id;

  return (
    <div className="session-calendar-actions">
      <Link href={`/sessions/${session.id}/room`} className="btn secondary">
        Open room
      </Link>
      {!session.is_active ? (
        <button
          type="button"
          className="btn"
          disabled={isActing}
          onClick={() => onStartSession?.(session.id)}
        >
          {isActing ? 'Starting…' : 'Start session'}
        </button>
      ) : (
        <button
          type="button"
          className="btn btn-error-outline"
          disabled={isActing}
          onClick={() => onEndSession?.(session.id)}
        >
          {isActing ? 'Ending…' : 'End session'}
        </button>
      )}
    </div>
  );
}

export function SessionCalendar({
  sessions,
  listingTitles,
  mode = 'student',
  onStartSession,
  onEndSession,
  actingSessionId,
}: SessionCalendarProps) {
  if (sessions.length === 0) {
    return <p className="muted">No sessions scheduled.</p>;
  }

  const filtered =
    mode === 'student'
      ? sessions.filter((s) => s.status !== 'cancelled' && s.status !== 'completed')
      : sessions.filter((s) => s.status !== 'cancelled');

  const sorted = filtered.sort(
    (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
  );

  if (sorted.length === 0) {
    return <p className="muted">No sessions scheduled.</p>;
  }

  const byDate = sorted.reduce<Record<string, Session[]>>((acc, session) => {
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
          <ul className="session-calendar-list">
            {byDate[date]
              .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
              .map((session) => (
                <li key={session.id} className="card session-calendar-item">
                  <div className="session-calendar-item-main">
                    <p className="session-calendar-time">
                      <strong>
                        {new Date(session.scheduled_at).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </strong>
                      {listingTitles?.[session.listing_id] && (
                        <span> — {listingTitles[session.listing_id]}</span>
                      )}
                    </p>
                    <p className="session-listing-id">
                      Listing ID: <code>{session.listing_id}</code>
                    </p>
                    <SessionCountdown
                      scheduledAt={session.scheduled_at}
                      status={session.status}
                      isActive={session.is_active ?? false}
                    />
                    <span className={`session-status-badge session-status-${session.is_active ? 'live' : session.status}`}>
                      {session.is_active ? 'active' : session.status}
                    </span>
                  </div>
                  {mode === 'mentor' ? (
                    <SessionMentorActions
                      session={session}
                      onStartSession={onStartSession}
                      onEndSession={onEndSession}
                      actingSessionId={actingSessionId}
                    />
                  ) : (
                    <SessionJoinAction
                      sessionId={session.id}
                      scheduledAt={session.scheduled_at}
                      status={session.status}
                      isActive={session.is_active ?? false}
                    />
                  )}
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
