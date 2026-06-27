'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { register } from '@/lib/api/auth';
import type { RobotMood } from '@/types/robot';

const GuideRobot = dynamic(() => import('./GuideRobot'), {
  ssr: false,
  loading: () => <div className="guide-robot-canvas guide-robot-placeholder" />,
});

type StepId = 'welcome' | 'role' | 'profile' | 'credentials' | 'review' | 'launch';

interface StepConfig {
  id: StepId;
  label: string;
  mood: RobotMood;
  message: string;
}

const STEPS: StepConfig[] = [
  {
    id: 'welcome',
    label: 'Boot',
    mood: 'welcome',
    message: 'Hey there! I\'m SHIP-0 — your onboarding guide. I\'ll walk you through creating your osship account in just a few steps. Ready to ship your first contribution?',
  },
  {
    id: 'role',
    label: 'Role',
    mood: 'curious',
    message: 'First up: are you here to learn or to mentor? Students browse listings and join mentorships. Mentors publish paid slots on real OSS projects.',
  },
  {
    id: 'profile',
    label: 'Profile',
    mood: 'focused',
    message: 'Let\'s set up your public identity. Your display name shows on listings and sessions. GitHub links your contributions to your profile.',
  },
  {
    id: 'credentials',
    label: 'Access',
    mood: 'focused',
    message: 'Secure your account with email and password. We\'ll use this for login and session notifications.',
  },
  {
    id: 'review',
    label: 'Verify',
    mood: 'proud',
    message: 'Looking good! Double-check everything below. When you\'re ready, hit launch and we\'ll create your account.',
  },
  {
    id: 'launch',
    label: 'Launch',
    mood: 'celebrate',
    message: 'Account created! Welcome aboard. Your open source journey starts now — let\'s go ship something real.',
  },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0, filter: 'blur(6px)' }),
  center: { x: 0, opacity: 1, filter: 'blur(0px)' },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0, filter: 'blur(6px)' }),
};

