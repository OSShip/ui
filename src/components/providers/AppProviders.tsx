'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === 'user' || event.key === 'token') {
        hydrate();
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [hydrate]);

  return <>{children}</>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: true,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthHydrator>
        {children}
        <Toaster
          position="top-right"
          closeButton
          richColors
          toastOptions={{
            duration: 5000,
            classNames: {
              toast: 'osship-toast',
              title: 'osship-toast-title',
              description: 'osship-toast-desc',
              closeButton: 'osship-toast-close',
            },
          }}
        />
      </AuthHydrator>
    </QueryClientProvider>
  );
}
