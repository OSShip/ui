'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { calculateFees, formatPrice, PLATFORM_FEE_PERCENT } from '@/lib/api/client';
import { createListing } from '@/lib/api/listings';
import { useAuth } from '@/hooks/use-auth';
import { useFormFeedback } from '@/hooks/use-form-feedback';
import { toastSuccess } from '@/lib/toast';
import type { RobotMood } from '@/types/robot';
import { CurrencyField } from './listings/CurrencyField';
import { ListingDraftPreview, type ListingDraft } from './listings/ListingDraftPreview';
import { ListingStepper } from './listings/ListingStepper';

const GuideRobot = dynamic(() => import('./GuideRobot'), {
  ssr: false,
  loading: () => <div className="guide-robot-canvas guide-robot-placeholder" />,
});

type StepId = 'welcome' | 'project' | 'pitch' | 'pricing' | 'review' | 'launch';

interface StepConfig {
  id: StepId;
  label: string;
  mood: RobotMood;
  message: string;
}

const STEPS: StepConfig[] = [
  {
    id: 'welcome',
    label: 'Start',
    mood: 'welcome',
    message: 'Ready to publish a mentorship listing? I\'ll walk you through project details, your pitch, pricing, and a live preview before we go live.',
  },
  {
    id: 'project',
    label: 'Project',
    mood: 'excited',
    message: 'Which open source project will students contribute to? Link the repo so they know it\'s the real thing.',
  },
  {
    id: 'pitch',
    label: 'Pitch',
    mood: 'curious',
    message: 'Sell the mentorship — what will students learn, ship, and walk away with? Be specific; this shows on the catalog card.',
  },
  {
    id: 'pricing',
    label: 'Pricing',
    mood: 'focused',
    message: 'Set your price in dollars — no mental math. I\'ll show exactly what you keep after the platform fee.',
  },
  {
    id: 'review',
    label: 'Review',
    mood: 'proud',
    message: 'This listing looks sharp. Give it one last read, then publish it to the catalog.',
  },
  {
    id: 'launch',
    label: 'Live',
    mood: 'celebrate',
    message: 'Listing published! Students can now discover your mentorship. Time to schedule your first sessions.',
  },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 64 : -64, opacity: 0, filter: 'blur(6px)' }),
  center: { x: 0, opacity: 1, filter: 'blur(0px)' },
  exit: (dir: number) => ({ x: dir > 0 ? -64 : 64, opacity: 0, filter: 'blur(6px)' }),
};

