"use client";

import { useMutation } from "@tanstack/react-query";
import { sendProject } from "@/src/services/api/project.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import toast from "react-hot-toast";

/**
 * Hook for sending projects to connections
 * LinkedIn-style: sends project as a message/notification to selected users
 */
export function useSendProject() {
  const authHeaders = useAuthHeaders();

  return useMutation({
    mutationFn: async ({
      projectId,
      recipientIds,
      message,
    }: {
      projectId: string;
      recipientIds: string[];
      message?: string;
    }) => {
      try {
        const result = await sendProject(
          projectId,
          { recipientIds, message },
          authHeaders
        );
        return result;
      } catch (error: any) {
        const errorMessage = 
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          error?.response?.statusText ||
          "Failed to send project. Please try again.";
        
        console.error("[useSendProject] Error sending project:", {
          error,
          projectId,
          recipientIds,
          status: error?.response?.status,
        });
        
        const detailedError = new Error(errorMessage);
        (detailedError as any).originalError = error;
        throw detailedError;
      }
    },
    onSuccess: (_, variables) => {
      const count = variables.recipientIds.length;
      toast.success(
        `Project sent to ${count} ${count === 1 ? "connection" : "connections"}!`,
        {
          position: "top-center",
          duration: 3000,
          style: {
            zIndex: 10001,
          },
        }
      );
    },
    onError: (error: any) => {
      const errorMessage = 
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to send project. Please try again.";
      
      console.error("[useSendProject] onError:", {
        error,
        message: errorMessage,
      });
      
      toast.error(errorMessage, {
        position: "top-center",
        duration: 5000,
        style: {
          zIndex: 10002, 
          backgroundColor: "#fee2e2",
          color: "#991b1b",
        },
      });
    },
  });
}
