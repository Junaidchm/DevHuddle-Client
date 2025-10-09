"use server";

import { auth } from "@/auth"; // Your NextAuth instance
import serverKy from "@/src/app/lib/ky";
import { redirect } from "next/navigation";

interface SuggestedFollower {
  id: string;
  username: string;
  name: string;
  profilePicture: string | null;
  _count: {
    followers: number;
  };
}


export const getSuggestedFollowers = async (limit: number = 5) => {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.accessToken) {
      throw new Error("Unauthorized");
    }

    const response = await serverKy
      .get(`users/follows/suggestions?limit=${limit}`)
      .json<SuggestedFollower[]>();

      console.log('this is the return data ============================-------------------->' , response )

    return { data: response };
  } catch (error) {
    // Ky throws on non-OK status, so handle here
    if (
      error instanceof Error &&
      "status" in error &&
      (error as any).status === 401
    ) {
      throw new Error("Unauthorized");
    }
    console.error("Error in getSuggestedFollowers:", error);
    throw new Error("Failed to fetch suggestions"); // Re-throw for component handling
  }
};
