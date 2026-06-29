import { useEffect, useState } from 'react';

export const JOIN_WINDOW_MS = 10 * 60 * 1000;

export function useSessionTiming(scheduledAt: string) {
  const startMs = new Date(scheduledAt).getTime();
  const joinOpensMs = startMs - JOIN_WINDOW_MS;

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const canJoin = now >= joinOpensMs;
  const inCountdownWindow = now >= joinOpensMs && now < startMs;
  const msUntilStart = Math.max(0, startMs - now);
  const msUntilLobby = Math.max(0, joinOpensMs - now);
  const hasStarted = now >= startMs;

  return { canJoin, inCountdownWindow, msUntilStart, msUntilLobby, hasStarted, startMs, joinOpensMs };
}

export function formatCountdown(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatSessionDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function combineDateAndTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
}

export function minTimeForDate(date: Date): string {
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (!isToday) return '00:00';

  const nextSlot = new Date(now);
  nextSlot.setMinutes(nextSlot.getMinutes() + 1, 0, 0);
  return `${nextSlot.getHours().toString().padStart(2, '0')}:${nextSlot.getMinutes().toString().padStart(2, '0')}`;
}

export function isFutureDateTime(date: Date, time: string): boolean {
  return combineDateAndTime(date, time).getTime() > Date.now();
}
