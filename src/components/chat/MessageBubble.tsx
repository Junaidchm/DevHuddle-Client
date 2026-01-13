import React from "react";

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
  status?: "sending" | "sent" | "delivered" | "read";
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  senderName?: string;
}

export function MessageBubble({ message, isOwn, showAvatar, senderName }: MessageBubbleProps) {
  return (
    <div className={`flex items-end gap-2 mb-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0A66C2] to-[#004182] flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
          {senderName?.charAt(0) || 'U'}
        </div>
      )}
      {showAvatar && isOwn && <div className="w-8" />}

      {/* Message Bubble */}
      <div
        className={`
          max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm
          ${isOwn 
            ? 'bg-[#0A66C2] text-white rounded-br-md' 
            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
          }
        `}
      >
        {!isOwn && senderName && (
          <p className="text-xs font-semibold text-[#0A66C2] mb-1">{senderName}</p>
        )}
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
        <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
          <span className="text-xs">{message.timestamp}</span>
          {isOwn && (
            <div className="flex">
              {message.status === 'read' && (
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M15 4L6 13l-3-3 1-1 2 2 8-8 1 1z" />
                  <path d="M12 4L5 11l-1-1 6-6 2 2z" />
                </svg>
              )}
              {message.status === 'delivered' && (
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M15 4L6 13l-3-3 1-1 2 2 8-8 1 1z" />
                  <path d="M12 4L5 11l-1-1 6-6 2 2z" />
                </svg>
              )}
              {message.status === 'sent' && (
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M15 4L6 13l-3-3 1-1 2 2 8-8 1 1z" />
                </svg>
              )}
            </div>
          )}
        </div>
      </div>

      {!showAvatar && !isOwn && <div className="w-8" />}
      {!showAvatar && isOwn && <div className="w-8" />}
    </div>
  );
}
