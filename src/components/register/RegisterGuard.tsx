'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { defaultDashboard } from '@/lib/auth/nav';

export function RegisterGuard({ children }: { children: React.ReactNode }) {
  const { isVerified, isCheckingSession, user, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isVerified && user) {
      router.replace(defaultDashboard(user.role));
    }
  }, [isVerified, user, router]);

  if (!hydrated || isCheckingSession || isVerified) {
    return (
      <div className="register-experience register-guard">
        <p className="muted">Checking session…</p>
      </div>
    );
  }

  return <>{children}</>;
}
