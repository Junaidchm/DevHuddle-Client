"use client";

import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import PostCard from "./PostCard";
import { fetchFeed } from "@/src/services/api/feed.service";
import InfiniteScorllContainer from "../../layouts/InfiniteScrollContainer";
import { Loader2 } from "lucide-react";
import PostsLoadingSkeleton from "./PostsLoadingSkeleton";
import { NewPost } from "@/src/app/types/feed";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";

import FeedSortDropdown from "./FeedSortDropdown";
import { queryKeys } from "@/src/lib/queryKeys";

export default function FeedContainer({userid}:{userid:string}) {
  const { data: session, status: sessionStatus } = useSession();
  const authHeaders = useAuthHeaders();
  const [sortBy, setSortBy] = React.useState<"RECENT" | "TOP">("RECENT");
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    status,
  } = useInfiniteQuery({
    queryKey: queryKeys.feed.list({ sortBy }), // ✅ Standardized query key
    queryFn: ({ pageParam }) => fetchFeed(
      pageParam, 
      authHeaders as Record<string, string>, 
      undefined, 
      sortBy
    ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: sessionStatus !== "loading" && !!authHeaders.Authorization, // Only fetch when session is loaded and authenticated
  });

  const posts = React.useMemo(() => {
    const allPosts = data?.pages.flatMap((page) => page.posts) || [];
    const seenIds = new Set();
    return allPosts.filter((post) => {
      if (seenIds.has(post.id)) {
        return false;
      }
      seenIds.add(post.id);
      return true;
    }) as NewPost[];
  }, [data]);

  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  if (status === "success" && !posts?.length && !hasNextPage) {
    return (
      <div className="flex flex-col gap-2">
         {/* Dropdown even when empty to allow switching back if needed */}
         <FeedSortDropdown sortBy={sortBy} onSortChange={setSortBy} />
         <p className="text-center text-muted-foreground py-8">
           No posts found.
         </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading posts.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <FeedSortDropdown sortBy={sortBy} onSortChange={setSortBy} />
      <InfiniteScorllContainer
        className="flex flex-col gap-2"
        onBottomReached={() => !isLoading && hasNextPage && fetchNextPage()}
      >
        {posts?.map((post) => (
          <PostCard userid={userid} key={post.id} post={post} />
        ))}
        {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
      </InfiniteScorllContainer>
    </div>
  );
}
