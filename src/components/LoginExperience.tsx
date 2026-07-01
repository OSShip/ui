'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { login } from '@/lib/api/auth';
import { defaultDashboard } from '@/lib/auth/nav';
import { useFormFeedback } from '@/hooks/use-form-feedback';
import type { RobotMood } from '@/types/robot';

const GuideRobot = dynamic(() => import('./GuideRobot'), {
  ssr: false,
  loading: () => <div className="guide-robot-canvas guide-robot-placeholder" />,
});

type FocusField = 'email' | 'password' | null;
type MessageKey = 'idle' | 'email' | 'password' | 'submitting' | 'error';

const MESSAGES: Record<MessageKey, string> = {
  idle: 'Welcome back! Sign in to pick up where you left off — listings, sessions, and your dashboard are waiting.',
  email: 'What email did you register with? I\'ll keep the rest between us.',
  password: 'Go ahead — I\'m covering my eyes. Your password stays private on this machine.',
  submitting: 'Verifying your credentials and opening a secure session…',
  error: 'Those credentials didn\'t match. Double-check your email and password, then try again.',
};

function moodForState(
  focusedField: FocusField,
  submitting: boolean,
  hasError: boolean,
): RobotMood {
  if (submitting) return 'focused';
  if (hasError) return 'curious';
  if (focusedField === 'password') return 'focused';
  if (focusedField === 'email') return 'welcome';
  return 'welcome';
}

export function LoginExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const next = searchParams.get('next');
  const { hasError, reportError, clearError } = useFormFeedback();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<FocusField>(null);
  const [submitting, setSubmitting] = useState(false);
  const [typedChars, setTypedChars] = useState(0);

  const messageKey: MessageKey = submitting
    ? 'submitting'
    : hasError
      ? 'error'
      : focusedField ?? 'idle';

  const message = MESSAGES[messageKey];
  const mood = moodForState(focusedField, submitting, hasError);
  const coverEyes = focusedField === 'password' && !showPassword;

  const canSubmit = useMemo(
    () => email.includes('@') && password.length >= 1 && !submitting,
    [email, password, submitting],
  );

  useEffect(() => {
    setTypedChars(0);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedChars(i);
      if (i >= message.length) clearInterval(interval);
    }, 14);
    return () => clearInterval(interval);
  }, [message]);

  const displayedMessage = message.slice(0, typedChars);
  const isTyping = typedChars < message.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    clearError();
    setSubmitting(true);
    try {
      const { user } = await login(email, password);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      router.push(next || defaultDashboard(user.role));
    } catch (err) {
      reportError(err, 'Login failed');
      setSubmitting(false);
    }
  }

  return (
    <div className="login-experience">
      <div className="register-bg" aria-hidden="true">
        <div className="register-bg-orb register-bg-orb-1" />
        <div className="register-bg-orb register-bg-orb-2" />
        <div className="register-bg-grid" />
      </div>

      <div className="login-shell register-shell">
        <header className="login-header register-header">
          <Link href="/" className="register-back">
            ← osship
          </Link>
          <span className="login-header-label">Secure session</span>
        </header>

        <div className="login-body register-body">
          <aside className="register-guide">
            <motion.div
              className="register-robot-wrap login-robot-wrap"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <GuideRobot mood={mood} isSpeaking={isTyping} coverEyes={coverEyes} />
              <div className="register-robot-glow" />
            </motion.div>

            <motion.div
              key={messageKey}
              className="register-speech login-speech"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35 }}
            >
              <div className="register-speech-header">
                <span className="register-speech-name">SHIP-0</span>
                <span className="register-speech-status">
                  {submitting ? 'authenticating…' : isTyping ? 'transmitting…' : 'online'}
                </span>
              </div>
              <p className="register-speech-text login-speech-text">
                {displayedMessage}
                {isTyping && <span className="register-cursor">▌</span>}
              </p>
            </motion.div>
          </aside>

          <motion.div
            className="register-panel login-panel"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={`register-step-content login-form-card${hasError ? ' login-form-card-error' : ''}`}>
              <p className="register-eyebrow">Sign in</p>
              <h1>
                Welcome
                <br />
                <em>back</em>
              </h1>
              <p className="register-lead">
                Access your mentorship dashboard, sessions, and listings.
              </p>

              <form className="login-form" onSubmit={handleSubmit} noValidate>
                <div className="register-fields">
                  <label className="register-field">
                    <span>Email</span>
                    <input
                      type="email"
                      name="email"
                      placeholder="you@university.edu"
                      value={email}
                      autoComplete="email"
                      autoFocus
                      disabled={submitting}
                      className={hasError ? 'input-error' : undefined}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField((f) => (f === 'email' ? null : f))}
                      onChange={(e) => {
                        clearError();
                        setEmail(e.target.value);
                      }}
                      required
                    />
                  </label>

                  <label className="register-field">
                    <span>Password</span>
                    <div className="login-password-wrap">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Your password"
                        value={password}
                        autoComplete="current-password"
                        disabled={submitting}
                        className={hasError ? 'input-error' : undefined}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField((f) => (f === 'password' ? null : f))}
                        onChange={(e) => {
                          clearError();
                          setPassword(e.target.value);
                        }}
                        required
                      />
                      <button
                        type="button"
                        className="login-password-toggle"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setShowPassword((v) => !v)}
                        disabled={submitting}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </label>
                </div>

                {hasError && (
                  <p className="login-inline-error" role="alert">
                    Invalid email or password. Please try again.
                  </p>
                )}

                <div className="login-actions">
                  <button
                    type="submit"
                    className={`register-btn register-btn-primary login-submit${hasError ? ' register-btn-error' : ''}`}
                    disabled={!canSubmit}
                  >
                    {submitting ? (
                      <span className="register-btn-loading">Signing in…</span>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </div>
              </form>

              <p className="login-footer-hint">
                New here?{' '}
                <Link href="/register">Create an account</Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
