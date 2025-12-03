import { useUploadThing } from "@/src/app/lib/uploadthing";
import { Media } from "@/src/app/types/feed";
import { default_ImageTransform } from "@/src/constents/feed";
import { useMedia } from "@/src/contexts/MediaContext";
import { useState, useRef } from "react";
import toast from "react-hot-toast";

export interface Attachment {
  file: File;
  mediaId?: string;
  isUploading: boolean;
}

export default function useMediaUpload() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const attachmentsRef = useRef<Attachment[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>();

  const { addMedia } =
    useMedia();

  const { startUpload, isUploading } = useUploadThing("attachment", {
    onBeforeUploadBegin(files) {
      const renamedFiles = files.map((file) => {
        const extension = file.name.split(".").pop();
        return new File(
          [file],
          `attachment_${crypto.randomUUID()}.${extension}`,
          { type: file.type }
        );
      });

      setAttachments((prev) => {
        const newAttachments = [
          ...prev,
          ...renamedFiles.map((file) => ({ file, isUploading: true })),
        ];
        attachmentsRef.current = newAttachments; // Persist in ref

        return newAttachments;
      });
      return renamedFiles;
    },
    onUploadProgress: setUploadProgress,
    onClientUploadComplete(res) {
      try {
        // ✅ FIX: Validate serverData.mediaId exists before proceeding
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

        const images = validResults
          .map((r) => {
            const originalAttachment = attachmentsRef.current.find(
              (a) => a.file.name === r.name
            );
            const originalFile = originalAttachment?.file;

            if (!originalFile) {
              console.warn("Original file not found for upload result:", r.name);
              return null;
            }

            return {
              id: crypto.randomUUID(),
              file: originalFile,
              url: r.ufsUrl,
              name: r.name,
              taggedUsers: [],
              transform: default_ImageTransform,
              type: originalFile.type,
              mediaId: r.serverData.mediaId, // ✅ This is now guaranteed to exist
            };
          })
          .filter((img) => img !== null) as Media[];

        // ✅ FIX: Update MediaContext with uploaded media (this persists across modal close/open)
        if (images.length > 0) {
          addMedia(images);
          toast.success(`Successfully uploaded ${images.length} file${images.length > 1 ? 's' : ''}`);
        }

        // ✅ FIX: Update local attachments state
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
          attachmentsRef.current = updatedAttachments; // ✅ Update ref too
          return updatedAttachments;
        });
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
    if (attachments.length + files.length > 5) {
      toast("You can only upload up to 5 attachments per post.");
      return;
    }

    startUpload(files);
  }

  function removeAttachment(fileName: string) {
    setAttachments((prev) => prev.filter((a) => a.file.name !== fileName));
  }

  function reset() {
    setAttachments([]);
    setUploadProgress(undefined);
    attachmentsRef.current = [];
  }

  return {
    startUpload: handleStartUpload,
    attachments,
    isUploading,
    uploadProgress,
    removeAttachment,
    reset,
  };
}
