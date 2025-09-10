
// app/components/FollowerList.tsx
'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import FollowerItem from './FollowerItem';
import { fetchFollowers, fetchFollowing } from '@/src/services/api/profile.service';

interface FollowerListProps {
  username: string;
  currentUserId?: string;
  view:'followers' | 'following'
}

const FollowerList = ({ username, currentUserId , view}: FollowerListProps) => {
  const { data: network = [], isLoading, error } = useQuery({
    queryKey: ['network', username],
    queryFn: () => {
        if(view === 'followers') return fetchFollowers(username)
        return fetchFollowing(username)
    },
    staleTime:15 * 60 * 1000
  }); 

  if (isLoading) return <div className="p-5 text-center">Loading...</div>;
  if (error) return <div className="p-5 text-center text-red-500">Error loading followers</div>;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-8">
      {network.map((follower: any) => (
        <FollowerItem
          key={follower.id}
          id={follower.id}
          imgSrc={`https://randomuser.me/api/portraits/${follower.gender}/${follower.id}.jpg`}
          name={follower.name}
          username={follower.username}
          role={follower.role}
          alt={follower.name}
          isFollowing={follower.isFollowing || false}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
};

export default FollowerList;