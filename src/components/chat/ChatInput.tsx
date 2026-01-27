"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Smile, X, Mic, Pause, Play, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { MediaUploadButton } from "./MediaUploadButton";
import { useWebSocket } from "@/src/contexts/WebSocketContext";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { v4 as uuidv4 } from "uuid";
import { useVoiceRecording } from "@/src/hooks/chat/useVoiceRecording";
import { WaveformVisualizer } from "./WaveformVisualizer";
import { VoicePreviewPlayer } from "./VoicePreviewPlayer";

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
  
  const { sendMessage: sendWsMessage, isConnected } = useWebSocket();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  
  // Voice recording hook
  const {
    state: recordingState,
    duration,
    error: recordingError,
    audioBlob,
    analyser,
    waveformPeaks,
    isUploading: isUploadingVoice,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    sendVoiceMessage,
    discardRecording,
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
          type: 'TEXT',
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
      recipientIds: [],
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

  const handlePauseRecording = () => {
    if (recordingState === 'recording') {
      pauseRecording();
    } else if (recordingState === 'paused') {
      resumeRecording();
    }
  };

  const handleStopRecording = async () => {
    await stopRecording();
  };

  const handleSendVoiceRecording = async () => {
    const result = await sendVoiceMessage();
    
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

  const handleDiscardVoiceRecording = () => {
    discardRecording();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine if we're in recording modes
  const isInRecordingMode = recordingState !== 'idle';
  const isInputDisabled = disabled || isInRecordingMode;
  const canSend = isConnected && !!session?.user?.id && message.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="px-4 py-3 bg-white border-t border-gray-200 flex items-end gap-2">
      {/* PREVIEW MODE - WhatsApp Style Preview Bar */}
      {recordingState === 'preview' && audioBlob && (
        <VoicePreviewPlayer
          audioBlob={audioBlob}
          duration={duration}
          waveformPeaks={waveformPeaks}
          onSend={handleSendVoiceRecording}
          onDiscard={handleDiscardVoiceRecording}
          isSending={isUploadingVoice}
        />
      )}

      {/* RECORDING/PAUSED MODE - WhatsApp Style Recording Bar */}
      {(recordingState === 'recording' || recordingState === 'paused') && (
        <div className="flex-1 flex items-center gap-4 px-2 py-1 w-full">
          {/* Trash icon (Left) */}
          <button
            type="button"
            onClick={handleDiscardVoiceRecording}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors"
            title="Discard recording"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          {/* Timer + Red Pulse */}
          <div className="flex items-center gap-2 min-w-[65px]">
            <div className={`w-2.5 h-2.5 bg-red-500 rounded-full ${recordingState === 'recording' ? 'animate-pulse' : ''}`}></div>
            <span className="text-gray-900 font-mono text-[15px] tabular-nums">
              {formatTime(duration)}
            </span>
          </div>

          {/* Waveform Visualization (Center) */}
          <div className="flex-1 h-8 bg-transparent">
            <WaveformVisualizer
              analyser={analyser}
              isActive={recordingState === 'recording'}
              barColor="#9ca3af" // Gray for recording bars (WhatsApp style)
              barCount={50}
              height={32}
            />
          </div>

          {/* Controls (Right) */}
          <div className="flex items-center gap-2">
            {/* Pause/Resume button */}
            <button
               type="button"
               onClick={handlePauseRecording}
               className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
               title={recordingState === 'paused' ? 'Resume' : 'Pause'}
            >
               {recordingState === 'paused' ? (
                 <Mic className="w-6 h-6" /> // Resume with Mic icon or Play? WhatsApp uses Mic to Resume usually
               ) : (
                 <Pause className="w-6 h-6 fill-current" />
               )}
            </button>

            {/* Stop/Review Button */}
            <button
               type="button"
               onClick={handleStopRecording}
               className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
               title="Stop and review"
            >
               <div className="w-4 h-4 bg-white rounded-sm" /> 
            </button>
          </div>
        </div>
      )}

      {/* NORMAL/IDLE MODE - Text input */}
      {recordingState === 'idle' && (
        <>
          {/* Plus / Attach Button */}
          <div className="mb-[5px]">
            <MediaUploadButton conversationId={conversationId} />
          </div>

          {/* Input Field Container */}
          <div className="flex-1 bg-gray-50 rounded-lg flex items-end px-3 py-2 min-h-[42px] max-h-32 border border-gray-200 focus-within:border-[#0A66C2] focus-within:ring-1 focus-within:ring-[#0A66C2] transition-all">
            {/* Text Area */}
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

            {/* Emoji Picker Button */}
            <div className="flex items-center gap-2 mb-0.5 ml-2 relative">
              <div ref={emojiPickerRef} className="relative">
                <button
                  type="button"
                  className="text-gray-400 hover:text-[#0A66C2] transition-colors"
                  disabled={isInputDisabled}
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
          {message.trim() ? (
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
              disabled={isInputDisabled} // Allow recording even if offline (upload will fail later, but UX is better)
              className="mb-[5px] p-2 text-gray-400 hover:text-[#0A66C2] transition-colors disabled:opacity-50"
              onClick={() => {
                console.log("Mic clicked, starting recording...");
                handleStartVoiceRecording();
              }}
              title="Record voice message"
            >
              <Mic className="w-6 h-6" />
            </button>
          )}
        </>
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
