"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reportPost, reportComment } from "@/src/services/api/engagement.service";
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
 * Hook for reporting posts or comments
 */
export function useReportPost() {
  const queryClient = useQueryClient();
  const authHeaders = useAuthHeaders();

  return useMutation({
    mutationFn: async ({
      targetId,
      targetType,
      reason,
      description,
    }: {
      targetId: string;
      targetType: "POST" | "COMMENT";
      reason: ReportReason;
      description?: string;
    }) => {
      const idempotencyKey = uuidv4();
      
      if (targetType === "POST") {
        return await reportPost(
          targetId,
          reason,
          authHeaders,
          description,
          idempotencyKey
        );
      } else {
        return await reportComment(
          targetId,
          reason,
          authHeaders,
          description,
          idempotencyKey
        );
      }
    },
    onSuccess: (_, variables) => {
      const label = variables.targetType === "POST" ? "Post" : "Comment";
      toast.success(`${label} reported successfully. Thank you for keeping our community safe.`);
    },
    onError: (error: any, variables) => {
      const label = variables.targetType === "POST" ? "post" : "comment";
      // ✅ FIX: Extract more detailed error messages
      const errorMessage = 
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        `Failed to report ${label}`;
      
      // ✅ FIX: Handle specific error cases
      if (errorMessage.includes("limit") || errorMessage.includes("exceeded")) {
        toast.error("You've reached the daily report limit. Please try again tomorrow.");
      } else if (errorMessage.includes("already reported")) {
        toast.error(`You have already reported this ${label}.`);
      } else if (errorMessage.includes("own")) {
        toast.error(`You cannot report your own ${label}.`);
      } else if (error.response?.status === 401) {
        toast.error(`Unable to report ${label}. Please try again.`);
      } else {
        toast.error(errorMessage);
      }
    },
  });
}

