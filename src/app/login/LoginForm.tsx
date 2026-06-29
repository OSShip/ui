'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { defaultDashboard } from '@/lib/auth/nav';
import { login } from '@/lib/api/auth';
import { useFormFeedback } from '@/hooks/use-form-feedback';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const next = searchParams.get('next');
  const { fieldClass, btnClass, formClass, reportError, clearError } = useFormFeedback();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    try {
      const { user } = await login(email, password);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      router.push(next || defaultDashboard(user.role));
    } catch (err) {
      reportError(err, 'Login failed');
    }
  }

  return (
    <>
      <h1>Login</h1>
      <form className={formClass} onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          className={fieldClass}
          value={email}
          onChange={(e) => { clearError(); setEmail(e.target.value); }}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className={fieldClass}
          value={password}
          onChange={(e) => { clearError(); setPassword(e.target.value); }}
          required
        />
        <button type="submit" className={btnClass}>Login</button>
      </form>
    </>
  );
}
