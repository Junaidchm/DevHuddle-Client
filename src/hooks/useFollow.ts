// Types
interface FollowerInfo {
  followers: number;
  isFollowedByUser: boolean;
}

interface MutationContext {
  prevData: FollowerInfo | { suggestions: SuggestedFollower[] } | undefined;
  context: "profile" | "suggestion";
}

import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  followUser,
  getFollowerInfo,
  unfollowUser,
} from "../services/api/follow.service";
import { useAuthHeaders } from "../customHooks/useAuthHeaders";
import { SuggestedFollower } from "../app/types";

interface UseFollowOptions {
  theUser: string;
  userId: string;
  context: "suggestion" | "profile";
  initialFollowerCount?: number;
  initialIsFollowing?: boolean;
}

export function useFollow({
  theUser,
  userId,
  context,
  initialFollowerCount,
  initialIsFollowing,
}: UseFollowOptions) {
  const { data: session } = useSession();
  const authHeaders = useAuthHeaders();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Only fetch follower info for profile context
  const followerInfoQuery = useQuery({
    queryKey: ["follower-info", userId],
    queryFn: () => getFollowerInfo(userId, authHeaders),
    initialData:
      initialFollowerCount !== undefined && initialIsFollowing !== undefined
        ? {
            followers: initialFollowerCount,
            isFollowedByUser: initialIsFollowing,
          }
        : undefined,
    staleTime: 5 * 60 * 1000, // Stale after 5 minutes
    enabled: !!session?.user?.accessToken && context === "profile",
  });

  const requireLogin = () => {
    toast.error("Please sign in to perform this action");
    router.push("/signIn");
    return false;
  };

  const followMutation = useMutation<any, any, void, MutationContext>({
    mutationFn: () => followUser(userId, authHeaders),
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["follower-info", userId] });
      await queryClient.cancelQueries({ queryKey: ["suggestions", theUser] });

      let prevData;

      if (context === "profile") {
        // Update profile follower info optimistically
        prevData = queryClient.getQueryData<FollowerInfo>([
          "follower-info",
          userId,
        ]);
        queryClient.setQueryData<FollowerInfo>(
          ["follower-info", userId],
          (old) =>
            old && {
              ...old,
              followers: old.followers + 1,
              isFollowedByUser: true,
            }
        );
      } else {
        // Update suggestions optimistically
        prevData = queryClient.getQueryData<{
          suggestions: SuggestedFollower[];
        }>(["suggestions", theUser]);
        queryClient.setQueryData<{ suggestions: SuggestedFollower[] }>(
          ["suggestions", theUser],
          (old) => {
            if (!old?.suggestions) return old;
            return {
              ...old,
              suggestions: old.suggestions.map((user) =>
                user.id === userId
                  ? {
                      ...user,
                      followersCount: user.followersCount + 1,
                      isFollowedByUser: true,
                    }
                  : user
              ),
            };
          }
        );
      }

      return { prevData, context };
    },
    onError: (error: any, _, context) => {
      // Revert optimistic update on error
      if (context?.prevData) {
        if (context.context === "profile") {
          queryClient.setQueryData(["follower-info", userId], context.prevData);
        } else {
          queryClient.setQueryData(["suggestions", theUser], context.prevData);
        }
      }

      if (error?.status === 401) requireLogin();
      else toast.error("Failed to follow user. Please try again.");
    },
    onSuccess: (response) => {
      toast.success("Followed successfully!");

      // Update cache with server data
      if (context === "profile" && response.success && response.data) {
        queryClient.setQueryData<FollowerInfo>(
          ["follower-info", userId],
          (old) => ({
            ...old,
            followers: response.data.followers,
            isFollowedByUser: true,
          })
        );
      } else if (
        context === "suggestion" &&
        response.success &&
        response.data
      ) {
        queryClient.setQueryData<{ suggestions: SuggestedFollower[] }>(
          ["suggestions", theUser],
          (old) => {
            if (!old?.suggestions) return old;
            return {
              ...old,
              suggestions: old.suggestions.map((user) =>
                user.id === userId
                  ? {
                      ...user,
                      followersCount: response.data.followingCount,
                      isFollowedByUser: true,
                    }
                  : user
              ),
            };
          }
        );
      }
    },
  });

  const unfollowMutation = useMutation<any, any, void, MutationContext>({
    mutationFn: () => unfollowUser(userId, authHeaders),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["follower-info", userId] });
      await queryClient.cancelQueries({ queryKey: ["suggestions", theUser] });

      let prevData;

      if (context === "profile") {
        prevData = queryClient.getQueryData<FollowerInfo>([
          "follower-info",
          userId,
        ]);
        queryClient.setQueryData<FollowerInfo>(
          ["follower-info", userId],
          (old) =>
            old && {
              ...old,
              followers: Math.max(0, old.followers - 1),
              isFollowedByUser: false,
            }
        );
      } else {
        prevData = queryClient.getQueryData<{
          suggestions: SuggestedFollower[];
        }>(["suggestions", theUser]);
        queryClient.setQueryData<{ suggestions: SuggestedFollower[] }>(
          ["suggestions", theUser],
          (old) => {
            if (!old?.suggestions) return old;
            return {
              ...old,
              suggestions: old.suggestions.map((user) =>
                user.id === userId
                  ? {
                      ...user,
                      followersCount: user.followersCount - 1,
                      isFollowedByUser: false,
                    }
                  : user
              ),
            };
          }
        );
      }

      return { prevData, context };
    },
    onError: (error: any, _, context) => {
      if (context?.prevData) {
        if (context.context === "profile") {
          queryClient.setQueryData(["follower-info", userId], context.prevData);
        } else {
          queryClient.setQueryData(["suggestions", theUser], context.prevData);
        }
      }

      if (error?.status === 401) requireLogin();
      else toast.error("Failed to unfollow user. Please try again.");
    },
    onSuccess: () => {
      toast.success("Unfollowed successfully!");
    },
  });

  const toggleFollow = () => {
    if (!session?.user?.accessToken) {
      return requireLogin();
    }

    const isFollowing =
      context === "profile"
        ? followerInfoQuery.data?.isFollowedByUser
        : queryClient.getQueryData<{ suggestions: SuggestedFollower[] }>([
            "suggestions",
            theUser,
          ])
            ?.suggestions?.find((u) => u.id === userId)?.isFollowedByUser;

    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  const getCurrentFollowing = (): boolean => {
    if (context === "profile") {
      return followerInfoQuery.data?.isFollowedByUser ?? false;
    }

    const suggestedUser = queryClient
      .getQueryData<{ suggestions: SuggestedFollower[] }>([
        "suggestions",
        theUser,
      ])
      ?.suggestions?.find((u) => u.id === userId);
    return suggestedUser?.isFollowedByUser ?? false;
  };

  const getCurrentFollowerCount = (): number => {
    if (context === "profile") {
      return followerInfoQuery.data?.followers ?? 0;
    }

    const suggestedUser = queryClient
      .getQueryData<{ suggestions: SuggestedFollower[] }>([
        "suggestions",
        theUser,
      ])
      ?.suggestions?.find((u) => u.id === userId);
    return suggestedUser?.followersCount as number;
  };

  return {
    toggleFollow,
    isFollowing: getCurrentFollowing(),
    isPending: followMutation.isPending || unfollowMutation.isPending,
    followerCount: getCurrentFollowerCount(),
    action: followMutation.isPending
      ? "follow"
      : unfollowMutation.isPending
      ? "unfollow"
      : null,
  };
}
