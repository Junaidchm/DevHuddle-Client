
"use server";

import { serverFetchSilent } from "@/src/app/lib/auth";
import { serverFetch } from "@/src/app/lib/serverFetch";
import { createPostSchema } from "@/src/app/lib/validation";

export async function submitPost(input: {
  content: string;
  mediaIds: string[];
}) {
  try {
    console.log('submitPost is working =======================================', input);
    const { content,mediaIds } = createPostSchema.parse(input);

    const res = await serverFetch("/feed/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content:input.content,
        mediaIds:input.mediaIds,
      }),
    });

    

  } catch (error) {
    console.error("Error in submitPost:", error);
    throw error; // Rethrow to handle in onSubmit
  }
}