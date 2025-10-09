// lib/api.ts

import { auth } from "@/auth";

const baseUrl = process.env.API_GATEWAY || "http://localhost:8080";

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T | null> {
  const session = await auth();
  if (!session?.user?.accessToken) return null;

   let response = await fetch(`${process.env.API_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${session.user.accessToken}`,
    },
  });

  const data = await response.json();

  return data
}