export function RegisterExperience() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [typedChars, setTypedChars] = useState(0);
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: '' as '' | 'student' | 'mentor',
    display_name: '',
    github_username: '',
  });

  const step = STEPS[stepIndex];
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  useEffect(() => {
    setTypedChars(0);
    const message = step.message;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedChars(i);
      if (i >= message.length) clearInterval(interval);
    }, 18);
    return () => clearInterval(interval);
  }, [step.message, stepIndex]);

  const goNext = useCallback(() => {
    if (stepIndex < STEPS.length - 1) {
      setDirection(1);
      setStepIndex((i) => i + 1);
      setError('');
    }
  }, [stepIndex]);

  const goBack = useCallback(() => {
    if (stepIndex > 0 && step.id !== 'launch') {
      setDirection(-1);
      setStepIndex((i) => i - 1);
      setError('');
    }
  }, [stepIndex, step.id]);

  const canProceed = (): boolean => {
    switch (step.id) {
      case 'welcome':
        return true;
      case 'role':
        return form.role !== '';
      case 'profile':
        return form.display_name.trim().length >= 2;
      case 'credentials':
        return (
          form.email.includes('@') &&
          form.password.length >= 6 &&
          form.password === form.confirmPassword
        );
      case 'review':
        return true;
      default:
        return false;
    }
  };

  async function handleLaunch() {
    setSubmitting(true);
    setError('');
    try {
      const { user } = await register({
        email: form.email,
        password: form.password,
        role: form.role,
        display_name: form.display_name,
        github_username: form.github_username || undefined,
      });
      setDirection(1);
      setStepIndex(STEPS.length - 1);
      setTimeout(() => {
        if (user.role === 'mentor') router.push('/dashboard/mentor');
        else router.push('/dashboard/student');
      }, 3200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  function handlePrimaryAction() {
    if (step.id === 'review') {
      handleLaunch();
      return;
    }
    goNext();
  }

  const displayedMessage = step.message.slice(0, typedChars);
  const isTyping = typedChars < step.message.length;

  return (
    <div className="register-experience">
      <div className="register-bg" aria-hidden="true">
        <div className="register-bg-orb register-bg-orb-1" />
        <div className="register-bg-orb register-bg-orb-2" />
        <div className="register-bg-grid" />
      </div>

      <div className="register-shell">
        <header className="register-header">
          <Link href="/" className="register-back">
            ← osship
          </Link>
          <div className="register-progress-wrap">
            <div className="register-progress-track">
              <motion.div
                className="register-progress-fill"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              />
            </div>
            <ol className="register-step-dots">
              {STEPS.map((s, i) => (
                <li
                  key={s.id}
                  className={`register-dot ${i <= stepIndex ? 'register-dot-active' : ''} ${i === stepIndex ? 'register-dot-current' : ''}`}
                  title={s.label}
                />
              ))}
            </ol>
          </div>
          <span className="register-step-label">
            {String(stepIndex + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
          </span>
        </header>

        <div className="register-body">
          <aside className="register-guide">
            <motion.div
              className="register-robot-wrap"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <GuideRobot mood={step.mood} isSpeaking={isTyping} />
              <div className="register-robot-glow" />
            </motion.div>

            <motion.div
              key={step.id}
              className="register-speech"
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="register-speech-header">
                <span className="register-speech-name">SHIP-0</span>
                <span className="register-speech-status">
                  {isTyping ? 'transmitting…' : 'online'}
                </span>
              </div>
              <p className="register-speech-text">
                {displayedMessage}
                {isTyping && <span className="register-cursor">▌</span>}
              </p>
            </motion.div>
          </aside>

          <div className="register-panel">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step.id}
                className="register-step-content"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                {step.id === 'welcome' && (
                  <div className="register-welcome">
                    <p className="register-eyebrow">Onboarding sequence</p>
                    <h1>
                      Create your
                      <br />
                      <em>osship</em> account
                    </h1>
                    <p className="register-lead">
                      A guided setup for students and mentors. Five quick steps, then you&apos;re in.
                    </p>
                    <ul className="register-welcome-list">
                      <li>Choose your role on the platform</li>
                      <li>Set up your public profile</li>
                      <li>Secure your credentials</li>
                      <li>Review and launch</li>
                    </ul>
                  </div>
                )}

                {step.id === 'role' && (
                  <div className="register-role-step">
                    <p className="register-eyebrow">Step 02</p>
                    <h2>What brings you here?</h2>
                    <div className="register-role-grid">
                      {(['student', 'mentor'] as const).map((role) => (
                        <motion.button
                          key={role}
                          type="button"
                          className={`register-role-card ${form.role === role ? 'register-role-card-selected' : ''}`}
                          onClick={() => setForm({ ...form, role })}
                          whileHover={{ y: -4, scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          animate={
                            form.role === role
                              ? { boxShadow: '0 0 32px rgba(57, 255, 20, 0.2)' }
                              : { boxShadow: '0 0 0 rgba(57, 255, 20, 0)' }
                          }
                        >
                          <span className="register-role-icon">{role === 'student' ? '◇' : '◆'}</span>
                          <h3>{role === 'student' ? 'Student' : 'Mentor'}</h3>
                          <p>
                            {role === 'student'
                              ? 'Browse mentorships, enroll in slots, and build portfolio evidence through real OSS work.'
                              : 'Publish paid mentorship listings, run live sessions, and earn through transparent payouts.'}
                          </p>
                          {form.role === role && (
                            <motion.span
                              className="register-role-check"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                            >
                              ✓
                            </motion.span>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {step.id === 'profile' && (
                  <div className="register-form-step">
                    <p className="register-eyebrow">Step 03</p>
                    <h2>Your public profile</h2>
                    <div className="register-fields">
                      <label className="register-field">
                        <span>Display name</span>
                        <input
                          type="text"
                          placeholder="Alex Chen"
                          value={form.display_name}
                          onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                          autoFocus
                        />
                      </label>
                      <label className="register-field">
                        <span>GitHub username <small>(optional)</small></span>
                        <input
                          type="text"
                          placeholder="alexchen"
                          value={form.github_username}
                          onChange={(e) => setForm({ ...form, github_username: e.target.value })}
                        />
                      </label>
                    </div>
                  </div>
                )}

                {step.id === 'credentials' && (
                  <div className="register-form-step">
                    <p className="register-eyebrow">Step 04</p>
                    <h2>Account credentials</h2>
                    <div className="register-fields">
                      <label className="register-field">
                        <span>Email</span>
                        <input
                          type="email"
                          placeholder="you@university.edu"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          autoFocus
                        />
                      </label>
                      <label className="register-field">
                        <span>Password</span>
                        <input
                          type="password"
                          placeholder="Min. 6 characters"
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                      </label>
                      <label className="register-field">
                        <span>Confirm password</span>
                        <input
                          type="password"
                          placeholder="Repeat password"
                          value={form.confirmPassword}
                          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        />
                        {form.confirmPassword && form.password !== form.confirmPassword && (
                          <span className="register-field-hint register-field-hint-error">
                            Passwords don&apos;t match
                          </span>
                        )}
                      </label>
                    </div>
                  </div>
                )}

                {step.id === 'review' && (
                  <div className="register-review-step">
                    <p className="register-eyebrow">Step 05</p>
                    <h2>Ready for launch</h2>
                    <dl className="register-review-list">
                      <div>
                        <dt>Role</dt>
                        <dd>{form.role === 'student' ? 'Student' : 'Mentor'}</dd>
                      </div>
                      <div>
                        <dt>Display name</dt>
                        <dd>{form.display_name}</dd>
                      </div>
                      {form.github_username && (
                        <div>
                          <dt>GitHub</dt>
                          <dd>@{form.github_username}</dd>
                        </div>
                      )}
                      <div>
                        <dt>Email</dt>
                        <dd>{form.email}</dd>
                      </div>
                    </dl>
                    {error && <p className="register-error">{error}</p>}
                  </div>
                )}

                {step.id === 'launch' && (
                  <div className="register-launch-step">
                    <motion.div
                      className="register-launch-ring"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 100, damping: 12 }}
                    />
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      You&apos;re in!
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      Redirecting to your dashboard…
                    </motion.p>
                    <motion.div
                      className="register-launch-bar"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2.8, ease: 'easeInOut' }}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {step.id !== 'launch' && (
              <motion.div
                className="register-actions"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                {stepIndex > 0 ? (
                  <button type="button" className="register-btn register-btn-ghost" onClick={goBack}>
                    Back
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  className="register-btn register-btn-primary"
                  onClick={handlePrimaryAction}
                  disabled={!canProceed() || submitting}
                >
                  {submitting ? (
                    <span className="register-btn-loading">Launching…</span>
                  ) : step.id === 'review' ? (
                    'Launch account'
                  ) : step.id === 'welcome' ? (
                    'Begin onboarding'
                  ) : (
                    'Continue'
                  )}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
