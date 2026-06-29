'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getNavLinks } from '@/lib/auth/nav';
import { useAuth } from '@/hooks/use-auth';

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, hydrated } = useAuth();

  const isLanding = pathname === '/';
  const isSessionRoom = /^\/sessions\/[^/]+\/room$/.test(pathname);

  if (isSessionRoom) return null;

  const headerClass = isLanding ? 'header header-landing' : 'header';
  const dashboardLinks = isAuthenticated && user ? getNavLinks(user.role) : [];

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <header className={headerClass}>
      <Link href="/" className="logo">
        OSShip
      </Link>
      <nav className="navbar-nav">
        {isLanding && (
          <>
            <Link href="#listings">Listings</Link>
            <Link href="#how">How it works</Link>
          </>
        )}

        {hydrated && isAuthenticated && user && (
          <>
            {dashboardLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={isActive(pathname, link.href) ? 'nav-active' : undefined}
              >
                {link.label}
              </Link>
            ))}
            <span className="muted navbar-user">{user.display_name || user.email}</span>
            <span className="muted navbar-role">{user.role}</span>
            <button
              type="button"
              className="btn secondary navbar-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        )}

        {hydrated && !isAuthenticated && (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register" className="nav-cta">
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
