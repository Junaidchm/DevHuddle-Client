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
      const errorMessage = 
        error.response?.data?.message ||
        error.message ||
        `Failed to report ${label}`;
      
      // Handle known error patterns with cleaner toasts
      if (errorMessage.toLowerCase().includes("limit") || errorMessage.toLowerCase().includes("exceeded")) {
        toast.error(errorMessage);
      } else if (errorMessage.toLowerCase().includes("already reported")) {
        toast.error(`You have already reported this ${label}.`);
      } else if (errorMessage.toLowerCase().includes("own")) {
        toast.error(`You cannot report your own ${label}.`);
      } else {
        toast.error(errorMessage);
      }
    },
  });
}

