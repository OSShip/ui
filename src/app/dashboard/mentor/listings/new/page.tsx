'use client';

import { useAuth } from '@/hooks/use-auth';
import { CreateListingExperience } from '@/components/CreateListingExperience';

export default function NewListingPage() {
  const { user, isLoading: authLoading } = useAuth();

  if (authLoading) return <p className="muted listing-create-suspense">Loading…</p>;
  if (!user) return <p>Please <a href="/login">login</a>.</p>;
  if (user.role !== 'mentor' && user.role !== 'admin') {
    return <p className="access-denied">Mentor access required.</p>;
  }

  return <CreateListingExperience />;
}
