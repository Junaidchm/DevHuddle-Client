import { useRef } from "react";
import { Plus } from "lucide-react";
import { useMediaUpload } from "@/src/hooks/chat/useMediaUpload";
import { useSendMessage } from "@/src/hooks/chat/useSendMessage";
import { CHAT_CONFIG } from "@/src/constants/chat.constants";

interface MediaUploadButtonProps {
  conversationId: string;
}

export function MediaUploadButton({ conversationId }: MediaUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadMediaAsync, isUploading, progress } = useMediaUpload();
  const { sendMessage } = useSendMessage();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Determine media type based on file
    let mediaType: "CHAT_IMAGE" | "CHAT_VIDEO" | "CHAT_FILE" = "CHAT_FILE";
    if (CHAT_CONFIG.MEDIA.ACCEPTED_IMAGE_TYPES.includes(file.type)) mediaType = "CHAT_IMAGE";
    else if (CHAT_CONFIG.MEDIA.ACCEPTED_VIDEO_TYPES.includes(file.type)) mediaType = "CHAT_VIDEO";

    try {
      // Upload to media-service
      const uploadResult = await uploadMediaAsync({
        file,
        mediaType,
      });

      // Send message with media via useSendMessage (handles optimistic updates)
      await sendMessage({
        conversationId,
        content: uploadResult.caption || "",
        type: mediaType === "CHAT_IMAGE" ? "IMAGE" : mediaType === "CHAT_VIDEO" ? "VIDEO" : "FILE",
        mediaDetails: {
            mediaId: uploadResult.mediaId,
            mediaUrl: uploadResult.mediaUrl,
            fileName: uploadResult.fileName,
            fileSize: uploadResult.fileSize,
            mimeType: file.type
        }
      });
    } catch (error) {
      console.error("Failed to send media:", error);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,.pdf,.doc,.docx"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isUploading}
      />
      
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="p-2 text-gray-500 hover:text-[#0A66C2] transition-colors rounded-lg flex-shrink-0"
        title="Attach"
      >
        {isUploading ? (
          <div className="w-5 h-5 flex items-center justify-center text-xs font-medium text-[#0A66C2]">
            {progress?.percentage || 0}%
          </div>
        ) : (
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        )}
      </button>
    </>
  );
}
