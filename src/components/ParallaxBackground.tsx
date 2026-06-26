'use client';

import { useEffect, useRef } from 'react';

export function ParallaxBackground() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        layer.style.setProperty('--scroll-y', `${y}px`);
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
    <div ref={layerRef} className="parallax-bg" aria-hidden="true">
      <div className="parallax-orb parallax-orb-1" />
      <div className="parallax-orb parallax-orb-2" />
      <div className="parallax-orb parallax-orb-3" />
      <div className="parallax-grid" />
    </div>
  );
}
