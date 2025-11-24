// app/components/ProfileHeaderClient.tsx
'use client';
import React from 'react';
import Avatar from './Avatar';
import { PROFILE_DEFAULT_URL } from '@/src/constents';
import { UserProfile } from '@/src/types/user.type';
import { useRouter } from 'next/navigation';
import { FollowButton } from '../FollowButton';

interface ProfileHeaderClientProps {
  profile: UserProfile;
  isOwnProfile: boolean;
}

const ProfileHeaderClient = ({ profile, isOwnProfile }: ProfileHeaderClientProps) => {
  const router = useRouter();

  return (
    <>
      <Avatar src={profile.profilePicture || PROFILE_DEFAULT_URL} alt={profile.name} />
      <div className="flex flex-col gap-3 mt-6 min-w-[150px]">
        {isOwnProfile ? (
          <button
            className="bg-gradient-to-br from-blue-500 to-purple-500 text-white border-none py-2.5 px-5 rounded-lg font-medium cursor-pointer transition-all duration-200 text-sm flex items-center justify-center gap-2 hover:opacity-90"
            onClick={() => router.push(`/profile/update/${profile.username}`)}
          >
            Edit Profile
          </button>
        ) : (
          <FollowButton userId={profile.id} isFollowing={profile.isFollowing!} />
        )}
        <button
          className="bg-white text-slate-500 border border-slate-200 py-2.5 px-5 rounded-lg font-medium cursor-pointer transition-all duration-200 text-sm flex items-center justify-center gap-2 hover:bg-gray-50"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Profile URL copied to clipboard!');
          }}
        >
          Share Profile
        </button>
      </div>
    </>
  );
};

export default ProfileHeaderClient;