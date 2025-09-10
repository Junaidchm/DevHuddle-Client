// app/components/FollowersSection.tsx
'use client';
import React, { useState } from 'react';
import FollowersHeader from './FollowersHeader';
import NetworkStats from './NetworkStats';
import FollowerList from './FollowerList';
import Pagination from './Pagination';

interface FollowersSectionProps {
  username: string;
  currentUserId?: string;
}

const FollowersSection = ({ username, currentUserId }: FollowersSectionProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'followers' | 'following'>('followers');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search logic if backend supports it
  };

  return (
    <section id="followers">
      <FollowersHeader onSearch={handleSearch} view={view} setView={setView} />
      <NetworkStats
        followers="843"
        following="128"
        topDomain="Frontend"
        followerChange="24"
        followingChange="7"
        domainPercentage="65"
      />
      <FollowerList username={username} currentUserId={currentUserId} view={view} />
      <Pagination />
    </section>
  );
};

export default FollowersSection;