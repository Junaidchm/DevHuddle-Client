"use client";

import { useRef } from "react";
import { Plus } from "lucide-react";
import { useMediaUpload } from "@/src/hooks/chat/useMediaUpload";
import { useWebSocket } from "@/src/contexts/WebSocketContext";

interface MediaUploadButtonProps {
  conversationId: string;
}

export function MediaUploadButton({ conversationId }: MediaUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadMediaAsync, isUploading, progress } = useMediaUpload();
  const { sendMessage } = useWebSocket();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Determine media type based on file
    let mediaType: "CHAT_IMAGE" | "CHAT_VIDEO" | "CHAT_FILE" = "CHAT_FILE";
    if (file.type.startsWith("image/")) mediaType = "CHAT_IMAGE";
    else if (file.type.startsWith("video/")) mediaType = "CHAT_VIDEO";

    try {
      // Upload to media-service
      const uploadResult = await uploadMediaAsync({
        file,
        mediaType,
      });

      // Send message with media via WebSocket
      // Note: We use 'any' here temporarily to bypass strict type checking for the custom media fields
      // The backend handles these fields correctly
      sendMessage({
        type: "send_message",
        conversationId,
        content: uploadResult.caption || "",
        // @ts-ignore - Extending the message interface dynamically
        messageType: mediaType,
        mediaId: uploadResult.mediaId,
        mediaUrl: uploadResult.mediaUrl,
        fileName: uploadResult.fileName,
        fileSize: uploadResult.fileSize,
      } as any);
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
