"use server";

import { api, stripLeadingSlash } from "@/src/app/lib/ky";
import { UserProfile } from "@/src/types/user.type";
import { HTTPError } from "ky";
import { API_ROUTES } from "@/src/constants/api.routes";

export async function fetchProfileByUsernameAction(
  username: string
): Promise<UserProfile | null> {
  try {
    const route = stripLeadingSlash(API_ROUTES.USERS.PROFILE_BY_USERNAME(username));
    const profile = await api.get(route).json<UserProfile>();
    return profile;
  } catch (error) {
    if (error instanceof HTTPError && error.response.status === 404) {
      return null;
    }
    console.error(`Error fetching profile for ${username}:`, error);
    return null; // Or re-throw the error depending on desired behavior
  }
}