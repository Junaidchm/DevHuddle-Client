"use client";

import React, { useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import PostCard from "./PostCard";
import { fetchFeed } from "@/src/services/api/feed.service";
import InfiniteScorllContainer from "../../layouts/InfiniteScrollContainer";
import { Loader2 } from "lucide-react";
import DeletePostDialog from "./DeletePostModal";
import PostsLoadingSkeleton from "./PostsLoadingSkeleton ";
import { NewPost } from "@/src/app/types/feed";
import { useSession } from "next-auth/react";



export default function FeedContainer({userid}:{userid:string}) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    status,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "for-you"],
    queryFn: ({ pageParam }) => fetchFeed(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
  

  const {status:sessionStatus} = useSession()

  const posts: NewPost[] = data?.pages.flatMap(
    (page) => page.posts
  ) as NewPost[];

  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  if (status === "success" && !posts?.length && !hasNextPage) {
    return (
      <p className="text-center text-muted-foreground">
        No one has posted anything yet.
      </p>
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
    <InfiniteScorllContainer
      className="flex flex-col gap-4 max-w-2xl mx-auto p-4"
      onBottomReached={() => !isLoading && hasNextPage && fetchNextPage()}
    >
      {posts?.map((post) => (
        <PostCard userid={userid} key={post.id} post={post} />
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScorllContainer>
  );
}
