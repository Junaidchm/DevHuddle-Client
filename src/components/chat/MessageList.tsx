import React from "react";
import { MessageBubble } from "./MessageBubble";
import { Message } from "@/src/types/chat.types";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  getUserName?: (userId: string) => string;
  isLoading?: boolean;
}

export function MessageList({ messages, currentUserId, getUserName, isLoading = false }: MessageListProps) {
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="flex flex-col items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A66C2]"></div>
          <p className="mt-4 text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages: { [key: string]: Message[] } = {};
  messages.forEach((message) => {
    // legacy support for timestamp vs createdAt
    const ts = message.createdAt || (message as any).timestamp;
    const date = new Date(ts).toDateString();
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });

  const formatDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (dateString === today) return 'Today';
    if (dateString === yesterday) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined 
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
      <div className="relative">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex justify-center my-6">
              <div className="px-4 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm">
                <span className="text-xs font-medium text-gray-600">
                  {formatDateLabel(date)}
                </span>
              </div>
            </div>

            {/* Messages for this date */}
            {dateMessages.map((message, index) => {
              const isOwn = message.senderId === currentUserId;
              const previousMessage = dateMessages[index - 1];
              const showAvatar = !previousMessage || previousMessage.senderId !== message.senderId;
              
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  senderName={!isOwn && getUserName ? getUserName(message.senderId) : undefined}
                />
              );
            })}
          </div>
        ))}

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-[#0A66C2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-700 font-medium">No messages yet</p>
            <p className="text-sm text-gray-500 mt-1">Send a message to start the conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
