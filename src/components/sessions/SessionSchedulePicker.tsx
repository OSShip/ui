'use client';

import { useEffect, useMemo, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import {
  combineDateAndTime,
  isFutureDateTime,
  minTimeForDate,
} from '@/hooks/use-session-timing';

interface SessionSchedulePickerProps {
  value: string;
  onChange: (isoLocal: string) => void;
  hasError?: boolean;
}

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function SessionSchedulePicker({ value, onChange, hasError }: SessionSchedulePickerProps) {
  const initial = value ? new Date(value) : undefined;
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initial);
  const [time, setTime] = useState(() => {
    if (initial) {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${pad(initial.getHours())}:${pad(initial.getMinutes())}`;
    }
    return '09:00';
  });

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const minTime = selectedDate ? minTimeForDate(selectedDate) : '00:00';
  const isValid = selectedDate ? isFutureDateTime(selectedDate, time) : false;

  useEffect(() => {
    if (!selectedDate || !isValid) {
      onChange('');
      return;
    }
    onChange(toLocalInputValue(combineDateAndTime(selectedDate, time)));
  }, [selectedDate, time, isValid, onChange]);

  useEffect(() => {
    if (selectedDate && time < minTime) {
      setTime(minTime);
    }
  }, [selectedDate, minTime, time]);

  return (
    <div className={`session-schedule-picker ${hasError ? 'session-schedule-picker-error' : ''}`}>
      <div className="session-schedule-calendar">
        <p className="session-schedule-label">Pick a date</p>
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          disabled={{ before: today }}
          showOutsideDays
          className="session-day-picker"
        />
      </div>

      <div className="session-schedule-time">
        <label className="register-field">
          <span>Time</span>
          <input
            type="time"
            className={hasError ? 'input-error' : undefined}
            value={time}
            min={minTime}
            onChange={(e) => setTime(e.target.value)}
            disabled={!selectedDate}
            required
          />
        </label>

        {selectedDate && !isValid && (
          <p className="session-schedule-hint session-field-hint-error">
            Session must be scheduled after the current date and time.
          </p>
        )}

        {selectedDate && isValid && (
          <p className="session-schedule-hint">
            Scheduled for{' '}
            <strong>{combineDateAndTime(selectedDate, time).toLocaleString()}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
