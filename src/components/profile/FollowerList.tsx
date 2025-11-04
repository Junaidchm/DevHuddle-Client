
// app/components/FollowerList.tsx
'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import FollowerItem from './FollowerItem'; // Ensure this path is correct
import { useAuthHeaders } from '@/src/customHooks/useAuthHeaders';
import { PROFILE_DEFAULT_URL } from '@/src/constents';
import { fetchFollowers, fetchFollowing } from '@/src/services/api/profile.service';

interface FollowerListProps {
  username: string;
  currentUserId?: string;
  view: 'followers' | 'following';
}

const FollowerList = ({ username, currentUserId, view }: FollowerListProps) => {
  const authHeaders = useAuthHeaders();
  const { data: network = [], isLoading, error } = useQuery({
    queryKey: ['network', username, view],
    queryFn: () => {
      if (view === 'followers') {
        return fetchFollowers(username, authHeaders);
      }
      return fetchFollowing(username, authHeaders);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!authHeaders.Authorization,
  });

  if (isLoading) return <div className="p-5 text-center">Loading...</div>;
  if (error) return <div className="p-5 text-center text-red-500">Error loading network</div>;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-8">
      {network.map((follower: any) => (
        <FollowerItem
          key={follower.id}
          id={follower.id}
          imgSrc={follower.profilePicture || PROFILE_DEFAULT_URL}
          name={follower.name}
          username={follower.username}
          role={follower.jobTitle || 'Developer'}
          alt={follower.name}
          isFollowing={follower.isFollowing || false}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
};

export default FollowerList;