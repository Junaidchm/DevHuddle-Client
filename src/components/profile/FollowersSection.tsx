// app/components/FollowersSection.tsx
'use client';
import React, { useState } from 'react';
import FollowersHeader from './FollowersHeader';
import NetworkStats from './NetworkStats';
import FollowerList from './FollowerList';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/queryKeys';
import { fetchProfileByUsernameAction } from '@/src/app/(main)/profile/[user_name]/actions';

interface FollowersSectionProps {
  username: string;
  currentUserId?: string;
  initialProfile: any;
}

const FollowersSection = ({ username, currentUserId, initialProfile }: FollowersSectionProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'followers' | 'following'>('followers');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const { data: profile = initialProfile } = useQuery({
    queryKey: queryKeys.profiles.detail(username),
    queryFn: () => fetchProfileByUsernameAction(username),
    initialData: initialProfile,
  });

  return (
    <section id="followers">
      <FollowersHeader 
        onSearch={handleSearch} 
        view={view} 
        setView={setView}
        searchQuery={searchQuery}
      />
      <NetworkStats
        followers={profile?._count?.followers.toString() || '0'}
        following={profile?._count?.following.toString() || '0'}
      />
      <FollowerList
        username={username}
        currentUserId={currentUserId}
        view={view}
        searchQuery={searchQuery}
      />
    </section>
  );
};

export default FollowersSection;
