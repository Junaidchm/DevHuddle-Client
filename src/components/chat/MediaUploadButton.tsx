import { useRef, useState, useEffect } from "react";
import { Plus, Image as ImageIcon, FileText, X } from "lucide-react";
import { useMediaUpload } from "@/src/hooks/chat/useMediaUpload";
import { useSendMessage } from "@/src/hooks/chat/useSendMessage";
import { CHAT_CONFIG } from "@/src/constants/chat.constants";

interface MediaUploadButtonProps {
  conversationId: string;
}

export function MediaUploadButton({ conversationId }: MediaUploadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadMediaAsync, isUploading, progress } = useMediaUpload();
  const { sendMessage } = useSendMessage();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'media' | 'document') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Reset menu
    setIsOpen(false);
    // Reset input value to allow selecting same file again
    e.target.value = '';

    // Determine media type
    let mediaType: "CHAT_IMAGE" | "CHAT_VIDEO" | "CHAT_FILE" = "CHAT_FILE";
    
    if (type === 'media') {
       if (file.type.startsWith('video/')) {
         mediaType = 'CHAT_VIDEO';
       } else {
         mediaType = 'CHAT_IMAGE';
       }
    } else {
       mediaType = 'CHAT_FILE';
    }

    try {
      // Upload
      const uploadResult = await uploadMediaAsync({
        file,
        mediaType,
      });

      console.log("[MediaUploadButton] Upload complete, result:", uploadResult);

      // Send Message
      console.log("[MediaUploadButton] Sending message with media details:", {
        mediaId: uploadResult.mediaId,
        mediaUrl: uploadResult.mediaUrl,
        fileName: uploadResult.fileName,
        fileSize: uploadResult.fileSize,
        mimeType: file.type
      });
      
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
    <div className="relative" ref={menuRef}>
      {/* Hidden Inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, 'media')}
        disabled={isUploading}
      />
      <input
        ref={documentInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.zip"
        className="hidden"
        onChange={(e) => handleFileSelect(e, 'document')}
        disabled={isUploading}
      />
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUploading}
        className={`p-2 transition-colors rounded-full flex-shrink-0 ${isOpen ? 'bg-gray-100 text-primary rotate-45' : 'text-gray-500 hover:text-primary hover:bg-gray-50'}`}
        title="Attach"
      >
        {isUploading ? (
          <div className="w-5 h-5 flex items-center justify-center text-[10px] font-medium text-primary">
            {progress?.percentage || 0}
          </div>
        ) : (
          <Plus className={`w-6 h-6 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`} strokeWidth={2} />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && !isUploading && (
        <div className="absolute bottom-12 left-0 bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-xl p-2 min-w-[160px] flex flex-col gap-1 z-50 animate-in fade-in zoom-in-95 duration-200 slide-in-from-bottom-2">
          <button
            onClick={() => imageInputRef.current?.click()}
            className="flex items-center gap-3 w-full p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
          >
            <div className="p-1.5 bg-purple-100 text-purple-600 rounded-full">
              <ImageIcon className="w-4 h-4" />
            </div>
            <span>Photos & Videos</span>
          </button>
          
          <button
            onClick={() => documentInputRef.current?.click()}
            className="flex items-center gap-3 w-full p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
          >
            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-full">
              <FileText className="w-4 h-4" />
            </div>
            <span>Document</span>
          </button>
        </div>
      )}
    </div>
  );
}
