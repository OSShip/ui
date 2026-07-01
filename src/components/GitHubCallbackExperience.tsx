'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { completeGitHubOAuth } from '@/lib/api/auth';
import { defaultDashboard } from '@/lib/auth/nav';

function GitHubCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('Completing GitHub sign-in…');

  useEffect(() => {
    const error = searchParams.get('error');
    const token = searchParams.get('token');

    if (error) {
      setMessage('GitHub sign-in failed. Redirecting to login…');
      const timeout = setTimeout(() => router.replace('/login?error=github'), 1200);
      return () => clearTimeout(timeout);
    }

    if (!token) {
      setMessage('Missing sign-in token. Redirecting to login…');
      const timeout = setTimeout(() => router.replace('/login?error=github'), 1200);
      return () => clearTimeout(timeout);
    }

    let cancelled = false;

    (async () => {
      try {
        const user = await completeGitHubOAuth(token);
        if (cancelled) return;
        await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
        router.replace(defaultDashboard(user.role));
      } catch {
        if (cancelled) return;
        setMessage('Could not finish GitHub sign-in. Redirecting to login…');
        setTimeout(() => router.replace('/login?error=github'), 1200);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [queryClient, router, searchParams]);

  return (
    <div className="oauth-callback">
      <div className="oauth-callback-card">
        <p className="register-eyebrow">GitHub OAuth</p>
        <h1>Signing you in</h1>
        <p className="register-lead">{message}</p>
        <div className="oauth-callback-spinner" aria-hidden="true" />
        <p className="login-footer-hint">
          Taking too long? <Link href="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}

export function GitHubCallbackExperience() {
  return (
    <Suspense fallback={<p className="muted login-suspense">Loading…</p>}>
      <GitHubCallbackContent />
    </Suspense>
  );
}
