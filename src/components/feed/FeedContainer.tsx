'use client';

import React from 'react';
import PostCard from './PostCard';
import { FeedResponse } from '@/src/app/types/feed';


interface FeedContainerProps {
  initialFeed: FeedResponse;
  userId: string;
}

export default function FeedContainer({ initialFeed, userId }: FeedContainerProps) {
  return (
    <div className="flex flex-col gap-4">
      {initialFeed.posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}