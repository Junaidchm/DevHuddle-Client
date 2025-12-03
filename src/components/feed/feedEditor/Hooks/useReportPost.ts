"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reportPost } from "@/src/services/api/engagement.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

export type ReportReason =
  | "SPAM"
  | "INAPPROPRIATE"
  | "HARASSMENT"
  | "HATE_SPEECH"
  | "VIOLENCE"
  | "SELF_HARM"
  | "FALSE_INFORMATION"
  | "COPYRIGHT_VIOLATION"
  | "OTHER";

/**
 * Hook for reporting posts
 */
export function useReportPost() {
  const queryClient = useQueryClient();
  const authHeaders = useAuthHeaders();

  return useMutation({
    mutationFn: async ({
      postId,
      reason,
      description,
    }: {
      postId: string;
      reason: ReportReason;
      description?: string;
    }) => {
      const idempotencyKey = uuidv4();
      return await reportPost(
        postId,
        reason,
        authHeaders,
        description,
        idempotencyKey
      );
    },
    onSuccess: () => {
      toast.success("Post reported successfully. Thank you for keeping our community safe.");
    },
    onError: (error: any) => {
      // ✅ FIX: Extract more detailed error messages
      const errorMessage = 
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to report post";
      
      // ✅ FIX: Handle specific error cases
      if (errorMessage.includes("limit") || errorMessage.includes("exceeded")) {
        toast.error("You've reached the daily report limit. Please try again tomorrow.");
      } else if (errorMessage.includes("already reported")) {
        toast.error("You have already reported this post.");
      } else if (error.response?.status === 401) {
        // Don't show "Session expired" for report errors - handled by interceptor
        toast.error("Unable to report post. Please try again.");
      } else {
        toast.error(errorMessage);
      }
    },
  });
}

