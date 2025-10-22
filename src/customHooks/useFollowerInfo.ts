// import { useSession } from "next-auth/react";
// import { FollowerInfo, SuggestedFollower } from "../app/types";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { getFollowerInfo } from "../services/api/profile.service";
// import { followUser } from "../services/api/follow.service";
// import toast from "react-hot-toast";
// import { useRouter } from "next/navigation";
// import {  useRef, useState } from "react";
// import { current } from "@reduxjs/toolkit";

// type FollowButtonToogleType = "suggession" | "profile";

// interface UseFollowerInfoOptions {
//   userId: string;
//   initialData?: FollowerInfo;
//   buttonType?: FollowButtonToogleType;
// }

// export function useFollowerInfo({
//   userId,
//   initialData,
//   buttonType,
// }: UseFollowerInfoOptions): {
//   toogleFollow: (toogleType: FollowButtonToogleType) => void;
//   isFollowing: boolean;
//   isPending: boolean;
// } {
//   const { data: session } = useSession();
//   const router = useRouter();
//   const queryClient = useQueryClient();

//   // foollowed unfollowed
//   const isFollowed = useRef(false);

//   const query = useQuery({
//     queryKey: ["follower-info", userId],
//     queryFn: () => getFollowerInfo(userId),
//     initialData,
//     staleTime: Infinity,
//     retry: (failureCount, error: any) => {
//       if (error?.status === 401) return false;
//       return failureCount < 2;
//     },
//     enabled: !!session?.user?.accessToken,
//   });

//   const followMutation = useMutation({
//     mutationFn: () => followUser(userId),
//     onMutate: async () => {
//       if (buttonType === "profile") {
//         await queryClient.cancelQueries({
//           queryKey: ["follower-info", userId],
//         });

//         // Snapshot previous value
//         const previousData = queryClient.getQueryData<FollowerInfo>([
//           "follower-info",
//           userId,
//         ]);

//         // Optimistically update
//         queryClient.setQueryData<FollowerInfo>(
//           ["follower-info", userId],
//           (old) => {
//             if (!old) return old;
//             return {
//               ...old,
//               followers: old.followers + 1,
//               isFollowedByUser: true,
//             };
//           }
//         );

//         return { previousData };
//       }
//       if (buttonType === "suggession") {
//         await queryClient.cancelQueries({ queryKey: ["suggestions"] });
//         const previousData = queryClient.getQueryData<{ suggestions: SuggestedFollower[] }>(["suggestions"]);
//         queryClient.setQueryData(
//           ["suggestions"],
//           (old: SuggestedFollower[]) => {
//             if (!old?.) return old;
//             return old.map()
//           }
//         );
//         isFollowed.current = true;
//       }
//     },
//     onError: (error: any, variables, context) => {
//       if (context?.previousData) {
//         queryClient.setQueryData(
//           ["follower-info", userId],
//           context.previousData
//         );
//       }

//       isFollowed.current = false;

//       // Handle specific error cases
//       if (error?.status === 401) {
//         toast.error("Please sign in to follow users");
//         router.push("/signIn");
//       } else if (error?.status === 403) {
//         toast.error("You cannot follow this user");
//       } else {
//         toast.error("Failed to follow user. Please try again.");
//       }
//     },
//     onSuccess: () => {
//       toast.success("Successfully followed user!");
//       isFollowed.current = true;
//       // Invalidate related queries
//       // queryClient.invalidateQueries({ queryKey: ["follower-info", userId] });
//       queryClient.invalidateQueries({ queryKey: ["suggestions"] });
//     },
//   });

//   const unfollowMutation = useMutation({});

//   const toogleFollow = (toogleType: FollowButtonToogleType) => {
//     if (!session?.user?.accessToken) {
//       toast.error("Please sign in to follow users");
//       router.push("/signIn");
//       return;
//     }
//     if (toogleType === "profile") {
//       if (query.data?.isFollowedByUser) {
//         unfollowMutation.mutate();
//       } else {
//         followMutation.mutate();
//       }
//     }
//     if (toogleType === "suggession") {
//       if (isFollowed.current) {
//         unfollowMutation.mutate();
//       } else {
//         followMutation.mutate();
//       }
//     }
//   };

//   return {
//     // Actions
//     toogleFollow,
//     isFollowing:
//       buttonType === "profile"
//         ? query.data?.isFollowedByUser ?? false
//         : isFollowed.current,
//     // Loading states
//     isPending: followMutation.isPending || unfollowMutation.isPending,
//   };
// }

import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useRef } from "react";
import { followUser, unfollowUser } from "../services/api/follow.service";
import { getFollowerInfo } from "../services/api/profile.service";
import type { FollowerInfo, SuggestedFollower } from "../app/types";

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
  const router = useRouter();
  const queryClient = useQueryClient();
  const isFollowed = useRef(initialData?.isFollowedByUser ?? false);
  const actionBeingPerformed = useRef<'follow' | 'unfollow' | null>(null);

  const query = useQuery({
    queryKey: ["follower-info", userId],
    queryFn: () => getFollowerInfo(userId),
    initialData,
    staleTime: Infinity,
    enabled: !!session?.user?.accessToken,
  });

  const requireLogin = () => {
    toast.error("Please sign in to perform this action");
    router.push("/signIn");
    return false;
  };

  const followMutation = useMutation({
    mutationFn: () => followUser(userId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["follower-info", userId] });
      await queryClient.cancelQueries({ queryKey: ["suggestions"] });

      console.log("the following mutation is working without error ===");
      actionBeingPerformed.current = 'follow';

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
              followers: old.followers + 1,
              isFollowedByUser: true,
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
                    _count: { followers: user._count.followers + 1 },
                    isFollowedByUser: true,
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
      else toast.error("Failed to follow user. Please try again.");
    },
    onSuccess: () => {
      toast.success("Followed successfully!");
      isFollowed.current = true;
      actionBeingPerformed.current = null;
      // queryClient.invalidateQueries({ queryKey: ["suggestions"] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => unfollowUser(userId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["follower-info", userId] });
      await queryClient.cancelQueries({ queryKey: ["suggestions"] });

      actionBeingPerformed.current = 'unfollow';

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

  // const toggleFollow = () => {
  //   if (!session?.user?.accessToken) return requireLogin();

  //   if(buttonType === "profile") {

  //   }

  //   // const currentFollowState =
  //   //   buttonType === "profile" ? query.data?.isFollowedByUser : isFollowed.current;

  //   // if (currentFollowState) unfollowMutation.mutate();
  //   // else followMutation.mutate();
  // };

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
  const isCurrentlyFollowing = buttonType === "profile" 
    ? query.data?.isFollowedByUser ?? false
    : isFollowed.current;

  return {
    toogleFollow,
    isFollowing: isCurrentlyFollowing,
    isPending: followMutation.isPending || unfollowMutation.isPending,
    actionBeingPerformed: actionBeingPerformed.current,
  };
}
