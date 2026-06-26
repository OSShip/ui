'use client';

import Link from 'next/link';
import { useReveal } from './useReveal';

const STEPS = [
  {
    num: '01',
    title: 'Browse listings',
    body: 'Explore active mentorships tied to real OSS projects. See price, duration, and what each mentor offers before you commit.',
  },
  {
    num: '02',
    title: 'Claim a slot',
    body: 'Enroll in a structured multi-week mentorship. Payment flows through the platform with a transparent, auditable ledger.',
  },
  {
    num: '03',
    title: 'Build evidence',
    body: 'Join live sessions, track progress, and link contributions or merged PRs to your profile for job applications.',
  },
];

const FEATURES = [
  {
    icon: '◈',
    title: 'Project-specific paths',
    body: 'No random "good first issues." Mentors define concrete goals on real repositories you care about.',
  },
  {
    icon: '◎',
    title: 'Live sessions',
    body: 'Scheduled calls with maintainers over several weeks — onboarding, code review, or navigation.',
  },
  {
    icon: '◇',
    title: 'Transparent payouts',
    body: 'Fees distribute through a public ledger. Students see what mentors receive; nothing hidden.',
  },
  {
    icon: '◆',
    title: 'Verified mentors',
    body: 'Applicants are reviewed against GitHub contribution history before publishing listings.',
  },
];

const AUDIENCE = [
  { pct: '70%', label: 'CS students', desc: 'Basic to intermediate skills seeking a first meaningful contribution.' },
  { pct: '25%', label: 'Junior developers', desc: 'Bootcamp grads building portfolio evidence through real OSS work.' },
  { pct: '5%', label: 'Career switchers', desc: 'Transitioning into tech with guided project experience.' },
];

function RevealSection({
  className,
  children,
  delay = 0,
  id,
}: {
  className?: string;
  children: React.ReactNode;
  delay?: number;
  id?: string;
}) {
  const { ref, visible } = useReveal<HTMLElement>();
  return (
    <section
      ref={ref}
      id={id}
      className={`landing-section reveal ${visible ? 'reveal-visible' : ''} ${className ?? ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </section>
  );
}

export function ProblemSection() {
  return (
    <RevealSection className="section-problem" id="about">
      <div className="section-inner">
        <p className="eyebrow">The problem</p>
        <h2>Most people never get their first OSS contribution</h2>
        <div className="problem-grid">
          <blockquote className="problem-quote">
            Students and junior developers want to contribute to open source for employability —
            but many give up before a meaningful pull request. The barrier isn&apos;t code. It&apos;s
            mentorship.
          </blockquote>
          <ul className="problem-list">
            <li>No reply from communities when you&apos;re starting out</li>
            <li>No human guide for your first real PR</li>
            <li>Programs like GSoC and Outreachy are selective and seasonal</li>
            <li>Generic bootcamps don&apos;t connect you to real maintainers</li>
          </ul>
        </div>
      </div>
    </RevealSection>
  );
}

export function ValueSection() {
  return (
    <RevealSection className="section-value" delay={80}>
      <div className="section-inner value-card">
        <p className="eyebrow">Value proposition</p>
        <h2>Human mentorship on real projects</h2>
        <p className="lead">
          Mentors publish paid mentorship on concrete OSS projects — setting their own price,
          duration, and goals. Students get a defined time window, live guidance, and a
          verifiable payment trail that compensates mentors directly.
        </p>
        <div className="value-pills">
          <span>Structured path</span>
          <span>Live feedback</span>
          <span>Auditable fees</span>
          <span>Portfolio evidence</span>
        </div>
      </div>
    </RevealSection>
  );
}

export function HowItWorksSection() {
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section ref={ref} className={`landing-section section-steps reveal ${visible ? 'reveal-visible' : ''}`} id="how">
      <div className="section-inner">
        <p className="eyebrow">How it works</p>
        <h2>From browse to merged PR</h2>
        <ol className="steps">
          {STEPS.map((step, i) => (
            <li
              key={step.num}
              className="step-card"
              style={{ transitionDelay: visible ? `${i * 120}ms` : '0ms' }}
            >
              <span className="step-num">{step.num}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section ref={ref} className={`landing-section section-features reveal ${visible ? 'reveal-visible' : ''}`} id="features">
      <div className="section-inner">
        <p className="eyebrow">Platform</p>
        <h2>Built for trust and progress</h2>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <article
              key={f.title}
              className="feature-card"
              style={{ transitionDelay: visible ? `${i * 90}ms` : '0ms' }}
            >
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AudienceSection() {
  return (
    <RevealSection className="section-audience" delay={60}>
      <div className="section-inner">
        <p className="eyebrow">Who it&apos;s for</p>
        <h2>Designed for people ready to contribute</h2>
        <div className="audience-grid">
          {AUDIENCE.map((a) => (
            <div key={a.label} className="audience-card">
              <span className="audience-pct">{a.pct}</span>
              <h3>{a.label}</h3>
              <p>{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}

export function RolesSection() {
  return (
    <RevealSection className="section-roles">
      <div className="section-inner roles-split">
        <article className="role-card">
          <p className="eyebrow">Students</p>
          <h3>Find your path in</h3>
          <ul>
            <li>Browse listings by OSS project and skill level</li>
            <li>See payout breakdown before enrolling</li>
            <li>Join live sessions and track mentorship progress</li>
            <li>Link merged PRs to your public profile</li>
          </ul>
          <Link href="/register" className="landing-btn">Create student account</Link>
        </article>
        <article className="role-card role-card-accent">
          <p className="eyebrow">Mentors</p>
          <h3>Monetize your time</h3>
          <ul>
            <li>Publish listings with your own price and schedule</li>
            <li>Define slot count, duration, and mentorship goals</li>
            <li>Transparent payout ledger after each session</li>
            <li>Manage enrolled students in one place</li>
          </ul>
          <Link href="/register" className="landing-btn landing-btn-ghost">Apply as mentor</Link>
        </article>
      </div>
    </RevealSection>
  );
}

export function CTASection() {
  return (
    <RevealSection className="section-cta">
      <div className="section-inner cta-inner">
        <h2>Your first contribution starts with a mentor</h2>
        <p>Join a platform where open source mentorship is structured, paid fairly, and publicly auditable.</p>
        <div className="cta-actions">
          <Link href="#listings" className="landing-btn landing-btn-lg">Browse listings</Link>
          <Link href="/register" className="landing-btn landing-btn-ghost landing-btn-lg">Get started</Link>
        </div>
      </div>
    </RevealSection>
  );
}

export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="section-inner footer-inner">
        <span className="footer-brand">osship</span>
        <p className="footer-tagline">Open Source Mentorship Platform · EPIC Institute of Technology · 2026</p>
        <nav className="footer-nav">
          <Link href="#about">About</Link>
          <Link href="#how">How it works</Link>
          <Link href="#listings">Listings</Link>
          <Link href="/dashboard/admin/ledger">Public ledger</Link>
        </nav>
      </div>
    </footer>
  );
}
