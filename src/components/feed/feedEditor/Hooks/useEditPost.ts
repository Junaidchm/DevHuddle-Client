"use client";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { editPost, getPostVersions, restorePostVersion } from "@/src/services/api/engagement.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { InfiniteData } from "@tanstack/react-query";
import { PostsPage, NewPost } from "@/src/app/types/feed";

export interface EditPostData {
  content?: string;
  addAttachmentIds?: string[];
  removeAttachmentIds?: string[];
}

export interface PostVersion {
  id: string;
  postId: string;
  versionNumber: number;
  content: string;
  attachmentIds: string[];
  editedAt: string;
  editedById: string;
}

/**
 * Hook for editing posts
 */
export function useEditPost() {
  const queryClient = useQueryClient();
  const authHeaders = useAuthHeaders();

  return useMutation({
    mutationFn: async ({
      postId,
      data,
    }: {
      postId: string;
      data: EditPostData;
    }) => {
      const idempotencyKey = uuidv4();
      return await editPost(postId, data, authHeaders, idempotencyKey);
    },
    onMutate: async ({ postId, data }) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: ["post-feed"] });

      // Snapshot previous data for rollback
      const previousFeedData = queryClient.getQueryData<
        InfiniteData<PostsPage, string | null>
      >(["post-feed", "for-you"]);

      // Optimistically update the feed cache
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        { queryKey: ["post-feed"] },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              posts: page.posts.map((post) => {
                if (post.id === postId) {
                  return {
                    ...post,
                    content: data.content ?? post.content,
                    // Note: Attachment updates would require more complex logic
                    updatedAt: new Date().toISOString(),
                  };
                }
                return post;
              }),
            })),
          };
        }
      );

      return { previousFeedData };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousFeedData) {
        queryClient.setQueryData(
          ["post-feed", "for-you"],
          context.previousFeedData
        );
      }
      toast.error(error.message || "Failed to edit post");
    },
    onSuccess: (data, variables) => {
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: ["post-feed"],
      });
      toast.success("Post updated successfully!");
    },
  });
}

/**
 * Hook for getting post versions
 */
export function usePostVersions(postId: string) {
  const authHeaders = useAuthHeaders();

  return useQuery({
    queryKey: ["post-versions", postId],
    queryFn: async () => {
      const response = await getPostVersions(postId, authHeaders);
      return response.versions;
    },
    enabled: !!postId,
  });
}

/**
 * Hook for restoring a post version
 */
export function useRestorePostVersion() {
  const queryClient = useQueryClient();
  const authHeaders = useAuthHeaders();

  return useMutation({
    mutationFn: async ({
      postId,
      versionNumber,
    }: {
      postId: string;
      versionNumber: number;
    }) => {
      const idempotencyKey = uuidv4();
      return await restorePostVersion(
        postId,
        versionNumber,
        authHeaders,
        idempotencyKey
      );
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["post-feed"],
      });
      queryClient.invalidateQueries({
        queryKey: ["post-versions", variables.postId],
      });
      toast.success("Post version restored successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to restore post version");
    },
  });
}

