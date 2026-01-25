"use client";

import React, { useState } from "react";
import { Send, Smile } from "lucide-react";
import { MediaUploadButton } from "./MediaUploadButton";
import { useWebSocket } from "@/src/contexts/WebSocketContext";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { v4 as uuidv4 } from "uuid";

interface ChatInputProps {
  conversationId: string;
  disabled?: boolean;
}

export function ChatInput({ conversationId, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const { sendMessage: sendWsMessage,  isConnected } = useWebSocket();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled || !isConnected || !session?.user?.id) return;

    const content = message.trim();
    const dedupeId = uuidv4();
    const tempId = `temp-${dedupeId}`;

    // ✅ OPTIMISTIC UPDATE: Add message to cache immediately
    queryClient.setQueryData<any[]>(
      ["messages", conversationId],
      (old = []) => [
        ...old,
        {
          id: tempId,
          conversationId,
          senderId: session.user.id,
          content,
          createdAt: new Date().toISOString(),
          status: "sending",
          dedupeId,
        },
      ]
    );

    // ✅ SEND VIA WEBSOCKET
    sendWsMessage({
      type: "send_message",
      recipientIds: [], // Server will determine from conversation
      content,
      dedupeId,
      conversationId,
    });

    // Clear input
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 py-3 bg-[#202C33] border-t border-[#202C33] flex items-end gap-2">
      {/* Plus / Attach Button */}
      <div className="mb-[5px]">
        <MediaUploadButton conversationId={conversationId} />
      </div>

      {/* Input Field Container */}
      <div className="flex-1 bg-[#2A3942] rounded-lg flex items-end px-3 py-2 min-h-[42px] max-h-32">
        {/* Emoji Button (Inside Left) - WhatsApp Web puts it left, Mobile right. Screenshot shows right? 
            Wait, standard WhatsApp Web has smiley left within pill. Screenshot provided has Smiley inside right?
            Let's Stick to standard WhatsApp Web: Smiley Left, Input, Mic Right.
            User Screenshot 1769335076708.png: 
            [Plus] [Rounded Rect: [Cursor] ... [Smile] [Sticker] ] [Mic]
            Ah, inside the PILL, the icons are on the RIGHT.
        */}
        
        {/* Text Area */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
          disabled={disabled || !isConnected}
          rows={1}
          className="flex-1 bg-transparent border-none text-[15px] text-[#D1D7DB] placeholder:text-[#8696A0] resize-none focus:outline-none focus:ring-0 max-h-32 py-1 scrollbar-hide"
          style={{ minHeight: "24px", lineHeight: "1.5" }}
        />

        {/* Icons Inside Input (Right Side) */}
        <div className="flex items-center gap-2 mb-0.5 ml-2">
           <button
            type="button"
            className="text-[#8696A0] hover:text-[#D1D7DB] transition-colors"
            disabled={disabled}
          >
           {/* Sticker Icon Placeholder - using Smile for now as generic emoji/sticker entry */}
           <Smile className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mic / Send Button */}
      {message.trim() ? (
        <button
          type="submit"
          disabled={disabled || !isConnected}
          className="mb-[5px] p-2 text-[#8696A0] hover:text-[#D1D7DB] transition-colors bg-transparent"
        >
          <Send className="w-6 h-6 text-[#00A884]" /> 
        </button>
      ) : (
        <button
          type="button" // Mic button logic to be added later
          disabled={disabled || !isConnected}
          className="mb-[5px] p-2 text-[#8696A0] hover:text-[#D1D7DB] transition-colors bg-transparent"
        >
          {/* Using generic Mic icon */}
           <svg viewBox="0 0 24 24" width="24" height="24" className="fill-current">
              <path fill="currentColor" d="M11.999 14.942c2.001 0 3.531-1.53 3.531-3.531V4.35c0-2.001-1.53-3.531-3.531-3.531S8.469 2.35 8.469 4.35v7.061c0 2.001 1.53 3.531 3.53 3.531zm4.606-3.531c0 2.544-2.063 4.606-4.606 4.606-2.544 0-4.606-2.063-4.606-4.606H6.218c0 2.896 2.113 5.298 4.908 5.669v3.081h1.746v-3.081c2.795-.371 4.908-2.773 4.908-5.669h-1.175z"></path>
           </svg>
        </button>
      )}
    </form>
  );
}
