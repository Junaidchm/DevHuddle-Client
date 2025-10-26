import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useRef } from "react";
import { followUser, getFollowerInfo, unfollowUser } from "../services/api/follow.service";
import type { FollowerInfo, SuggestedFollower } from "../app/types";
import { followUserAction } from "../app/actions/follow";
import { useAuthHeaders } from "../hooks/useAuthHeaders";

type FollowButtonToggleType = "suggestion" | "profile";

interface UseFollowerInfoOptions {
  userId: string;
  initialData?: FollowerInfo;
  buttonType?: FollowButtonToggleType;
}

export function useFollowerInfo({
  userId,
  initialData,
  buttonType = "profile",
}: UseFollowerInfoOptions) {
  const { data: session } = useSession();
  const authHeaders = useAuthHeaders();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isFollowed = useRef(initialData?.isFollowedByUser ?? false);
  const actionBeingPerformed = useRef<"follow" | "unfollow" | null>(null);

  const query = useQuery({
    queryKey: ["follower-info", userId],
    queryFn: () => getFollowerInfo(userId, authHeaders),
    initialData,
    staleTime: 5 * 60 * 1000, // Stale after 5 minutes
    enabled: !!session?.user?.accessToken,
  });

  const requireLogin = () => {
    toast.error("Please sign in to perform this action");
    router.push("/signIn");
    return false;
  };

  const followMutation = useMutation({
    mutationFn: () => followUser(userId, authHeaders),
    onMutate: async () => {
      actionBeingPerformed.current = "follow";

      if (buttonType === "profile") {
        await queryClient.cancelQueries({
          queryKey: ["follower-info", userId],
        });
        const prevFollowerInfo = queryClient.getQueryData<FollowerInfo>([
          "follower-info",
          userId,
        ]);

        queryClient.setQueryData<FollowerInfo>(
          ["follower-info", userId],
          (old) => {
            if (!old) return old;
            return {
              ...old,
              followers: old.followers + 1,
              isFollowedByUser: true,
            };
          }
        );

        return { prevFollowerInfo };
      }

      await queryClient.cancelQueries({ queryKey: ["suggestions"] });

      const prevSuggestions = queryClient.getQueryData<{
        suggestions: SuggestedFollower[];
      }>(["suggestions"]);

      queryClient.setQueryData<{ suggestions: SuggestedFollower[] }>(
        ["suggestions"],
        (old) => {
          if (!old?.suggestions) return old;
          return {
            ...old,
            suggestions: old.suggestions.map((user) =>
              user.id === userId
                ? {
                    ...user,
                    _count: { followers: user._count.followers + 1 },
                    isFollowedByUser: true,
                  }
                : user
            ),
          };
        }
      );

      // Don't set isFollowed.current here - let the UI handle the optimistic update
      return { prevSuggestions };
    },
    onError: (error: any, _, context) => {
      if (context?.prevFollowerInfo) {
        queryClient.setQueryData(
          ["follower-info", userId],
          context.prevFollowerInfo
        );
      }
      if (context?.prevSuggestions) {
        queryClient.setQueryData(["suggestions"], context.prevSuggestions);
      }
      actionBeingPerformed.current = null;

      if (error?.status === 401) requireLogin();
      else toast.error("Failed to follow user. Please try again.");
    },
    onSuccess: (serverdata: any) => {
      toast.success("Followed successfully!");
      isFollowed.current = true;
      actionBeingPerformed.current = null;

      if (buttonType === "profile" && serverdata.success && serverdata.data) {
        queryClient.setQueryData<FollowerInfo>(
          ["follower-info", userId],
          (old) => {
            return {
              ...old,
              followers: serverdata.data.followers,
              isFollowedByUser: serverdata.data.isFollowedByUser,
            };
          }
        );
      }

      if (
        buttonType === "suggestion" &&
        serverdata.success &&
        serverdata.data
      ) {
        queryClient.setQueryData<{ suggestions: SuggestedFollower[] }>(
          ["suggestions"],
          (old) => {
            if (!old?.suggestions) return old;
            return {
              ...old,
              suggestions: old.suggestions.map((user) =>
                user.id === userId
                  ? {
                      ...user,
                      _count: { followers: serverdata.data.followingCount },
                      isFollowedByUser: true,
                    }
                  : user
              ),
            };
          }
        );
      }

      // queryClient.invalidateQueries({ queryKey: ["suggestions"] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => unfollowUser(userId, authHeaders),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["follower-info", userId] });
      await queryClient.cancelQueries({ queryKey: ["suggestions"] });

      actionBeingPerformed.current = "unfollow";

      const prevFollowerInfo = queryClient.getQueryData<FollowerInfo>([
        "follower-info",
        userId,
      ]);
      const prevSuggestions = queryClient.getQueryData<{
        suggestions: SuggestedFollower[];
      }>(["suggestions"]);

      if (buttonType === "profile") {
        queryClient.setQueryData<FollowerInfo>(
          ["follower-info", userId],
          (old) => {
            if (!old) return old;
            return {
              ...old,
              followers: Math.max(0, old.followers - 1),
              isFollowedByUser: false,
            };
          }
        );
      }

      queryClient.setQueryData<{ suggestions: SuggestedFollower[] }>(
        ["suggestions"],
        (old) => {
          if (!old?.suggestions) return old;
          return {
            ...old,
            suggestions: old.suggestions.map((user) =>
              user.id === userId
                ? {
                    ...user,
                    _count: {
                      followers: Math.max(0, user._count.followers - 1),
                    },
                    isFollowedByUser: false,
                  }
                : user
            ),
          };
        }
      );

      // Don't set isFollowed.current here - let the UI handle the optimistic update
      return { prevFollowerInfo, prevSuggestions };
    },
    onError: (error: any, _, context) => {
      if (context?.prevFollowerInfo) {
        queryClient.setQueryData(
          ["follower-info", userId],
          context.prevFollowerInfo
        );
      }
      if (context?.prevSuggestions) {
        queryClient.setQueryData(["suggestions"], context.prevSuggestions);
      }
      actionBeingPerformed.current = null;

      if (error?.status === 401) requireLogin();
      else toast.error("Failed to unfollow user. Please try again.");
    },
    onSuccess: () => {
      toast.success("Unfollowed successfully!");
      isFollowed.current = false;
      actionBeingPerformed.current = null;
      // queryClient.invalidateQueries({ queryKey: ["suggestions"] });
    },
  });


  const toogleFollow = (toogleType: FollowButtonToggleType) => {
    if (!session?.user?.accessToken) {
      return requireLogin();
    }
    if (toogleType === "profile") {
      if (query.data?.isFollowedByUser) {
        unfollowMutation.mutate();
      } else {
        followMutation.mutate();
      }
    }
    if (toogleType === "suggestion") {
      if (isFollowed.current) {
        unfollowMutation.mutate();
      } else {
        followMutation.mutate();
      }
    }
  };

  // For suggestions, we need to track the current action being performed
  const isCurrentlyFollowing =
    buttonType === "profile"
      ? query.data?.isFollowedByUser ?? false
      : isFollowed.current;

  return {
    toogleFollow,
    isFollowing: isCurrentlyFollowing,
    isPending: followMutation.isPending || unfollowMutation.isPending,
    actionBeingPerformed: actionBeingPerformed.current,
  };
}
