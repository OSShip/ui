'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getStoredUser, logout } from '@/lib/api/auth';

interface NavLink {
  href: string;
  label: string;
}

function getNavLinks(role?: string): NavLink[] {
  const links: NavLink[] = [];

  if (role === 'student' || role === 'admin') {
    links.push({ href: '/dashboard/student', label: 'Student' });
  }

  if (role === 'mentor' || role === 'admin' || role === 'student') {
    links.push({ href: '/dashboard/mentor', label: 'Mentor' });
  }

  if (role === 'admin') {
    links.push({ href: '/dashboard/admin/applications', label: 'Applications' });
    links.push({ href: '/dashboard/admin/ledger', label: 'Ledger' });
  }

  return links;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = getStoredUser();
  const pathname = usePathname();
  const router = useRouter();
  const links = getNavLinks(user?.role);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <div className="dashboard-layout">
      <nav className="dashboard-nav">
        <div className="dashboard-nav-links">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href || pathname.startsWith(`${link.href}/`) ? 'active' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="dashboard-nav-meta">
          {user && <span className="muted">{user.display_name || user.email}</span>}
          <button type="button" className="btn secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
      <div className="dashboard-content">{children}</div>
    </div>
  );
}
