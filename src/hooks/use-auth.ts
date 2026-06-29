'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMe } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/auth-store';

export function useAuth() {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const { data: freshUser, isFetching, isError, isFetched } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    enabled: hydrated && !!token,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (freshUser) setUser(freshUser);
  }, [freshUser, setUser]);

  useEffect(() => {
    if (isError && token) {
      clearAuth();
      queryClient.removeQueries({ queryKey: ['auth', 'me'] });
    }
  }, [isError, token, clearAuth, queryClient]);

  const resolvedUser = freshUser ?? user;
  const isVerified = !!freshUser;
  const isCheckingSession = hydrated && !!token && !isFetched;

  function logout() {
    clearAuth();
    queryClient.removeQueries({ queryKey: ['auth', 'me'] });
  }

  return {
    user: resolvedUser,
    token,
    hydrated,
    isVerified,
    isCheckingSession,
    isLoading: !hydrated || isCheckingSession,
    isAuthenticated: hydrated && !!token && !!resolvedUser,
    logout,
  };
}
