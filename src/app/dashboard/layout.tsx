'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { canAccessPath, defaultDashboard } from '@/lib/auth/nav';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !user) return;
    if (!canAccessPath(user.role, pathname)) {
      router.replace(defaultDashboard(user.role));
    }
  }, [isLoading, user, pathname, router]);

  if (isLoading) {
    return (
      <div className="dashboard-layout">
        <p className="muted">Loading session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="dashboard-layout">
        <p>
          Please <Link href="/login">login</Link> to access the dashboard.
        </p>
      </div>
    );
  }

  if (!canAccessPath(user.role, pathname)) {
    return (
      <div className="dashboard-layout">
        <p className="muted">Redirecting...</p>
      </div>
    );
  }

  return <div className="dashboard-layout">{children}</div>;
}
