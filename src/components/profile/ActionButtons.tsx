// app/components/ActionButtons.tsx
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

interface ActionButtonsProps {
  username:string;
  userId?: string;
  isOwnProfile: boolean;
  isFollowing?: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
  isPending: boolean;
}

const ActionButtons = ({username, userId, isOwnProfile, isFollowing, onFollow, onUnfollow, isPending }: ActionButtonsProps) => {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-3 mt-6 min-w-[150px]">
      {isOwnProfile && (
        <button
          className="bg-gradient-to-br from-blue-500 to-purple-500 text-white border-none py-2.5 px-5 rounded-lg font-medium cursor-pointer transition-all duration-200 text-sm flex items-center justify-center gap-2 hover:opacity-90"
          onClick={() => router.push(`/profile/update/${username}`)}
        >
          Edit Profile
        </button>
      )}
      {!isOwnProfile && (
        <button
          className={`py-2.5 px-5 rounded-lg font-medium cursor-pointer transition-all duration-200 text-sm flex items-center justify-center gap-2 ${
            isFollowing
              ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          onClick={isFollowing ? onUnfollow : onFollow}
          disabled={isPending}
        >
          {isPending ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
        </button>
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
  );
};

export default ActionButtons;