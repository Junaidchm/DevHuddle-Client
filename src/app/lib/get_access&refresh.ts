"use server";

import { getSession } from "@/src/app/lib/auth";
import { cookies } from "next/headers";

const API_URL = process.env.API_URL || "http://localhost:8000";

export async function get_access_refresh(): Promise<{
  access_token: string;
  refresh_token: string;
}> {
  const session = await getSession();

  console.log("this is the session details -------------------------", session);
  if (session.needsRefresh) {
    const refreshRes = await fetch(`${API_URL}/api/auth/refresh-token`, {
      method: "GET",
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
