"use server";

import { auth } from "@/auth";
import { FollowerInfo } from "@/src/app/types";
import { redirect } from "next/navigation";
import { api } from "@/src/app/lib/ky";



interface SuggestedFollower {
  id: string;
  username: string;
  name: string;
  profilePicture: string | null;
  _count: {
    followers: number;
  };
}

/**
 * Server action to fetch follower info for a user
 * Used for preloading data in server components
 */
export async function getFollowerInfoAction(userId: string): Promise<FollowerInfo | null> {
  try {
    const session = await auth();
    
    if (!session?.user?.accessToken) {
      return null;
    }

    const data = await api.get(`auth/${userId}/followers`, {
      // Add cache control for better performance
      next: { revalidate: 60 }, // Revalidate every minute
    }).json<FollowerInfo>();

    return data;
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
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
        const data = await api.get(`auth/${userId}/followers`, {
          next: { revalidate: 60 },
        }).json<FollowerInfo>();

        return { userId, data };
      } catch (error) {
        if (error instanceof Error && error.message === 'UNAUTHORIZED') {
          throw error; // Re-throw to be handled by outer catch
        }
        console.error(`getMultipleFollowerInfoAction failed for user ${userId}:`, error);
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
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
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


    console.log('the request for suggested mutation is working without error ==========================================>')

    // Fetch suggestions
    const suggestions = await api.get(`users/follows/suggestions?limit=${limit}`).json<SuggestedFollower[]>();
    
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      return { suggestions: [], followerInfoMap: {} };
    }

    return {
      suggestions,
    };
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      redirect("/signIn");
    }
    console.error("getSuggestedUsersWithFollowerInfo failed:", error);
    return { suggestions: [], followerInfoMap: {} };
  }
}
