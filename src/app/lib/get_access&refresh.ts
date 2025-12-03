"use server";

import { auth } from "@/auth";
import { cookies } from "next/headers";

const API_URL = process.env.API_URL || "http://localhost:8000";

/**
 * ✅ FIXED: Server action for getting access and refresh tokens
 * 
 * Now uses proper NextAuth auth() function instead of non-existent getSession
 */
export async function get_access_refresh(): Promise<{
  access_token: string;
  refresh_token: string;
}> {
  const session = await auth();

  console.log("this is the session details -------------------------", session);
  if (session.needsRefresh) {
    const refreshRes = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!refreshRes.ok) {
      throw new Error("Session expired");
    }

    const { accessToken } = await refreshRes.json();
    if (!accessToken) {
      
      throw new Error("No access token after refresh");
    }
  }

  const cookieStore = await cookies();

  const access_token = cookieStore.get("access_token")?.value ?? "";
  const refresh_token = cookieStore.get("refresh_token")?.value ?? "";


  return { access_token, refresh_token };
}
