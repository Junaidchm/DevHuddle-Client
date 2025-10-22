import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FollowerInfo } from "../app/types";
import {  getFollowerInfo, unfollowUser } from "../services/api/profile.service";
import { followUser } from "../services/api/follow.service";

interface UseFollowerInfoOptions {
  userId: string;
  initialData?: FollowerInfo;
}

export function useFollowerInfo({ userId, initialData }: UseFollowerInfoOptions) {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Query for follower info
  const query = useQuery({
    queryKey: ["follower-info", userId],
    queryFn: () => getFollowerInfo(userId),
    initialData,
    staleTime: Infinity, // Never consider data stale since it's preloaded
    retry: (failureCount, error: any) => {
      // Don't retry on 401 (unauthorized)
      if (error?.status === 401) return false;
      return failureCount < 2;
    },
    enabled: !!session?.user?.accessToken, // Only run if authenticated
  });

  // Follow mutation with optimistic updates
  const followMutation = useMutation({
    mutationFn: () => followUser(userId),
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["follower-info", userId] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<FollowerInfo>(["follower-info", userId]);

      // Optimistically update
      queryClient.setQueryData<FollowerInfo>(["follower-info", userId], (old) => {
        if (!old) return old;
        return {
          ...old,
          followers: old.followers + 1,
          isFollowedByUser: true,
        };
      });

      return { previousData };
    },
    onError: (error: any, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(["follower-info", userId], context.previousData);
      }

      // Handle specific error cases
      if (error?.status === 401) {
        toast.error("Please sign in to follow users");
        router.push("/signIn");
      } else if (error?.status === 403) {
        toast.error("You cannot follow this user");
      } else {
        toast.error("Failed to follow user. Please try again.");
      }
    },
    onSuccess: () => {
      toast.success("Successfully followed user!");
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["suggestions"] });
    },
  });

  // Unfollow mutation with optimistic updates
  const unfollowMutation = useMutation({
    mutationFn: () => unfollowUser(userId),
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["follower-info", userId] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<FollowerInfo>(["follower-info", userId]);

      // Optimistically update
      queryClient.setQueryData<FollowerInfo>(["follower-info", userId], (old) => {
        if (!old) return old;
        return {
          ...old,
          followers: Math.max(0, old.followers - 1),
          isFollowedByUser: false,
        };
      });

      return { previousData };
    },
    onError: (error: any, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(["follower-info", userId], context.previousData);
      }

      // Handle specific error cases
      if (error?.status === 401) {
        toast.error("Please sign in to unfollow users");
        router.push("/signIn");
      } else if (error?.status === 403) {
        toast.error("You cannot unfollow this user");
      } else {
        toast.error("Failed to unfollow user. Please try again.");
      }
    },
    onSuccess: () => {
      toast.success("Successfully unfollowed user!");
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["suggestions"] });
    },
  });

  // Toggle follow/unfollow
  const toggleFollow = () => {
    if (!session?.user?.accessToken) {
      toast.error("Please sign in to follow users");
      router.push("/signIn");
      return;
    }

    if (query.data?.isFollowedByUser) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  return {
    // Data
    followerInfo: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    
    // Actions
    toggleFollow,
    isFollowing: query.data?.isFollowedByUser ?? false,
    
    // Loading states
    isPending: followMutation.isPending || unfollowMutation.isPending,
    
    // Error states
    followError: followMutation.error,
    unfollowError: unfollowMutation.error,
  };
}