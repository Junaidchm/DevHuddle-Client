// app/components/ProfileHeaderClient.tsx
'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Avatar from './Avatar';
import ActionButtons from './ActionButtons';
import { fetchProfile } from '@/src/services/api/profile.service';

interface ProfileHeaderClientProps {
  initialProfile: any;
  currentUserId?: string;
}

const ProfileHeaderClient = ({ initialProfile, currentUserId }: ProfileHeaderClientProps) => {
  const { data: profile } = useQuery({
    queryKey: ['profile', initialProfile.username],
    queryFn: () => fetchProfile(initialProfile.username),
    initialData: initialProfile,
  });

  const isOwnProfile = currentUserId === profile?.id;

  return (
    <>
      <Avatar imgSrc={profile?.imgSrc || 'https://randomuser.me/api/portraits/men/32.jpg'} alt={profile?.name || 'User'} />
      {profile?.id && <ActionButtons userId={profile.id} isOwnProfile={isOwnProfile} />}
    </>
  );
};

export default ProfileHeaderClient;