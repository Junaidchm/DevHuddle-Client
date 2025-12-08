
import { useState, useCallback, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { MediaType, createUploadSession, uploadFileToR2, completeUpload } from "@/src/services/api/media.service";
import { useSession } from "next-auth/react";

interface UploadResult {
  mediaId: string;
  cdnUrl: string;
  status: string;
  file: File;
}

export interface ProjectAttachment {
  file: File;
  mediaId?: string;
  isUploading: boolean;
}

/**
 * ✅ INDUSTRIAL STANDARD Project Media Upload Hook
 * 
 * Features:
 * 1. Parallel Uploads (max 3)
 * 2. Cancellation Support
 * 3. Retry Logic
 */
export default function useProjectMediaUpload() {
  const [attachments, setAttachments] = useState<ProjectAttachment[]>([]);
  const attachmentsRef = useRef<ProjectAttachment[]>([]);
  const [isUploadingState, setIsUploadingState] = useState(false);
  const [uploadProgressState, setUploadProgressState] = useState(0);
  const { data: session } = useSession();
  
  // Cancellation ref
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const CONCURRENCY_LIMIT = 3;

  const getMediaType = (file: File): MediaType => {
    if (file.type.startsWith("image/")) return "POST_IMAGE";
    if (file.type.startsWith("video/")) return "POST_VIDEO";
    return "POST_IMAGE";
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsUploadingState(false);
      setUploadProgressState(0);
      toast("Upload cancelled");
    }
  }, []);

  const reset = useCallback(() => {
    cancel();
    setAttachments([]);
    attachmentsRef.current = [];
    setIsUploadingState(false);
    setUploadProgressState(0);
  }, [cancel]);

  /**
   * Start uploading files
   */
  const startUpload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      // Validate file count
      if (attachmentsRef.current.length + files.length > 10) {
        toast.error("Maximum 10 media files allowed per project");
        return;
      }

      // 1. Auth check
      if (!session?.user?.accessToken) {
        toast.error("Please log in to upload media");
        return;
      }
      const authHeaders = { Authorization: `Bearer ${session.user.accessToken}` };

      // 2. Add to attachments
      const newAttachments: ProjectAttachment[] = files.map((file) => ({
        file,
        isUploading: true,
      }));

      setAttachments((prev) => {
        const updated = [...prev, ...newAttachments];
        attachmentsRef.current = updated;
        return updated;
      });

      // 3. Setup Cancel/Progress
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      setIsUploadingState(true);
      setUploadProgressState(0);

      const fileProgressMap = new Map<string, number>();
      const totalFiles = files.length;
      
      const updateGlobalProgress = () => {
        let total = 0;
        fileProgressMap.forEach((p) => (total += p));
        setUploadProgressState(Math.round(total / totalFiles));
      };

      const uploadResults: UploadResult[] = [];

      // 4. Processing Function
      const processFile = async (file: File) => {
        if (signal.aborted) return;
        const fileId = file.name + file.lastModified;
        fileProgressMap.set(fileId, 0);

        try {
            const mediaType = getMediaType(file);
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

            const result = await completeUpload(sessionData.mediaId, authHeaders);
            uploadResults.push({ ...result, file }); // Attach file for mapping

        } catch (error: any) {
            if (error.message !== "Aborted" && error.message !== "Upload aborted by user") {
                console.error("Upload error", error);
                toast.error(`Failed: ${file.name}`);
                
                // Remove failed attachment
                setAttachments(prev => {
                   const updated = prev.filter(att => att.file !== file);
                   attachmentsRef.current = updated;
                   return updated;
                });
            }
        }
      };

      try {
          // 5. Parallel Queue
          const queue = [...files];
          const activeWorkers: Promise<void>[]= [];

          while (queue.length > 0 || activeWorkers.length > 0) {
            if (signal.aborted) break;

            while (queue.length > 0 && activeWorkers.length < CONCURRENCY_LIMIT) {
                const file = queue.shift();
                if (file) {
                    const promise = processFile(file).then(() => {
                        activeWorkers.splice(activeWorkers.indexOf(promise), 1);
                    });
                    activeWorkers.push(promise);
                }
            }
            
            if (activeWorkers.length > 0) {
                await Promise.race(activeWorkers);
            }
          }
          
          if (signal.aborted) return;

          // 6. Update State with Media IDs
          if (uploadResults.length > 0) {
              setAttachments((prev) => {
                  const updated = prev.map((att) => {
                      const result = uploadResults.find(r => r.file === att.file);
                      if (result) {
                          return { ...att, mediaId: result.mediaId, isUploading: false };
                      }
                      return att;
                  });
                  attachmentsRef.current = updated;
                  return updated;
              });
              
              toast.success(`Uploaded ${uploadResults.length} files`);
          }

      } finally {
          setIsUploadingState(false);
          abortControllerRef.current = null;
      }
    },
    [session, attachments.length]
  );
  
  const removeAttachment = useCallback((fileName: string) => {
    setAttachments((prev) => {
      const updated = prev.filter((a) => a.file.name !== fileName);
      attachmentsRef.current = updated;
      return updated;
    });
  }, []);

  const getMediaIds = useCallback((): string[] => {
    // Only return successfully uploaded IDs
    return attachmentsRef.current
      .map((a) => a.mediaId)
      .filter((id): id is string => Boolean(id));
  }, []); // dependent on ref, stable

  return {
    startUpload,
    attachments,
    isUploading: isUploadingState,
    uploadProgress: uploadProgressState,
    removeAttachment,
    reset,
    getMediaIds,
  };
}
