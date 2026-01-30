'use client';

import React from 'react';
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import PostCard from "../feed/feedEditor/PostCard";
import { fetchFeed } from "@/src/services/api/feed.service";
import InfiniteScorllContainer from "../layouts/InfiniteScrollContainer";
import { Loader2 } from "lucide-react";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { NewPost } from "@/src/app/types/feed";
import { queryKeys } from '@/src/lib/queryKeys';

interface ActivitySectionProps {
  type: 'posts' | 'comments';
  userId: string; // This is the profile owner (author)
  currentUserId?: string; // This is the viewer
}

const ActivitySection = ({ type, userId, currentUserId }: ActivitySectionProps) => {
  const { status: sessionStatus } = useSession();
  const authHeaders = useAuthHeaders();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    status,
    error
  } = useInfiniteQuery({
    queryKey: queryKeys.feed.user(userId),
    queryFn: ({ pageParam }) => fetchFeed(pageParam, authHeaders as Record<string, string>, userId),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: sessionStatus !== "loading" && !!authHeaders.Authorization && type === 'posts',
  });

  const posts: NewPost[] = data?.pages.flatMap(
    (page) => page.posts
  ) as NewPost[];

  if (type === 'comments') {
       return (
          <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300 mt-4">
              <p className="text-gray-500">Comments coming soon.</p>
          </div>
      );
  }

  if (status === "pending") {
    // Simple loading state
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-purple-600" /></div>;
  }

  if (status === "error") {
      console.error("Activity fetch error:", error);
      return (
          <div className="text-center py-10 text-red-500">
              Failed to load activity.
          </div>
      );
  }

  if (status === "success" && !posts?.length) {
      return (
          <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300 mt-4">
              <p className="text-gray-500">No posts to show yet.</p>
              {currentUserId === userId && (
                  <button className="mt-4 px-4 py-2 border border-purple-600 text-purple-600 rounded-full font-semibold hover:bg-purple-50 transition">
                      Create a post
                  </button>
              )}
          </div>
      );
  }

  return (
    <div className="space-y-4 mt-4">
        <InfiniteScorllContainer
            className="flex flex-col gap-4"
            onBottomReached={() => !isLoading && hasNextPage && fetchNextPage()}
        >
            {posts?.map((post) => (
                <PostCard userid={currentUserId || ''} key={post.id} post={post} />
            ))}
            {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin text-purple-600" />}
        </InfiniteScorllContainer>
    </div>
  );
};

export default ActivitySection;
