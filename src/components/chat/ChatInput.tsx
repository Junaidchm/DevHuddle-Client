"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Smile, Mic, Pause, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { MediaUploadButton } from "./MediaUploadButton";
import { useSendMessage } from "@/src/hooks/chat/useSendMessage";
import { useSession } from "next-auth/react";
import { useVoiceRecording } from "@/src/hooks/chat/useVoiceRecording";
import { WaveformVisualizer } from "./WaveformVisualizer";
import { VoicePreviewPlayer } from "./VoicePreviewPlayer";
import { Button } from "@/src/components/ui/button";

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
  
  const { data: session } = useSession();
  const { sendMessage, isConnected } = useSendMessage();

  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled || !isConnected || !session?.user?.id) return;

    const content = message.trim();
    
    // Send via Hook (Handles optimistic updates)
    await sendMessage({
        conversationId,
        content,
        type: 'TEXT'
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
       await sendMessage({
        conversationId,
        content: "",
        type: 'AUDIO', // Assuming AUDIO type exists in backend/types
        mediaDetails: {
            mediaId: result.mediaId,
            mediaUrl: result.mediaUrl,
            duration: result.duration
        }
       });
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
    <form onSubmit={handleSubmit} className="px-4 py-3 bg-white border-t border-border flex items-end gap-2 text-foreground">
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
        <div className="flex-1 flex items-center gap-4 px-2 py-1 w-full text-foreground">
          {/* Trash icon (Left) */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleDiscardVoiceRecording}
            className="flex-shrink-0 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="Discard recording"
          >
            <Trash2 className="w-5 h-5" />
          </Button>

          {/* Timer + Red Pulse */}
          <div className="flex items-center gap-2 min-w-[65px]">
            <div className={`w-2.5 h-2.5 bg-red-500 rounded-full ${recordingState === 'recording' ? 'animate-pulse' : ''}`}></div>
            <span className="text-foreground font-mono text-[15px] tabular-nums">
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
            <Button
               type="button"
               variant="ghost"
               size="icon"
               onClick={handlePauseRecording}
               className="text-red-500 hover:bg-red-50 rounded-full"
               title={recordingState === 'paused' ? 'Resume' : 'Pause'}
            >
               {recordingState === 'paused' ? (
                 <Mic className="w-6 h-6" /> 
               ) : (
                 <Pause className="w-6 h-6 fill-current" />
               )}
            </Button>

            {/* Stop/Review Button */}
            <Button
               type="button"
               onClick={handleStopRecording}
               className="bg-red-500 text-white hover:bg-red-600 rounded-full shadow-sm w-10 h-10 p-0 flex items-center justify-center"
               title="Stop and review"
            >
               <div className="w-4 h-4 bg-white rounded-sm" /> 
            </Button>
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
          <div className="flex-1 bg-muted/40 rounded-2xl flex items-end px-3 py-2 min-h-[42px] max-h-32 border border-input focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
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
              className="flex-1 bg-transparent border-none text-[15px] text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-0 max-h-32 py-1 min-h-[24px] leading-relaxed"
            />

            {/* Emoji Picker Button */}
            <div className="flex items-center gap-2 mb-0.5 ml-2 relative">
              <div ref={emojiPickerRef} className="relative">
                <button
                  type="button"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  disabled={isInputDisabled}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  title="Add emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>

                {/* LinkedIn-style Emoji Picker Popover */}
                {showEmojiPicker && (
                  <div className="absolute bottom-12 right-0 z-50 shadow-2xl rounded-lg overflow-hidden border border-border bg-background">
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
            <Button
              type="submit"
              disabled={!canSend}
              size="icon"
              className={`
                mb-[5px] rounded-full transition-all w-10 h-10
                ${canSend 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
                }
              `}
              title={!isConnected ? "Connecting..." : !session?.user?.id ? "Loading..." : "Send message"}
            >
              <Send className="w-5 h-5" /> 
            </Button>
          ) : (
            /* Voice Recording Button */
            <Button
              type="button"
              disabled={isInputDisabled}
              variant="ghost"
              size="icon"
              className="mb-[5px] text-muted-foreground hover:text-primary hover:bg-muted rounded-full w-10 h-10"
              onClick={() => {
                console.log("Mic clicked, starting recording...");
                handleStartVoiceRecording();
              }}
              title="Record voice message"
            >
              <Mic className="w-6 h-6" />
            </Button>
          )}
        </>
      )}

      {/* Recording Error Toast */}
      {recordingError && (
        <div className="absolute bottom-20 right-4 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-2 rounded-lg shadow-lg">
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
