'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchProfile, type UserProfile } from '@/lib/api/users';

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchProfile(id).then(setProfile).catch(() => {});
  }, [id]);

  return (
    <>
      {profile ? (
        <>
          <h1>{profile.display_name || 'Profile'}</h1>
          <p className="muted">Role: {profile.role}</p>
          {profile.github_username && <p>GitHub: @{profile.github_username}</p>}
          {profile.bio && <p>{profile.bio}</p>}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
}
