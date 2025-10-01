"use server";

import { serverFetchSilent } from "@/src/app/lib/auth";
import { serverFetch } from "@/src/app/lib/serverFetch";

export async function deletePost(Id: string) {
  try {
    const res = await serverFetch("/feed/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Id,
      }),
    });


    return res.deletedPost;
  } catch (error) {
    console.error("Error in DeletePost:", error);
    throw error;
  }
}
