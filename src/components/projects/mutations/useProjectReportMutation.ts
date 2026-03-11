"use client";

import { useMutation } from "@tanstack/react-query";
import { reportProject, reportProjectComment } from "@/src/services/api/project.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import toast from "react-hot-toast";

export type ProjectReportReason =
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
 * Hook for reporting projects or project comments
 */
export function useProjectReportMutation() {
  const authHeaders = useAuthHeaders();

  return useMutation({
    mutationFn: async ({
      targetId,
      targetType,
      reason,
      description,
    }: {
      targetId: string;
      targetType: "PROJECT" | "COMMENT";
      reason: ProjectReportReason;
      description?: string;
    }) => {
      if (targetType === "PROJECT") {
        return await reportProject(targetId, reason, { description }, authHeaders);
      } else {
        return await reportProjectComment(targetId, reason, authHeaders);
      }
    },
    onSuccess: (_, variables) => {
      const label = variables.targetType === "PROJECT" ? "Project" : "Comment";
      toast.success(`${label} reported successfully.`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to report item");
    },
  });
}
