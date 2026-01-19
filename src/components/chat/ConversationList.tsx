import React, { useState } from "react";
import { Search, MoreVertical, Edit } from "lucide-react";
import { NewChatModal } from "./NewChatModal";

interface ConversationItem {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  isOnline?: boolean;
}

interface ConversationListProps {
  conversations: ConversationItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  // TODO: Implement conversation creation logic
  const handleNewConversation = async (userId: string) => {
    console.log("Creating conversation with user:", userId);
    // TODO: Call API to create conversation
    // TODO: Select the newly created conversation
    // TODO: Invalidate/refetch conversations list
  };

  return (
    <div className="relative flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-bold text-gray-800">
          Messages
        </h1>
        <button 
          onClick={() => setIsNewChatModalOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="New message"
          title="New message"
        >
          <Edit className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Search */}
      <div className="p-3 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/10 transition-all text-gray-800 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation.id)}
            className={`
              w-full p-4 flex items-start gap-3 transition-all border-l-3 bg-white hover:bg-gray-50 border-b border-gray-100
              ${selectedId === conversation.id 
                ? 'border-l-[#0A66C2] bg-blue-50/50' 
                : 'border-l-transparent'
              }
            `}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0A66C2] to-[#004182] flex items-center justify-center text-white font-semibold shadow-sm">
                {conversation.avatar}
              </div>
              {conversation.isOnline && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#1B8917] rounded-full border-2 border-white shadow-sm" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {conversation.name}
                </h3>
                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                  {conversation.time}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 truncate">
                  {conversation.lastMessage}
                </p>
                {conversation.unreadCount && conversation.unreadCount > 0 && (
                  <span className="flex-shrink-0 ml-2 min-w-[20px] h-5 px-1.5 bg-[#0A66C2] rounded-full flex items-center justify-center text-xs text-white font-semibold">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <NewChatModal 
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onUserSelect={handleNewConversation}
      />
    </div>
  );
}
