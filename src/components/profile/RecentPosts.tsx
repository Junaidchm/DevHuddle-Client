'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchFeed } from '@/src/services/api/feed.service';
import { useAuthHeaders } from '@/src/customHooks/useAuthHeaders';
import ProfilePostPreviewCard from './ProfilePostPreviewCard';
import { queryKeys } from '@/src/lib/queryKeys';
import { ArrowRight, Loader2 } from 'lucide-react';

interface RecentPostsProps {
  userId: string;
  username: string;
  isOwnProfile: boolean;
}

const RecentPosts = ({ userId, username, isOwnProfile }: RecentPostsProps) => {
  const authHeaders = useAuthHeaders();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.feed.user(userId, 2),
    queryFn: () => fetchFeed(null, authHeaders as Record<string, string>, userId, 'RECENT', 2),
    enabled: !!userId && !!authHeaders.Authorization,
  });

  const posts = data?.posts || [];

  if (isLoading) {
    return <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-purple-600" /></div>;
  }

  if (posts.length === 0) {
      if (isOwnProfile) {
          return (
             <div className="text-center py-6 border border-dashed rounded-lg bg-gray-50/50">
                 <p className="text-muted-foreground text-sm mb-2">You haven't posted anything yet.</p>
             </div>
          )
      }
      return <div className="text-center py-6 text-muted-foreground text-sm">No recent activity.</div>;
  }

  return (
    <div className="space-y-0">
      <div className="rounded-lg border border-border overflow-hidden bg-white">
          {posts.map((post: any) => (
            <ProfilePostPreviewCard key={post.id} post={post} />
          ))}

          <Link
            href={`/profile/${username}/posts`}
            className="block w-full py-3 text-center text-sm font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors border-t border-border"
          >
            Show all posts <ArrowRight className="inline w-3 h-3 ml-1" />
          </Link>
      </div>
    </div>
  );
};

export default RecentPosts;
