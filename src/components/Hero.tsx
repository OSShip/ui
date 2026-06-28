'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { CodeSyntaxAnimation } from './CodeSyntaxAnimation';

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const h = hero.offsetHeight || 1;
        const progress = Math.min(y / h, 1);
        hero.style.setProperty('--hero-scroll', `${progress}`);
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={heroRef} className="landing-hero" id="top">
      <div className="hero-parallax-layer hero-parallax-far" />
      <div className="hero-parallax-layer hero-parallax-mid" />

      <div className="hero-content">
        <p className="hero-eyebrow">
          <span className="hero-status" />
          Open Source Mentorship Platform
        </p>

        <div className="hero-headline">
          <h1 className="hero-title">
            Ship your first 
            <br />
            <em>open source</em>
            <br />
            contribution
          </h1>
          <div className="hero-visual">
            <CodeSyntaxAnimation />
          </div>
        </div>

        <p className="hero-subtitle">
          Paid mentorship on real OSS projects. Transparent payouts.
          Live sessions with maintainers. Verifiable progress for your portfolio.
        </p>

        <div className="hero-actions">
          <Link href="#listings" className="landing-btn landing-btn-lg">
            Browse listings
          </Link>
          <Link href="#how" className="landing-btn landing-btn-ghost landing-btn-lg">
            How it works
          </Link>
        </div>

        <dl className="hero-stats">
          <div>
            <dt>Model</dt>
            <dd>Mentor-defined slots &amp; pricing</dd>
          </div>
          <div>
            <dt>Payments</dt>
            <dd>Public auditable ledger</dd>
          </div>
          <div>
            <dt>Sessions</dt>
            <dd>Live calls over multi-week mentorship</dd>
          </div>
        </dl>
      </div>

      <a href="#about" className="hero-scroll-hint" aria-label="Scroll to learn more">
        <span />
      </a>
    </section>
  );
}
