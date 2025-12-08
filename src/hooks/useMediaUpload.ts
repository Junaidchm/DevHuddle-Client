
import { useState, useCallback, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  createUploadSession,
  uploadFileToR2,
  completeUpload,
  MediaType,
} from "@/src/services/api/media.service";
import { Media } from "@/src/app/types/feed";
import { default_ImageTransform } from "@/src/constents/feed";

export interface UploadedMediaResult {
  mediaId: string;
  cdnUrl: string;
  file: File;
  type: MediaType;
}

export interface UseMediaUploadReturn {
  uploadFiles: (files: File[]) => Promise<Media[]>;
  isUploading: boolean;
  progress: number;
  reset: () => void;
  cancel: () => void;
}

/**
 * ✅ INDUSTRIAL STANDARD Media Upload Hook
 * 
 * Features:
 * 1. **Parallel Uploads**: Processes 3 files concurrently for maximum speed.
 * 2. **Retry Logic**: Automatically retries failed uploads up to 3 times (exponential backoff handled in service).
 * 3. **Cancellation**: Supports aborting uploads mid-way.
 * 4. **Graceful Error Handling**: Continues uploading partially successful batches.
 */
export const useMediaUpload = (): UseMediaUploadReturn => {
  const { data: session } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Ref to hold the AbortController for cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  // validation constants
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
  const CONCURRENCY_LIMIT = 3; // Max parallel uploads

  const getMediaType = (file: File): MediaType => {
    if (file.type.startsWith("image/")) return "POST_IMAGE";
    if (file.type.startsWith("video/")) return "POST_VIDEO";
    return "POST_IMAGE"; // Default fallback
  };

  const validateFile = (file: File): string | null => {
    if (file.type.startsWith("image/") && file.size > MAX_IMAGE_SIZE) {
      return `Image ${file.name} exceeds 10MB limit`;
    }
    if (file.type.startsWith("video/") && file.size > MAX_VIDEO_SIZE) {
      return `Video ${file.name} exceeds 100MB limit`;
    }
    return null;
  };

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsUploading(false);
      setProgress(0);
      toast("Upload cancelled");
    }
  }, []);

  const reset = useCallback(() => {
    cancel(); // ensure any pending requests are aborted
    setIsUploading(false);
    setProgress(0);
  }, [cancel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const uploadFiles = useCallback(
    async (files: File[]): Promise<Media[]> => {
      if (!files.length) return [];

      // 1. Auth check
      if (!session?.user?.accessToken) {
        toast.error("You must be logged in to upload media");
        return [];
      }
      
      const authHeaders = { 
        Authorization: `Bearer ${session.user.accessToken}` 
      };

      // 2. Validation
      for (const file of files) {
        const error = validateFile(file);
        if (error) {
          toast.error(error);
          return [];
        }
      }

      // Initialize Cancellation
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setIsUploading(true);
      setProgress(0);
      
      const results: Media[] = [];
      const totalFiles = files.length;
      let completedCount = 0;
      
      // Track individual file progress to compute global progress
      const fileProgressMap = new Map<string, number>();

      const updateGlobalProgress = () => {
        let total = 0;
        fileProgressMap.forEach((p) => (total += p));
        // Global progress = average of all files' progress
        const p = Math.round(total / totalFiles);
        setProgress(p);
      };

      // Helper to process a single file
      const processFile = async (file: File) => {
        if (signal.aborted) return;
        
        try {
          const mediaType = getMediaType(file);
          const fileId = file.name + file.lastModified; // simple unique key for progress map
          
          fileProgressMap.set(fileId, 0);

          // A. Create Session
          const sessionData = await createUploadSession(
            {
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              mediaType,
            },
            authHeaders
          );

          if (signal.aborted) throw new Error("Aborted");

          // B. Upload to R2 (with Retries & Signal)
          await uploadFileToR2(
            file, 
            sessionData.uploadUrl, 
            (p) => {
              fileProgressMap.set(fileId, p);
              updateGlobalProgress();
            },
            3, // retries
            signal
          );

          if (signal.aborted) throw new Error("Aborted");

          // C. Complete
          const completeData = await completeUpload(sessionData.mediaId, authHeaders);

          // D. Format result
          results.push({
            id: crypto.randomUUID(),
            mediaId: completeData.mediaId,
            url: completeData.cdnUrl,
            type: file.type,
            name: file.name,
            file: file,
            transform: default_ImageTransform,
          });

        } catch (error: any) {
          if (error.message !== "Aborted" && error.message !== "Upload aborted by user") {
            console.error(`Failed to upload ${file.name}:`, error);
            toast.error(`Failed to upload ${file.name}`);
          }
          // We continue processing other files even if one fails
        } finally {
          completedCount++;
        }
      };

      try {
        // Parallel Concurrency Queue
        // We act on the `files` array in batches of CONCURRENCY_LIMIT
        
        const queue = [...files];
        const activeWorkers: Promise<void>[] = [];

        while (queue.length > 0 || activeWorkers.length > 0) {
          if (signal.aborted) break;

          // Fill workers up to limit
          while (queue.length > 0 && activeWorkers.length < CONCURRENCY_LIMIT) {
            const file = queue.shift();
            if (file) {
              const promise = processFile(file).then(() => {
                 // Removed raw promise from activeWorkers
                 activeWorkers.splice(activeWorkers.indexOf(promise), 1);
              });
              activeWorkers.push(promise);
            }
          }

          // Wait for at least one worker to finish before refilling
          if (activeWorkers.length > 0) {
            await Promise.race(activeWorkers);
          }
        }

        if (signal.aborted) return [];

        setProgress(100);
        return results;

      } catch (error: any) {
        if (error.message !== "Aborted") {
           console.error("Batch upload failed:", error);
           toast.error("Upload failed");
        }
        return []; 
      } finally {
        setIsUploading(false);
        abortControllerRef.current = null;
      }
    },
    [session, cancel]
  );

  return {
    uploadFiles,
    isUploading,
    progress,
    reset,
    cancel,
  };
};
