import { z } from "zod";

// ✅ FIXED P0-8: Allow empty content if media exists
export const createPostSchema = z.object({
  content: z.string().trim().optional().default(""),
  mediaIds: z.array(z.string().uuid("Invalid media ID format")).max(5, "Cannot have more than 5 attachments"),
  visibility: z.enum(["PUBLIC", "VISIBILITY_CONNECTIONS", "CONNECTIONS"]).optional().default("PUBLIC"),
  commentControl: z.enum(["ANYONE", "CONNECTIONS", "NOBODY"]).optional().default("ANYONE"),
  mediaTags: z.array(z.object({
    mediaId: z.string().uuid("Invalid media ID format"),
    userIds: z.array(z.string().uuid("Invalid user ID format"))
  })).optional().default([]),
}).refine(
  (data) => {
    // Post must have either content or media
    const hasContent = data.content && data.content.trim().length > 0;
    const hasMedia = data.mediaIds && data.mediaIds.length > 0;
    return hasContent || hasMedia;
  },
  {
    message: "Post must have either content or media",
    path: ["content"],
  }
);
