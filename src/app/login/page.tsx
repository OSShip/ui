import { Suspense } from 'react';
import { LoginExperience } from '@/components/LoginExperience';

export default function Page() {
  return (
    <Suspense fallback={<p className="muted login-suspense">Loading…</p>}>
      <LoginExperience />
    </Suspense>
  );
}
