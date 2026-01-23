"use server";

import { auth } from "@/auth";
import { FollowerInfo } from "@/src/app/types";
import { redirect } from "next/navigation";
import { api, stripLeadingSlash } from "@/src/app/lib/ky";
import { authCheckRedirectToSignin } from "../lib/authCheck";
import { revalidatePath } from "next/cache";
import { API_ROUTES } from "@/src/constants/api.routes";

interface SuggestedFollower {
  id: string;
  username: string;
  name: string;
  profilePicture: string | null;
  // _count: {
  //   followers: number;
  // };
  followersCount:number;
  isFollowedByUser:boolean;
}

/**
 * Server action to fetch follower info for a user
 * Used for preloading data in server components
 */
export async function getFollowerInfoAction(
  userId: string
): Promise<FollowerInfo | null> {
  try {
    const session = await auth();

    if (!session?.user?.accessToken) {
      return null;
    }

    const data = await api
      .get(stripLeadingSlash(API_ROUTES.FOLLOWS.FOLLOWERS_INFO(userId)), {
        // Add cache control for better performance
        next: { revalidate: 60 }, // Revalidate every minute
      })
      .json<FollowerInfo>();

    return data;
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      redirect("/signIn");
    }
    console.error("getFollowerInfoAction failed:", error);
    return null;
  }
}

/**
 * Server action to fetch follower info for multiple users
 * Used for preloading data in lists (e.g., suggestions)
 */
export async function getMultipleFollowerInfoAction(
  userIds: string[]
): Promise<Record<string, FollowerInfo>> {
  try {
    const session = await auth();

    if (!session?.user?.accessToken || userIds.length === 0) {
      return {};
    }

    // Fetch all follower info in parallel
    const promises = userIds.map(async (userId) => {
      try {
        const data = await api
          .get(stripLeadingSlash(API_ROUTES.FOLLOWS.FOLLOWERS_INFO(userId)), {
            next: { revalidate: 60 },
          })
          .json<FollowerInfo>();

        return { userId, data };
      } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
          throw error; // Re-throw to be handled by outer catch
        }
        console.error(
          `getMultipleFollowerInfoAction failed for user ${userId}:`,
          error
        );
        return { userId, data: null };
      }
    });

    const results = await Promise.all(promises);

    // Convert array to object
    const followerInfoMap: Record<string, FollowerInfo> = {};
    results.forEach(({ userId, data }) => {
      if (data) {
        followerInfoMap[userId] = data;
      }
    });

    return followerInfoMap;
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      redirect("/signIn");
    }
    console.error("getMultipleFollowerInfoAction failed:", error);
    return {};
  }
}

/**
 * Server action to get suggested users with their follower info
 * Combines suggestions API with follower info for complete data
 */
export async function getSuggestedUsersWithFollowerInfo(limit: number = 5) {
  try {
    const session = await auth();

    if (!session?.user?.accessToken) {
      return { suggestions: [], followerInfoMap: {} };
    }

    console.log(
      "the request for suggested mutation is working without error ==========================================>"
    );

    // Fetch suggestions
    const suggestions = await api
      .get(`${stripLeadingSlash(API_ROUTES.USERS.CHAT_SUGGESTIONS)}?limit=${limit}`)
      .json<SuggestedFollower[]>();

    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      return { suggestions: [], followerInfoMap: {} };
    }

    return {
      suggestions,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      redirect("/signIn");
    }
    console.error("getSuggestedUsersWithFollowerInfo failed:", error);
    return { suggestions: [], followerInfoMap: {} };
  }
}

/**
 * Server action to follow a user
 * Replaces client-side followUser API call with secure server-side implementation
 */

export async function followUserAction(targetUserId: string) {
  try {
    const session = await authCheckRedirectToSignin();

    if (!targetUserId || typeof targetUserId !== "string") {
      return {
        success: false,
        message: "Invalid user ID",
        error: "INVALID_INPUT",
      };
    }

    if (session.user.id === targetUserId) {
      return {
        success: false,
        message: "You cannot follow yourself",
        error: "SELF_FOLLOW_NOT_ALLOWED",
      };
    }
   console.log('the request is going for follow ---------------------------------> ')
    const response = await api
      .post(stripLeadingSlash(API_ROUTES.FOLLOWS.FOLLOW), {
        json: { targetUserId },
      })
      .json<{ data: { followingCount?: number } }>();

      console.log('this is the response for follow  comming ------------------------------------------> ', response)

    // Cache revalidation
    // revalidatePath(`/profile/${targetUserId}`);
    // revalidatePath(`/profile/${session.user.id}`);

    // Success logging
    console.log(
      `[followUserAction] Success: ${session.user.id} → ${targetUserId} `
    );

    return {
      success: true,
      message: "Successfully followed user",
      data: {
        userId: targetUserId,
        isFollowing: true,
        followerCount: response.data.followingCount,
      },
    };
  } catch (error: any) {
    console.error(`[followUserAction] Error for ${targetUserId}:`, {
      message: error.message,
      status: error?.response?.status,
    });

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      redirect("/signIn");
    }

    if (error?.response?.status === 409) {
      return {
        success: false,
        message: "You are already following this user",
        error: "ALREADY_FOLLOWING",
      };
    }

    if (error?.response?.status === 404) {
      return {
        success: false,
        message: "User not found",
        error: "USER_NOT_FOUND",
      };
    }

    return {
      success: false,
      message: "Failed to follow user. Please try again.",
      error: "FOLLOW_FAILED",
    };
  }
}
