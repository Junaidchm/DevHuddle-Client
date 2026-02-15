import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { createUploadSession, completeUpload } from "@/src/services/api/media.service";
import { uploadToS3 } from "@/src/lib/upload";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export function useMediaUpload() {
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const authHeaders = useAuthHeaders();
  const { data: session, update } = useSession();

  const uploadMedia = useMutation({
    mutationFn: async ({
      file,
      mediaType,
      caption,
    }: {
      file: File;
      mediaType: "CHAT_IMAGE" | "CHAT_VIDEO" | "CHAT_AUDIO" | "CHAT_FILE";
      caption?: string;
    }) => {
      // ✅ FIX: Validate auth headers before upload
      console.log("[useMediaUpload] Starting upload with auth headers:", {
        hasAuthorization: !!authHeaders.Authorization,
        hasSession: !!session,
        hasAccessToken: !!session?.user?.accessToken,
      });

      // If no auth token, try to refresh session first
      if (!authHeaders.Authorization) {
        console.warn("[useMediaUpload] No auth token found, attempting session refresh...");
        
        try {
          await update();
          
          // Check again after refresh
          const refreshedHeaders = useAuthHeaders();
          if (!refreshedHeaders.Authorization) {
            throw new Error("Authentication required. Please refresh the page and try again.");
          }
          
          console.log("[useMediaUpload] Session refreshed successfully");
        } catch (refreshError) {
          console.error("[useMediaUpload] Session refresh failed:", refreshError);
          throw new Error("Authentication failed. Please sign in again.");
        }
      }

      // Step 1: Create upload session
      console.log("[useMediaUpload] Creating upload session...");
      const uploadSession = await createUploadSession({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        mediaType,
      }, authHeaders);

      console.log("[useMediaUpload] Upload session created:", uploadSession.mediaId);

      // Step 2: Upload to S3
      console.log("[useMediaUpload] Uploading to S3...");
      await uploadToS3(uploadSession.uploadUrl, file, (progressEvent) => {
        setProgress({
          loaded: progressEvent.loaded,
          total: progressEvent.total || file.size,
          percentage: Math.round((progressEvent.loaded / (progressEvent.total || file.size)) * 100),
        });
      });

      console.log("[useMediaUpload] S3 upload complete");

      // Step 3: Complete upload
      console.log("[useMediaUpload] Completing upload...");
      const result = await completeUpload(uploadSession.mediaId, authHeaders);

      console.log("[useMediaUpload] Upload completed successfully:", result.mediaId);

      return {
        mediaId: result.mediaId,
        mediaUrl: result.cdnUrl,
        mediaType,
        fileName: file.name,
        fileSize: file.size,
        caption,
      };
    },
    onSuccess: () => {
      setProgress(null);
    },
    onError: (error) => {
      console.error("[useMediaUpload] Media upload failed:", error);
      setProgress(null);
    },
  });

  return {
    uploadMedia: uploadMedia.mutate,
    uploadMediaAsync: uploadMedia.mutateAsync,
    isUploading: uploadMedia.isPending,
    progress,
  };
}
