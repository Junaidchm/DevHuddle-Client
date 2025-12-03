"use server";

import { serverFetch } from "@/src/app/lib/serverFetch";
import { API_ROUTES } from "@/src/constants/api.routes";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export interface UpdatePostInput {
  content?: string;
  mediaIds?: string[];
  addAttachmentIds?: string[];
  removeAttachmentIds?: string[];
  visibility?: string;
  commentControl?: string;
}

export async function updatePost(
  postId: string,
  input: UpdatePostInput
) {
  try {
    // Generate idempotency key for duplicate prevention
    const idempotencyKey = crypto.randomUUID();

    const res = await serverFetch(API_ROUTES.FEED.EDIT_POST(postId), {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        content: input.content,
        addAttachmentIds: input.addAttachmentIds,
        removeAttachmentIds: input.removeAttachmentIds,
        visibility: input.visibility,
        commentControl: input.commentControl,
      }),
    });

    // Revalidate feed cache after post update
    revalidatePath("/feed");
    
    return { success: true, data: res };
  } catch (error: any) {
    // Return structured error
    return { 
      success: false, 
      error: error.message || "Failed to update post",
      message: "Failed to update post. Please try again.",
    };
  }
}

