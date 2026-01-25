import React, { useState } from "react";
import { Check, CheckCheck, FileText, Download, Play, Pause } from "lucide-react";
import { Message } from "@/src/types/chat.types";
import Image from "next/image";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  senderName?: string;
}

export function MessageBubble({ message, isOwn, showAvatar, senderName }: MessageBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Format time to HH:MM (WhatsApp style)
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Render delivery status (WhatsApp-style checkmarks)
  const renderStatus = () => {
    if (!isOwn) return null;
    
    if (message.status === "read") {
      return <CheckCheck className="w-4 h-4 text-blue-400" />; // Blue checkmarks for read
    } else if (message.status === "delivered") {
      return <CheckCheck className="w-4 h-4 text-gray-400" />; // Gray double checkmark
    } else if (message.status === "sent") {
      return <Check className="w-4 h-4 text-gray-400" />; // Gray single checkmark
    }
    return <Check className="w-4 h-4 text-gray-300" />; // Sending
  };

  // Render content based on message type
  const renderContent = () => {
    switch (message.type) {
      case 'IMAGE':
        return (
          <div className="mb-1">
            <div className="relative w-full max-w-[300px] aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-95 transition-opacity">
              <Image 
                src={message.mediaUrl || ''} 
                alt="Image" 
                fill 
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 300px"
              />
            </div>
            {message.content && <p className="mt-1 text-sm">{message.content}</p>}
          </div>
        );

      case 'VIDEO':
        return (
          <div className="mb-1">
            <div className="relative w-full max-w-[300px] aspect-video rounded-lg overflow-hidden bg-black">
              <video 
                src={message.mediaUrl} 
                controls 
                className="w-full h-full object-contain"
              />
            </div>
            {message.content && <p className="mt-1 text-sm">{message.content}</p>}
          </div>
        );
        
      case 'FILE':
        return (
          <div className="mb-1">
            <div className={`flex items-center gap-3 p-3 rounded-lg ${isOwn ? 'bg-[#005c4b]/10' : 'bg-gray-100'}`}>
              <div className="p-2 bg-red-100 rounded-lg text-red-500">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{message.mediaName || "File"}</p>
                <p className="text-xs opacity-70">{(message.mediaSize || 0 / 1024).toFixed(1)} KB • {message.mediaMimeType?.split('/')[1]?.toUpperCase()}</p>
              </div>
              <a href={message.mediaUrl} download target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
                <Download className="w-4 h-4 text-gray-600" />
              </a>
            </div>
            {message.content && <p className="mt-1 text-sm">{message.content}</p>}
          </div>
        );

      default:
        // Text message
        return <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words flex-1">{message.content}</p>;
    }
  };

  return (
    <div className={`flex items-end gap-2 mb-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar for received messages */}
      {!isOwn && showAvatar && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#0A66C2] to-[#004182] flex items-center justify-center text-white text-xs font-semibold shadow-sm">
          {senderName?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      )}
      {!isOwn && !showAvatar && <div className="w-8" />}

      {/* Message Bubble Container */}
      <div className={`relative max-w-[65%] group ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Bubble with WhatsApp-style design */}
        <div
          className={`
            px-3 py-2 shadow-sm
            ${isOwn 
              ? 'bg-[#0A66C2] text-white rounded-lg rounded-br-sm' 
              : 'bg-white text-gray-800 border border-gray-200 rounded-lg rounded-bl-sm'
            }
          `}
        >
          {/* Sender name for group chats (received messages only) */}
          {!isOwn && senderName && (
            <p className="text-xs font-semibold text-[#0A66C2] mb-1">{senderName}</p>
          )}
          
          {/* Message content with timestamp inline */}
          <div className="flex flex-col">
            {renderContent()}
            
            {/* Timestamp + Status (WhatsApp style - bottom right inside bubble) */}
            <div className={`
              flex items-center gap-1 justify-end mt-1
              ${isOwn ? 'text-blue-100' : 'text-gray-500'}
            `}>
              <span className="text-[11px] leading-none">{formatTime(message.createdAt)}</span>
              {renderStatus()}
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for sent messages */}
      {isOwn && <div className="w-8" />}
    </div>
  );
}
