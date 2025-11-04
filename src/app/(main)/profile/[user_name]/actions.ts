"use server";

import { api } from "@/src/app/lib/ky";
import { UserProfile } from "@/src/types/user.type";
import { HTTPError } from "ky";

export async function fetchProfileByUsernameAction(
  username: string
): Promise<UserProfile | null> {
  try {
    const profile = await api.get(`users/profile/${username}`).json<UserProfile>();
    return profile;
  } catch (error) {
    if (error instanceof HTTPError && error.response.status === 404) {
      return null;
    }
    console.error(`Error fetching profile for ${username}:`, error);
    return null; // Or re-throw the error depending on desired behavior
  }
}