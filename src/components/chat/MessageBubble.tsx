/**
 * MessageBubble Component
 * Renders individual chat messages with sender/receiver styling
 */

'use client';

import { Message } from '@/src/types/chat.types';
import { format } from 'date-fns';
import { CheckCheck, Check } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  senderName?: string;
  senderAvatar?: string;
}

export default function MessageBubble({
  message,
  isOwnMessage,
  senderName,
  senderAvatar,
}: MessageBubbleProps) {
  const formattedTime = format(new Date(message.createdAt), 'HH:mm');

  return (
    <div
      className={`flex items-start gap-2 mb-4 ${
        isOwnMessage ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      {!isOwnMessage && (
        <div className="flex-shrink-0">
          {senderAvatar ? (
            <img
              src={senderAvatar}
              alt={senderName || 'User'}
              className="w-8 h-8 rounded-full object-cover border-2 border-border"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gradient-start to-gradient-end flex items-center justify-center text-white font-semibold text-sm">
              {senderName?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
        </div>
      )}

      {/* Message Content */}
      <div
        className={`flex flex-col max-w-[70%] ${
          isOwnMessage ? 'items-end' : 'items-start'
        }`}
      >
        {/* Sender Name (only for received messages in group chats) */}
        {!isOwnMessage && senderName && (
          <span className="text-xs text-muted-foreground mb-1 px-2">
            {senderName}
          </span>
        )}

        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-2.5 shadow-sm transition-all duration-200 ${
            isOwnMessage
              ? 'bg-gradient-to-br from-gradient-start to-gradient-end text-white rounded-br-none'
              : 'bg-card text-card-foreground border border-border rounded-bl-none'
          }`}
        >
          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        {/* Timestamp and Status */}
        <div
          className={`flex items-center gap-1 mt-1 px-2 ${
            isOwnMessage ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <span className="text-xs text-muted-foreground">{formattedTime}</span>
          {isOwnMessage && (
            <span className="text-xs">
              {message.status === 'read' ? (
                <CheckCheck className="w-3 h-3 text-blue-500" />
              ) : message.status === 'delivered' || message.status === 'sent' ? (
                <CheckCheck className="w-3 h-3 text-muted-foreground" />
              ) : message.status === 'sending' ? (
                <Check className="w-3 h-3 text-muted-foreground" />
              ) : message.status === 'failed' ? (
                <span className="text-red-500">!</span>
              ) : null}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
