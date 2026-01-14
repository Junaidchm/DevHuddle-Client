"use server";

import { serverFetch } from "@/src/app/lib/serverFetch";
import { createPostSchema } from "@/src/app/lib/validation";
import { API_ROUTES } from "@/src/constants/api.routes";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function submitPost(input: {
  content: string;
  mediaIds: string[];
  visibility?: string;
  commentControl?: string;
}) {
  try {
    // FIXED P0-8: Validate input with updated schema
    const validated = createPostSchema.parse({
      content: input.content,
      mediaIds: input.mediaIds,
      visibility: input.visibility || "PUBLIC",
      commentControl: input.commentControl || "ANYONE",
    });

    // FIXED P0-4: Generate idempotency key for duplicate prevention
    const idempotencyKey = crypto.randomUUID();

    const res = await serverFetch(API_ROUTES.FEED.SUBMIT, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey, // FIXED P0-4: Add idempotency key
      },
      body: JSON.stringify({
        content: validated.content,
        mediaIds: validated.mediaIds,
        visibility: validated.visibility, // FIXED P0-2: Include visibility
        commentControl: validated.commentControl, // FIXED P0-2: Include commentControl
      }),
    });

    // FIXED P0-9: Revalidate feed cache after post creation
    revalidatePath("/feed");
    
    return { success: true, data: res };
  } catch (error: any) {
    // FIXED P0-9: Better error handling with structured errors
    if (error.name === "ZodError") {
      return { 
        success: false, 
        errors: error.flatten().fieldErrors,
        message: "Validation failed",
      };
    }
    
    // FIXED P0-11: Remove console.error, return structured error
    return { 
      success: false, 
      error: error.message || "Failed to create post",
      message: "Failed to create post. Please try again.",
    };
  }
}
