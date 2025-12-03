"use client";

import { useMutation } from "@tanstack/react-query";
import { getPostShareLink } from "@/src/services/api/engagement.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import toast from "react-hot-toast";

/**
 * Hook for copying post link to clipboard
 * LinkedIn-style: Generates canonical URL or short URL, copies to clipboard
 */
export function useCopyPostLink() {
  const authHeaders = useAuthHeaders();

  return useMutation({
    mutationFn: async ({
      postId,
      generateShort = false,
    }: {
      postId: string;
      generateShort?: boolean;
    }) => {
      // ✅ FIX: Try to get share link from API, fallback to canonical URL
      try {
        const response = await getPostShareLink(
          postId,
          authHeaders,
          { generateShort }
        );
        return response.data;
      } catch (error: any) {
        // ✅ FIX: Fallback to canonical URL if API fails
        // This ensures copy link always works, even if API is down
        const baseUrl = typeof window !== "undefined" 
          ? window.location.origin 
          : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const canonicalUrl = `${baseUrl}/posts/${postId}`;
        
        // Return fallback URL
        return {
          canonicalUrl,
          shortUrl: undefined,
        };
      }
    },
    onSuccess: async (data) => {
      try {
        // ✅ FIX: Use shortUrl if available, otherwise canonicalUrl
        const urlToCopy = data.shortUrl || data.canonicalUrl;
        
        if (!urlToCopy) {
          throw new Error("No URL available to copy");
        }
        
        // ✅ FIX: Use navigator.clipboard.writeText (LinkedIn-style)
        await navigator.clipboard.writeText(urlToCopy);
        toast.success("Link copied to clipboard!");
      } catch (error: any) {
        // ✅ FIX: Fallback for browsers without clipboard API
        if (error.name === "NotAllowedError" || error.name === "SecurityError") {
          toast.error("Please allow clipboard access to copy the link.");
        } else {
          toast.error("Failed to copy link. Please try again.");
        }
      }
    },
    onError: (error: any) => {
      // ✅ FIX: Don't show error if we have a fallback URL
      // The mutationFn already handles fallback, so errors here are rare
      const errorMessage = error.message || "Failed to generate share link";
      if (!errorMessage.includes("fallback")) {
        toast.error(errorMessage);
      }
    },
  });
}

