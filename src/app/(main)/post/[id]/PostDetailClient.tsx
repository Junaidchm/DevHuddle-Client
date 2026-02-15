"use client";

import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import PostCard from "@/src/components/feed/feedEditor/PostCard";
import { fetchPostById } from "@/src/services/api/feed.service";
import PostsLoadingSkeleton from "@/src/components/feed/feedEditor/PostsLoadingSkeleton";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";

interface PostDetailClientProps {
  id: string;
  commentId: string | null;
  userId: string | undefined;
}

export default function PostDetailClient({ id, commentId, userId }: PostDetailClientProps) {
  const authHeaders = useAuthHeaders();
  
  const { data: postResponse, isLoading, error } = useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPostById(id, authHeaders),
    enabled: !!id && Object.keys(authHeaders).length > 0,
  });

  // Extract post data from response (many API responses wrap data in { data: ... })
  const post = postResponse?.data || postResponse;

  // Handle scrolling to comment and highlighting
  useEffect(() => {
    if (!isLoading && post) {
      // Small timeout to ensure DOM is rendered
      const timer = setTimeout(() => {
        const targetId = commentId ? `comment-${commentId}` : `post-${id}`;
        const element = document.getElementById(targetId);
        
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("highlight-pulse");
          
          // Remove highlight after animation
          setTimeout(() => {
            element.classList.remove("highlight-pulse");
          }, 3000);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, post, commentId, id]);

  if (isLoading) {
    return (
      <div className="w-full max-w-[555px]">
        <PostsLoadingSkeleton />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex justify-center py-10 text-red-500">
        Post not found or an error occurred.
      </div>
    );
  }

  return (
    <main className="flex-1 w-full max-w-[555px] min-w-0 flex flex-col gap-2">
      <PostCard userid={userId as string} post={post} />
    </main>
  );
}
