"use client";

import React, { useState } from "react";
import { ConversationList } from "@/src/components/chat/ConversationList";
import { ChatHeader } from "@/src/components/chat/ChatHeader";
import { MessageList } from "@/src/components/chat/MessageList";
import { ChatInput } from "@/src/components/chat/ChatInput";

// Mock data for demonstration
const mockConversations = [
  {
    id: "1",
    name: "Sarah Johnson",
    avatar: "SJ",
    lastMessage: "Hey! How's the project going?",
    time: "10:30 AM",
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: "2",
    name: "Team Dev",
    avatar: "TD",
    lastMessage: "Meeting at 3 PM today",
    time: "Yesterday",
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: "3",
    name: "John Doe",
    avatar: "JD",
    lastMessage: "Thanks for the help!",
    time: "Monday",
    unreadCount: 0,
    isOnline: true,
  },
  {
    id: "4",
    name: "Design Team",
    avatar: "DT",
    lastMessage: "New mockups are ready",
    time: "Sunday",
    unreadCount: 5,
    isOnline: false,
  },
];

type MessageStatus = "sending" | "sent" | "delivered" | "read";

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
  status?: MessageStatus;
}

const mockMessages: Message[] = [
  {
    id: "1",
    content: "Hey there! How are you doing?",
    senderId: "other",
    timestamp: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    status: "read",
  },
  {
    id: "2",
    content: "I'm doing great! Working on the chat feature.",
    senderId: "me",
    timestamp: new Date(Date.now() - 86400000 + 300000).toISOString(),
    status: "read",
  },
  {
    id: "3",
    content: "That's awesome! How's it going?",
    senderId: "other",
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    status: "delivered",
  },
  {
    id: "4",
    content: "Pretty good! The UI looks amazing. Working on WebSocket integration next.",
    senderId: "me",
    timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
    status: "read",
  },
  {
    id: "5",
    content: "Can't wait to see it! Let me know if you need any help.",
    senderId: "other",
    timestamp: new Date(Date.now() - 300000).toISOString(), // 5 min ago
    status: "sent",
  },
];

export default function ChatPage() {
  const [selectedConversationId, setSelectedConversationId] = useState("1");
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  const selectedConversation = mockConversations.find(
    (c) => c.id === selectedConversationId
  );

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      senderId: "me",
      timestamp: new Date().toISOString(),
      status: "sending",
    };

    setMessages([...messages, newMessage]);

    // Simulate message being sent
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id
            ? { ...msg, status: "sent" as MessageStatus }
            : msg
        )
      );
    }, 1000);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-[1800px] mx-auto bg-gray-50">
      {/* Left Sidebar - Conversations */}
      <div className="w-full md:w-96 flex-shrink-0 shadow-sm">
        <ConversationList
          conversations={mockConversations}
          selectedId={selectedConversationId}
          onSelect={setSelectedConversationId}
        />
      </div>

      {/* Right Side - Chat */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <ChatHeader
            name={selectedConversation.name}
            avatar={selectedConversation.avatar}
            isOnline={selectedConversation.isOnline}
            lastSeen="2 hours ago"
          />

          {/* Messages */}
          <MessageList
            messages={messages}
            currentUserId="me"
            getUserName={(userId: string) => {
              if (userId === "me") return "You";
              return selectedConversation.name;
            }}
          />

          {/* Input */}
          <ChatInput onSend={handleSendMessage} />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-32 h-32 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-16 h-16 text-[#0A66C2]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome to Messaging
            </h2>
            <p className="text-gray-500">
              Select a conversation to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
