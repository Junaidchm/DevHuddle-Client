"use server";

import { serverFetchSilent } from "@/src/app/lib/auth";

export async function deletePost(Id: string) {
  try {
    const res = await serverFetchSilent("/feed/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Id,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to DELETE post: ${res.statusText}`);
    }

    const response = await res.json();

    return response.deletedPost;
  } catch (error) {
    console.error("Error in DeletePost:", error);
    throw error;
  }
}
