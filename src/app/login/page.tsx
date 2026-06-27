import { Suspense } from 'react';
import LoginPage from './LoginForm';

export default function Page() {
  return (
    <Suspense fallback={<p className="muted">Loading...</p>}>
      <LoginPage />
    </Suspense>
  );
}
