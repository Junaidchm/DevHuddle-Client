import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
      // Step 1: Create upload session
      const session = await createUploadSession({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        mediaType,
      }, authHeaders);

      // Step 2: Upload to S3
      await uploadToS3(session.uploadUrl, file, (progressEvent) => {
        setProgress({
          loaded: progressEvent.loaded,
          total: progressEvent.total || file.size,
          percentage: Math.round((progressEvent.loaded / (progressEvent.total || file.size)) * 100),
        });
      });

      // Step 3: Complete upload
      const result = await completeUpload(session.mediaId, authHeaders);

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
      console.error("Media upload failed:", error);
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
