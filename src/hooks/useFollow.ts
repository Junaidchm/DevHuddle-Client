import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followUser, unfollowUser } from "../services/api/follow.service";
import { useAuthHeaders } from "../customHooks/useAuthHeaders";
import { useSession } from "next-auth/react";
import { queryKeys } from "../lib/queryKeys";
import { UserProfile } from "../types/user.type";
import toast from "react-hot-toast";

interface UseFollowOptions {
  username: string;
}
/**
 * A centralized hook for handling follow and unfollow mutations.
 * It performs optimistic updates and invalidates all relevant queries on success
 * to ensure the entire UI stays in sync.
 *
 * @returns Mutations for following and unfollowing a user.
 */

export function useFollow() {
  const authHeaders = useAuthHeaders();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const invalidateQueries = () => {
    console.log('invalidating queries ---------------------------------> ')
    // Invalidate all queries related to user profiles, network lists, and suggestions
    queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.network.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.suggestions.all });
    
    // ✅ FIXED: Invalidate notifications to ensure new follow notifications appear instantly
    // (WebSocket should handle this, but this is a backup)
    if (session?.user?.id) {
      queryClient.invalidateQueries({
        queryKey: ["notifications", session.user.id],
        refetchType: "none", // Don't refetch immediately, let WebSocket handle it
      });
    }
  };

  const followMutation = useMutation({
    mutationFn: (userId: string) => followUser(userId, authHeaders),
    onMutate: async (userId: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.profiles.all });

      // Optimistically update the profile data
      const profileQueryKey = queryClient
        .getQueryCache()
        .getAll()
        .find(
          (query) =>
            // query.getObserversCount() > 0 &&
            query.queryKey[0] === "profiles" &&
            (query.state.data as UserProfile)?.id === userId
        )?.queryKey;

      if (!profileQueryKey) return;

      const previousProfile =
        queryClient.getQueryData<UserProfile>(profileQueryKey);

      if (previousProfile) {
        queryClient.setQueryData<UserProfile>(profileQueryKey, {
          ...previousProfile,
          isFollowing: true,
          _count: {
            ...previousProfile._count,
            followers: previousProfile._count.followers + 1,
          },
        });
      }

      return { previousProfile, profileQueryKey };
    },
    onError: (error: any, _, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(
          context.profileQueryKey,
          context.previousProfile
        );
      }
      toast.error("Failed to follow user.");
    },
    onSuccess: () => {
      toast.success("Followed successfully!");
      invalidateQueries();
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: (userId: string) => unfollowUser(userId, authHeaders),
    onMutate: async (userId: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.profiles.all });

      const profileQueryKey = queryClient
        .getQueryCache()
        .getAll()
        .find(
          (query) =>
            // query.getObserversCount() > 0 &&
            query.queryKey[0] === "profiles" &&
            (query.state.data as UserProfile)?.id === userId
        )?.queryKey;

      if (!profileQueryKey) return;

      const previousProfile =
        queryClient.getQueryData<UserProfile>(profileQueryKey);

      if (previousProfile) {
        queryClient.setQueryData<UserProfile>(profileQueryKey, {
          ...previousProfile,
          isFollowing: false,
          _count: {
            ...previousProfile._count,
            followers: previousProfile._count.followers - 1,
          },
        });
      }

      return { previousProfile, profileQueryKey };
    },
    onError: (error: any, _, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(
          context.profileQueryKey,
          context.previousProfile
        );
      }
      toast.error("Failed to unfollow user.");
    },
    onSuccess: () => {
      toast.success("Unfollowed successfully!");
      invalidateQueries();
    },
  });

  return { followMutation, unfollowMutation };
}
