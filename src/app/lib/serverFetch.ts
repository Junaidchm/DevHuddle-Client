// src/lib/serverFetch.ts
"use server"

import { auth } from "@/auth";
import { getApiBaseUrl } from "@/src/constants/api.routes";

export async function serverFetch(
  url: string,
  options: RequestInit = {}
) {
  const session = await auth();

  if (!session?.user?.accessToken) {
    throw new Error("Unauthorized: No access token available");
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${session.user.accessToken}`,
    "Content-Type": "application/json",
  };

  const res = await fetch(`${getApiBaseUrl()}${url}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  return await res.json();
}

/**
 * Server fetch without authentication (for cron jobs, webhooks, etc.)
 */
export async function serverFetchSilent(
  url: string,
  options: RequestInit = {}
) {
  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
  };

  const res = await fetch(`${getApiBaseUrl()}${url}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  return res;
}
