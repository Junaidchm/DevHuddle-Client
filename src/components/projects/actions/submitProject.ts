"use server";

import { serverFetch } from "@/src/app/lib/serverFetch";
import { API_ROUTES } from "@/src/constants/api.routes";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export interface SubmitProjectInput {
  title: string;
  description: string;
  repositoryUrls?: string[];
  demoUrl?: string;
  techStack?: string[];
  tags?: string[];
  visibility?: string;
  mediaIds?: string[];
}

export async function submitProject(input: SubmitProjectInput) {
  try {
    // Validation
    if (!input.title || input.title.length < 3 || input.title.length > 200) {
      return {
        success: false,
        message: "Title must be 3-200 characters",
      };
    }

    if (!input.description || input.description.length === 0) {
      return {
        success: false,
        message: "Description is required",
      };
    }

    if (input.description.length > 10000) {
      return {
        success: false,
        message: "Description too long (max 10000 characters)",
      };
    }

    // Generate idempotency key
    const idempotencyKey = crypto.randomUUID();

    const res = await serverFetch(API_ROUTES.PROJECTS.CREATE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        title: input.title,
        description: input.description,
        repositoryUrls: input.repositoryUrls || [],
        demoUrl: input.demoUrl,
        techStack: input.techStack || [],
        tags: input.tags || [],
        visibility: input.visibility || "PUBLIC",
        mediaIds: input.mediaIds || [],
      }),
    });

    // Revalidate projects cache
    revalidatePath("/projects");

    return { success: true, data: res };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to create project",
      message: "Failed to create project. Please try again.",
    };
  }
}

