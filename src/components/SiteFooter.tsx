'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SiteFooter() {
  const pathname = usePathname();
  const isSessionRoom = /^\/sessions\/[^/]+\/room$/.test(pathname);

  if (isSessionRoom) return null;

  return (
    <footer className="site-footer">
      <span className="site-footer-text">
        made with <span className="site-footer-heart" aria-label="love">&lt;3</span> by{' '}
        <Link
          href="https://github.com/TalkySafe143"
          target="_blank"
          rel="noopener noreferrer"
        >
          TalkySafe143
        </Link>
      </span>
    </footer>
  );
}