const INITIAL_FORM: ListingDraft = {
  oss_project_name: '',
  oss_repo_url: '',
  description: '',
  price_cents: 5000,
  duration_weeks: 4,
  total_slots: 5,
};

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function CreateListingExperience() {
  const router = useRouter();
  const { user } = useAuth();
  const { hasError, reportError, clearError } = useFormFeedback();

  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [typedChars, setTypedChars] = useState(0);
  const [form, setForm] = useState<ListingDraft>(INITIAL_FORM);

  const step = STEPS[stepIndex];
  const progress = ((stepIndex + 1) / STEPS.length) * 100;
  const mentorName = user?.display_name || user?.email || 'You';

  const fees = useMemo(() => calculateFees(form.price_cents), [form.price_cents]);
  const feeShare = form.price_cents > 0 ? (fees.payout / form.price_cents) * 100 : 0;

  useEffect(() => {
    setTypedChars(0);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedChars(i);
      if (i >= step.message.length) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, [step.message, stepIndex]);

  const displayedMessage = step.message.slice(0, typedChars);
  const isTyping = typedChars < step.message.length;

  const updateForm = useCallback((patch: Partial<ListingDraft>) => {
    clearError();
    setForm((prev) => ({ ...prev, ...patch }));
  }, [clearError]);

  const canProceed = useCallback((): boolean => {
    switch (step.id) {
      case 'welcome':
        return true;
      case 'project':
        return form.oss_project_name.trim().length >= 2 && isValidUrl(form.oss_repo_url.trim());
      case 'pitch':
        return form.description.trim().length >= 24;
      case 'pricing':
        return form.price_cents >= 500 && form.duration_weeks >= 1 && form.total_slots >= 1;
      case 'review':
        return true;
      default:
        return false;
    }
  }, [step.id, form]);

  const goNext = useCallback(() => {
    if (stepIndex < STEPS.length - 1) {
      setDirection(1);
      setStepIndex((i) => i + 1);
    }
  }, [stepIndex]);

  const goBack = useCallback(() => {
    if (stepIndex > 0 && step.id !== 'launch') {
      setDirection(-1);
      setStepIndex((i) => i - 1);
      clearError();
    }
  }, [stepIndex, step.id, clearError]);

  async function handlePublish() {
    setSubmitting(true);
    clearError();
    try {
      await createListing(form);
      toastSuccess('Listing published', `${form.oss_project_name} is now live in the catalog.`);
      setDirection(1);
      setStepIndex(STEPS.length - 1);
      setTimeout(() => router.push('/dashboard/mentor'), 3200);
    } catch (err) {
      reportError(err, 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  }

  function handlePrimaryAction() {
    if (step.id === 'review') {
      handlePublish();
      return;
    }
    goNext();
  }

  return (
    <div className="listing-create-experience">
      <div className="register-bg" aria-hidden="true">
        <div className="register-bg-orb register-bg-orb-1" />
        <div className="register-bg-orb register-bg-orb-2 listing-create-orb" />
        <div className="register-bg-grid" />
      </div>

      <div className="listing-create-shell register-shell">
        <header className="register-header">
          <Link href="/dashboard/mentor" className="register-back">
            ← dashboard
          </Link>
          <div className="register-progress-wrap">
            <div className="register-progress-track">
              <motion.div
                className="register-progress-fill listing-create-progress"
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

        <div className="listing-create-body">
          <aside className="register-guide listing-create-guide">
            <motion.div
              className="register-robot-wrap listing-create-robot"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            >
              <GuideRobot mood={step.mood} isSpeaking={isTyping} />
              <div className="register-robot-glow listing-create-robot-glow" />
            </motion.div>

            <motion.div
              key={step.id}
              className="register-speech listing-create-speech"
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.08 }}
            >
              <div className="register-speech-header">
                <span className="register-speech-name">SHIP-0</span>
                <span className="register-speech-status">
                  {isTyping ? 'transmitting…' : 'listing mode'}
                </span>
              </div>
              <p className="register-speech-text">
                {displayedMessage}
                {isTyping && <span className="register-cursor">▌</span>}
              </p>
            </motion.div>

            {step.id !== 'welcome' && step.id !== 'launch' && (
              <ListingDraftPreview draft={form} mentorName={mentorName} compact />
            )}
          </aside>

          <div className="listing-create-panel register-panel">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step.id}
                className="register-step-content listing-create-step"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              >
                {step.id === 'welcome' && (
                  <div className="listing-create-welcome">
                    <p className="register-eyebrow">New listing</p>
                    <h1>
                      Publish a
                      <br />
                      <em>mentorship</em>
                    </h1>
                    <p className="register-lead">
                      Turn your OSS expertise into a structured, paid offering — with transparent pricing and a polished catalog card.
                    </p>
                    <ul className="register-welcome-list listing-create-checklist">
                      <li>Link your open source project</li>
                      <li>Craft a compelling pitch for students</li>
                      <li>Set price in dollars with live payout preview</li>
                      <li>Review a live catalog preview before publishing</li>
                    </ul>
                  </div>
                )}

                {step.id === 'project' && (
                  <div className="register-form-step">
                    <p className="register-eyebrow">Step 02 · Project</p>
                    <h2>What are you mentoring on?</h2>
                    <div className="register-fields">
                      <label className="register-field">
                        <span>Project name</span>
                        <input
                          type="text"
                          placeholder="e.g. Kubernetes, React, Rust CLI tools"
                          value={form.oss_project_name}
                          onChange={(e) => updateForm({ oss_project_name: e.target.value })}
                          autoFocus
                          className={hasError ? 'input-error' : undefined}
                        />
                      </label>
                      <label className="register-field">
                        <span>Repository URL</span>
                        <input
                          type="url"
                          placeholder="https://github.com/org/repo"
                          value={form.oss_repo_url}
                          onChange={(e) => updateForm({ oss_repo_url: e.target.value })}
                          className={hasError ? 'input-error' : undefined}
                        />
                        {form.oss_repo_url && !isValidUrl(form.oss_repo_url) && (
                          <span className="register-field-hint register-field-hint-error">
                            Enter a valid http(s) URL
                          </span>
                        )}
                      </label>
                    </div>
                  </div>
                )}

                {step.id === 'pitch' && (
                  <div className="register-form-step">
                    <p className="register-eyebrow">Step 03 · Pitch</p>
                    <h2>Why should students enroll?</h2>
                    <div className="register-fields">
                      <label className="register-field">
                        <span>Description</span>
                        <textarea
                          className={`listing-create-textarea${hasError ? ' input-error' : ''}`}
                          placeholder="Describe the skills students will build, the issues they'll tackle, and what a successful mentorship looks like…"
                          value={form.description}
                          onChange={(e) => updateForm({ description: e.target.value })}
                          rows={6}
                          autoFocus
                        />
                        <span className={`register-field-hint${form.description.length < 24 ? '' : ' listing-create-hint-ok'}`}>
                          {form.description.length} chars · min 24
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {step.id === 'pricing' && (
                  <div className="register-form-step listing-create-pricing-step">
                    <p className="register-eyebrow">Step 04 · Pricing</p>
                    <h2>Set your terms</h2>
                    <div className="register-fields">
                      <label className="register-field">
                        <span>Price per student</span>
                        <CurrencyField
                          valueCents={form.price_cents}
                          onChangeCents={(cents) => updateForm({ price_cents: cents })}
                          hasError={hasError}
                        />
                        {form.price_cents > 0 && form.price_cents < 500 && (
                          <span className="register-field-hint register-field-hint-error">
                            Minimum price is $5.00
                          </span>
                        )}
                      </label>

                      <div className="listing-create-pricing-grid">
                        <label className="register-field">
                          <span>Duration</span>
                          <ListingStepper
                            value={form.duration_weeks}
                            onChange={(v) => updateForm({ duration_weeks: v })}
                            min={1}
                            max={52}
                            suffix="wk"
                          />
                        </label>
                        <label className="register-field">
                          <span>Total slots</span>
                          <ListingStepper
                            value={form.total_slots}
                            onChange={(v) => updateForm({ total_slots: v })}
                            min={1}
                            max={50}
                            suffix="slots"
                          />
                        </label>
                      </div>
                    </div>

                    {form.price_cents >= 500 && (
                      <motion.div
                        className="listing-payout-viz"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                      >
                        <div className="listing-payout-header">
                          <span className="listing-payout-title">Payout breakdown</span>
                          <span className="listing-payout-fee-note">{PLATFORM_FEE_PERCENT}% platform fee</span>
                        </div>
                        <div className="listing-payout-amounts">
                          <div>
                            <small>Student pays</small>
                            <strong>{formatPrice(form.price_cents)}</strong>
                          </div>
                          <div>
                            <small>You receive</small>
                            <strong className="listing-payout-highlight">{formatPrice(fees.payout)}</strong>
                          </div>
                        </div>
                        <div className="listing-payout-bar" aria-hidden="true">
                          <motion.div
                            className="listing-payout-bar-mentor"
                            initial={{ width: 0 }}
                            animate={{ width: `${feeShare}%` }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                          />
                          <motion.div
                            className="listing-payout-bar-fee"
                            initial={{ width: 0 }}
                            animate={{ width: `${100 - feeShare}%` }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
                          />
                        </div>
                        <p className="listing-payout-caption muted">
                          Platform keeps {formatPrice(fees.fee)} · transparent ledger on every session
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}

                {step.id === 'review' && (
                  <div className="listing-create-review-step">
                    <p className="register-eyebrow">Step 05 · Review</p>
                    <h2>Ready to publish?</h2>
                    <ListingDraftPreview draft={form} mentorName={mentorName} />
                    <dl className="register-review-list listing-create-review-list">
                      <div>
                        <dt>Repository</dt>
                        <dd>{form.oss_repo_url.replace(/^https?:\/\//, '')}</dd>
                      </div>
                      <div>
                        <dt>Price</dt>
                        <dd>{formatPrice(form.price_cents)}</dd>
                      </div>
                      <div>
                        <dt>Duration</dt>
                        <dd>{form.duration_weeks} weeks</dd>
                      </div>
                      <div>
                        <dt>Capacity</dt>
                        <dd>{form.total_slots} students</dd>
                      </div>
                      <div>
                        <dt>Your payout</dt>
                        <dd>{formatPrice(fees.payout)} / student</dd>
                      </div>
                    </dl>
                  </div>
                )}

                {step.id === 'launch' && (
                  <div className="register-launch-step listing-create-launch">
                    <motion.div
                      className="register-launch-ring listing-create-launch-ring"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 100, damping: 12 }}
                    />
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      Listing live
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <strong>{form.oss_project_name}</strong> is in the catalog — redirecting to your dashboard…
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
                className="register-actions listing-create-actions"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
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
                  className={`register-btn register-btn-primary${hasError ? ' register-btn-error' : ''}`}
                  onClick={handlePrimaryAction}
                  disabled={!canProceed() || submitting}
                >
                  {submitting ? (
                    <span className="register-btn-loading">Publishing…</span>
                  ) : step.id === 'review' ? (
                    'Publish listing'
                  ) : step.id === 'welcome' ? (
                    'Start building'
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
