"use client";

import { useMutation } from "@tanstack/react-query";
import { sendPost } from "@/src/services/api/engagement.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

/**
 * Hook for sending posts to connections
 * LinkedIn-style: sends post as a message/notification to selected users
 */
export function useSendPost() {
  const authHeaders = useAuthHeaders();

  return useMutation({
    mutationFn: async ({
      postId,
      recipientIds,
      message,
    }: {
      postId: string;
      recipientIds: string[];
      message?: string;
    }) => {
      const idempotencyKey = uuidv4();
      try {
        const result = await sendPost(
          postId,
          recipientIds,
          message,
          authHeaders,
          idempotencyKey
        );
        return result;
      } catch (error: any) {
        // Extract detailed error message from various possible locations
        const errorMessage = 
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          error?.response?.statusText ||
          "Failed to send post. Please try again.";
        
        console.error("[useSendPost] Error sending post:", {
          error,
          postId,
          recipientIds,
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          data: error?.response?.data,
        });
        
        // Create error with detailed message and preserve original error for debugging
        const detailedError = new Error(errorMessage);
        (detailedError as any).originalError = error;
        (detailedError as any).status = error?.response?.status;
        (detailedError as any).response = error?.response;
        throw detailedError;
      }
    },
    onSuccess: (_, variables) => {
      const count = variables.recipientIds.length;
      toast.success(
        `Post sent to ${count} ${count === 1 ? "connection" : "connections"}!`,
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
      // Extract error message - check multiple sources
      const errorMessage = 
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to send post. Please try again.";
      
      console.error("[useSendPost] onError:", {
        error,
        message: errorMessage,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      
      // Show toast error with higher z-index to appear above modal
      // Note: Modal has z-index 9999, toast needs to be higher or we rely on modal error display
      toast.error(errorMessage, {
        position: "top-center",
        duration: 5000,
        style: {
          zIndex: 10002, // Higher than modal (9999) to ensure visibility
          backgroundColor: "#fee2e2",
          color: "#991b1b",
        },
      });
    },
  });
}

