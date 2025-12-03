import { useUploadThing } from "@/src/app/lib/uploadthing";
import { Media } from "@/src/app/types/feed";
import { default_ImageTransform } from "@/src/constents/feed";
import { useState, useRef } from "react";
import toast from "react-hot-toast";

export interface ProjectAttachment {
  file: File;
  mediaId?: string;
  isUploading: boolean;
}

export default function useProjectMediaUpload() {
  const [attachments, setAttachments] = useState<ProjectAttachment[]>([]);
  const attachmentsRef = useRef<ProjectAttachment[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>();

  const { startUpload, isUploading } = useUploadThing("projectMedia", {
    onBeforeUploadBegin(files) {
      const renamedFiles = files.map((file) => {
        const extension = file.name.split(".").pop();
        return new File(
          [file],
          `project_media_${crypto.randomUUID()}.${extension}`,
          { type: file.type }
        );
      });

      setAttachments((prev) => {
        const newAttachments = [
          ...prev,
          ...renamedFiles.map((file) => ({ file, isUploading: true })),
        ];
        attachmentsRef.current = newAttachments;
        return newAttachments;
      });
      return renamedFiles;
    },
    onUploadProgress: setUploadProgress,
    onClientUploadComplete(res) {
      try {
        const validResults = res.filter((r) => {
          if (!r.serverData?.mediaId) {
            console.error("Upload result missing mediaId:", r);
            toast.error(`Upload completed but mediaId missing for ${r.name}`);
            return false;
          }
          return true;
        });

        if (validResults.length === 0) {
          toast.error("Upload completed but no valid media IDs received");
          return;
        }

        setAttachments((prev) => {
          const updatedAttachments = attachmentsRef.current.map((a) => {
            const uploadResult = validResults.find((r) => r.name === a.file.name);
            return uploadResult
              ? {
                  ...a,
                  mediaId: uploadResult.serverData.mediaId,
                  isUploading: false,
                }
              : a;
          });
          attachmentsRef.current = updatedAttachments;
          return updatedAttachments;
        });

        toast.success(`Successfully uploaded ${validResults.length} file${validResults.length > 1 ? 's' : ''}`);
      } catch (error: any) {
        console.error("Error in onClientUploadComplete:", error);
        toast.error("Error processing upload completion");
      }
    },
    onUploadError(e) {
      setAttachments((prev) => prev.filter((a) => !a.isUploading));
      toast.error(e.message);
    },
  });

  async function handleStartUpload(files: File[]) {
    if (isUploading) {
      toast("Please wait for the current upload to finish.");
      return;
    }
    if (attachments.length + files.length > 10) {
      toast("You can only upload up to 10 media files per project.");
      return;
    }

    startUpload(files);
  }

  function removeAttachment(fileName: string) {
    setAttachments((prev) => prev.filter((a) => a.file.name !== fileName));
    attachmentsRef.current = attachmentsRef.current.filter((a) => a.file.name !== fileName);
  }

  function reset() {
    setAttachments([]);
    setUploadProgress(undefined);
    attachmentsRef.current = [];
  }

  function getMediaIds(): string[] {
    return attachments
      .map((a) => a.mediaId)
      .filter((id): id is string => Boolean(id));
  }

  return {
    startUpload: handleStartUpload,
    attachments,
    isUploading,
    uploadProgress,
    removeAttachment,
    reset,
    getMediaIds,
  };
}


