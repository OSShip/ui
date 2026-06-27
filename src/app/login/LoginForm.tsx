'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login } from '@/lib/api/auth';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function defaultDashboard(role: string) {
    if (role === 'admin') return '/dashboard/admin/applications';
    if (role === 'mentor') return '/dashboard/mentor';
    return '/dashboard/student';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const { user } = await login(email, password);
      router.push(next || defaultDashboard(user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }

  return (
    <>
      <h1>Login</h1>
      <form className="form" onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn">Login</button>
      </form>
    </>
  );
}
