"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Smile, X, Mic } from "lucide-react";
import dynamic from "next/dynamic";
import { MediaUploadButton } from "./MediaUploadButton";
import { useWebSocket } from "@/src/contexts/WebSocketContext";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { v4 as uuidv4 } from "uuid";
import { useVoiceRecording } from "@/src/hooks/chat/useVoiceRecording";

// Dynamically import EmojiPicker to avoid SSR issues
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface ChatInputProps {
  conversationId: string;
  disabled?: boolean;
}

export function ChatInput({ conversationId, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
  const { sendMessage: sendWsMessage,  isConnected } = useWebSocket();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  // Voice recording hook
  const {
    isRecording,
    duration,
    error: recordingError,
    isUploading: isUploadingVoice,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecording();

  // Close emoji picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // 🔍 DEBUG: Log connection state
  React.useEffect(() => {
    console.log("[ChatInput] Connection State:", {
      isConnected,
      hasSession: !!session,
      userId: session?.user?.id,
      disabled,
      conversationId
    });
  }, [isConnected, session, disabled, conversationId]);

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
          timestamp: new Date().toISOString(),
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

  // Emoji picker handler
  const handleEmojiClick = (emojiData: any) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // Voice recording handlers
  const handleStartVoiceRecording = async () => {
    await startRecording();
  };

  const handleSendVoiceRecording = async () => {
    const result = await stopRecording();
    
    if (result && session?.user?.id) {
      // Send voice message via WebSocket
      sendWsMessage({
        type: "send_message",
        recipientIds: [],
        content: "",
        conversationId,
        // @ts-ignore
        messageType: 'AUDIO',
        mediaUrl: result.mediaUrl,
        mediaId: result.mediaId,
        mediaDuration: result.duration,
      } as any);
    }
  };

  const handleCancelVoiceRecording = () => {
    cancelRecording();
  };

  // 🔧 FIX: Only disable if explicitly disabled prop is true, not based on connection
  const isInputDisabled = disabled || false;
  const canSend = isConnected && !!session?.user?.id && message.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="px-4 py-3 bg-white border-t border-gray-200 flex items-end gap-2">
      {/* Plus / Attach Button */}
      <div className="mb-[5px]">
        <MediaUploadButton conversationId={conversationId} />
      </div>

      {/* Input Field Container */}
      <div className="flex-1 bg-gray-50 rounded-lg flex items-end px-3 py-2 min-h-[42px] max-h-32 border border-gray-200 focus-within:border-[#0A66C2] focus-within:ring-1 focus-within:ring-[#0A66C2] transition-all">
        {/* Text Area - ALWAYS ENABLED for typing */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            !isConnected 
              ? "Connecting to chat..." 
              : !session?.user?.id
              ? "Loading..."
              : "Type a message"
          }
          disabled={isInputDisabled}
          rows={1}
          className="flex-1 bg-transparent border-none text-[15px] text-gray-800 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-0 max-h-32 py-1"
          style={{ minHeight: "24px", lineHeight: "1.5" }}
        />

        {/* Icons Inside Input (Right Side) */}
        <div className="flex items-center gap-2 mb-0.5 ml-2 relative">
          {/* Emoji Picker Button */}
          <div ref={emojiPickerRef} className="relative">
            <button
              type="button"
              className="text-gray-400 hover:text-[#0A66C2] transition-colors"
              disabled={isInputDisabled || isRecording}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Add emoji"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* LinkedIn-style Emoji Picker Popover */}
            {showEmojiPicker && (
              <div className="absolute bottom-12 right-0 z-50 shadow-2xl rounded-lg overflow-hidden border border-gray-200 bg-white">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  width={350}
                  height={400}
                  searchDisabled={false}
                  skinTonesDisabled={false}
                  previewConfig={{
                    showPreview: false,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mic / Send Button */}
      {isRecording ? (
        /* Voice Recording Interface */
        <div className="flex items-center gap-2 mb-[5px] px-3 py-2 bg-red-50 rounded-full border border-red-200">
          {/* Recording indicator */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-red-600">
              {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
            </span>
          </div>

          {/* Cancel button */}
          <button
            type="button"
            onClick={handleCancelVoiceRecording}
            className="p-1.5 hover:bg-red-100 rounded-full transition-colors"
            title="Cancel recording"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>

          {/* Send voice button */}
          <button
            type="button"
            onClick={handleSendVoiceRecording}
            disabled={isUploadingVoice}
            className="p-1.5 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-full transition-colors"
            title="Send voice message"
          >
            {isUploadingVoice ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      ) : message.trim() ? (
        /* Send Text Button */
        <button
          type="submit"
          disabled={!canSend}
          className={`
            mb-[5px] p-2.5 rounded-full transition-all
            ${canSend 
              ? 'bg-[#0A66C2] text-white hover:bg-[#004182]' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
          title={!isConnected ? "Connecting..." : !session?.user?.id ? "Loading..." : "Send message"}
        >
          <Send className="w-5 h-5" /> 
        </button>
      ) : (
        /* Voice Recording Button */
        <button
          type="button"
          disabled={isInputDisabled || !isConnected}
          className="mb-[5px] p-2 text-gray-400 hover:text-[#0A66C2] transition-colors disabled:opacity-50"
          onClick={handleStartVoiceRecording}
          title="Record voice message"
        >
          <Mic className="w-6 h-6" />
        </button>
      )}

      {/* Recording Error Toast */}
      {recordingError && (
        <div className="absolute bottom-20 right-4 bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm">{recordingError}</p>
        </div>
      )}

      {/* Debug Info (remove after testing) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="hidden">
          Connection: {isConnected ? "✅" : "❌"} | 
          Session: {session?.user?.id ? "✅" : "❌"}
        </div>
      )}
    </form>
  );
}
