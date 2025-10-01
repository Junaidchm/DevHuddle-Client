// src/lib/serverFetch.ts
"use server"

import { auth } from "@/auth";

export async function serverFetch(
  url: string,
  options: RequestInit = {}
) {
  const session = await auth();

  console.log('this is the user in the function ----------------->' , session?.user)

  if (!session?.user?.accessToken) {
    throw new Error("Unauthorized: No access token available");
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${session.user.accessToken}`,
    "Content-Type": "application/json",
  };

  const res = await fetch(`${process.env.LOCAL_APIGATEWAY_URL}${url}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  return await res.json();
}
