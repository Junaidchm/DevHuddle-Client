import React, { useState } from "react";
import { Ban, Check, CheckCheck, FileText, Download, Play, Pause, Loader2, AlertCircle } from "lucide-react";
import { Message, GetMessagesResponse } from "@/src/types/chat.types";
import { InfiniteData } from "@tanstack/react-query";
import Image from "next/image";

import { MessageActionsMenu } from "./MessageActionsMenu";
import { 
  addReaction, 
  removeReaction, 
  pinMessage, 
  unpinMessage, 
  deleteMessage
} from "@/src/services/api/chat.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/src/lib/queryKeys";
import { cn } from "@/src/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { PROFILE_DEFAULT_URL } from "@/src/constants";
import { Forward } from "lucide-react";
import { formatSystemMessage } from "@/src/lib/chat-utils";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  senderName?: string;
  senderAvatar?: string;
  onReply?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  // Selection & Forwarding
  onForward?: () => void;
  onSelect?: () => void;
  isSelected?: boolean;
  selectionMode?: boolean;
  isBlocked?: boolean;
  participants?: any[];
}

export function MessageBubble({ 
  message, 
  isOwn, 
  showAvatar, 
  senderName, 
  senderAvatar,
  onReply,
  onEdit,
  onForward,
  onSelect,
  isSelected,
  selectionMode,
  isBlocked,
  participants
}: MessageBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const authHeaders = useAuthHeaders();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const currentUserId = session?.user?.id;

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

  // --- Handlers ---
  const handleReact = async (msg: Message, emoji: string) => {
    if (!currentUserId || isBlocked) return;

    // 1. Find ANY existing reaction by this user on this message
    const existingReaction = msg.reactions?.find((r) => r.userId === currentUserId);
    
    // 2. Determine action
    const isTogglingOff = existingReaction?.emoji === emoji;
    const isReplacing = existingReaction && existingReaction.emoji !== emoji;

    // --- Optimistic Update ---
    const queryKey = queryKeys.chat.messages.list(msg.conversationId);
    
    // Cancel any outgoing refetches
    await queryClient.cancelQueries({ queryKey });

    // Snapshot the previous value
    const previousData = queryClient.getQueryData(queryKey);

    // Optimistically update to the new value
    queryClient.setQueryData(queryKey, (oldData: any) => {
      if (!oldData || !oldData.pages) return oldData;

      const newPages = oldData.pages.map((page: any) => ({
        ...page,
        messages: page.messages.map((m: Message) => {
          if (m.id === msg.id) {
            let newReactions = m.reactions || [];

            if (isTogglingOff) {
                // Remove the reaction
                newReactions = newReactions.filter(r => r.userId !== currentUserId);
            } else if (isReplacing) {
                // Remove old, add new
                newReactions = newReactions.filter(r => r.userId !== currentUserId);
                newReactions.push({
                    id: `temp-${Date.now()}`,
                    messageId: msg.id,
                    userId: currentUserId,
                    emoji,
                    createdAt: new Date().toISOString(),
                });
            } else {
                // Add new
                newReactions.push({
                    id: `temp-${Date.now()}`,
                    messageId: msg.id,
                    userId: currentUserId,
                    emoji,
                    createdAt: new Date().toISOString(),
                });
            }

            return {
              ...m,
              reactions: newReactions,
            };
          }
          return m;
        }),
      }));

      return { ...oldData, pages: newPages };
    });

    try {
        // We always call addReaction as the backend now handles toggling/replacing logic
        // This keeps the client simple and consistent with backend state
        await addReaction(msg.id, emoji, authHeaders);
    } catch (error) {
        console.error("Failed to react", error);
        // Rollback on error
        queryClient.setQueryData(queryKey, previousData);
    }
  };

  const handleDelete = async (msg: Message, forEveryone: boolean) => {
    console.log(`[MessageBubble] handleDelete: messageId=${msg.id}, forEveryone=${forEveryone}, conversationId=${msg.conversationId}`);
    const queryKey = queryKeys.chat.messages.list(msg.conversationId);
    console.log(`[MessageBubble] Using queryKey:`, queryKey);
    const previousData = queryClient.getQueryData(queryKey);
    console.log(`[MessageBubble] Previous cache data exists:`, !!previousData);

    // Optimistically update the cache
    queryClient.setQueryData<InfiniteData<GetMessagesResponse>>(queryKey, (oldData) => {
      console.log(`[MessageBubble] setQueryData trigger. oldData exists:`, !!oldData);
      if (!oldData) return oldData;
      const newPages = oldData.pages.map(page => ({
        ...page,
        messages: page.messages 
          ? (forEveryone 
            ? page.messages.map((m: Message) => m.id === msg.id ? { ...m, deletedForAll: true, content: "This message was deleted" } : m)
            : page.messages.filter((m: Message) => m.id !== msg.id))
          : []
      }));
      return { ...oldData, pages: newPages };
    });

    try {
        await deleteMessage(msg.id, forEveryone, authHeaders);
        console.log(`[MessageBubble] deleteMessage API success`);
        // Invalidate conversation list to update last message preview if needed
        queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations.all });
    } catch (error) {
        console.error("Failed to delete", error);
        // Rollback on error
        queryClient.setQueryData(queryKey, previousData);
    }
  };

  const handlePin = async (msg: Message) => {
    try {
        await pinMessage(msg.conversationId, msg.id, authHeaders);
    } catch (error) {
        console.error("Failed to pin", error);
    }
  };

  const handleUnpin = async (msg: Message) => {
      try {
          await unpinMessage(msg.conversationId, msg.id, authHeaders);
      } catch (error) {
          console.error("Failed to unpin", error);
      }
  }


  // Render delivery status (WhatsApp-style checkmarks)
  const renderStatus = () => {
    if (!isOwn) return null;
    
    if (message.status === "FAILED") {
       return <AlertCircle className="w-4 h-4 text-destructive" />; 
    } else if (message.status === "read" || message.status === "READ") {
      return <CheckCheck className="w-4 h-4 text-blue-400" />; // Blue checkmarks for read
    } else if (message.status === "delivered" || message.status === "DELIVERED") {
      return <CheckCheck className="w-4 h-4 text-gray-400" />; // Gray double checkmark
    } else if (message.status === "sent" || message.status === "SENT") {
      return <Check className="w-4 h-4 text-gray-400" />; // Gray single checkmark
    }
    return <Check className="w-4 h-4 text-gray-300" />; // Sending
  };

  // Render content based on message type
  const renderContent = () => {
    if (message.deletedForAll) {
      return (
        <div className="flex items-center gap-2 italic text-sm opacity-60">
          <Ban className="h-3 w-3" />
          <span>This message was deleted</span>
        </div>
      );
    }

    switch (message.type) {
      case 'IMAGE':
      case 'CHAT_IMAGE':
        return (
          <div className="mb-1">
            <div 
              onClick={() => message.status?.toLowerCase() !== 'sending' && setShowLightbox(true)}
              className={cn(
                "relative w-full max-w-[300px] sm:max-w-[400px] rounded-lg overflow-hidden bg-gray-100 transition-opacity",
                message.status?.toLowerCase() !== 'sending' ? "cursor-pointer hover:opacity-95" : "cursor-default"
              )}
            >
              {message.status?.toLowerCase() === 'sending' && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                   <div className="p-2 bg-black/40 rounded-full">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                   </div>
                </div>
              )}
              <img 
                src={message.mediaUrl || ''} 
                alt="Image" 
                className={cn(
                    "w-full h-auto object-contain max-h-[400px]",
                    message.status?.toLowerCase() === 'sending' && "blur-[2px] blur-sm"
                )}
                loading="lazy"
              />
            </div>
            {message.content && <p className="mt-1 text-sm">{message.content}</p>}
            
            {/* Lightbox Modal */}
            {showLightbox && (
              <div 
                className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-default"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLightbox(false);
                }}
              >
                <div className="relative max-w-4xl max-h-screen w-full flex flex-col items-center">
                   <img 
                    src={message.mediaUrl || ''} 
                    alt="Full View" 
                    className="max-w-full max-h-[85vh] object-contain rounded-sm"
                  />
                  <div className="mt-4 flex gap-4">
                     <a 
                       href={message.mediaUrl} 
                       download 
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
                       onClick={(e) => e.stopPropagation()}
                     >
                       <Download className="w-4 h-4" />
                       <span className="text-sm">Download</span>
                     </a>
                     <button 
                       onClick={() => setShowLightbox(false)}
                       className="px-4 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors text-sm"
                     >
                       Close
                     </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'VIDEO':
      case 'CHAT_VIDEO':
        return (
          <div className="mb-1">
            <div className="relative w-full max-w-[300px] aspect-video rounded-lg overflow-hidden bg-black">
              {message.status?.toLowerCase() === 'sending' && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                   <div className="p-2 bg-black/40 rounded-full">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                   </div>
                </div>
              )}
              <video 
                src={message.mediaUrl} 
                className={cn(
                    "w-full h-full object-contain",
                    message.status?.toLowerCase() === 'sending' && "blur-sm"
                )}
              />
            </div>
            {message.content && <p className="mt-1 text-sm">{message.content}</p>}
          </div>
        );
        
      case 'AUDIO':
      case 'CHAT_AUDIO':
        return (
          <div className={cn(
              "relative flex items-center gap-3 p-3 rounded-lg min-w-[200px] overflow-hidden",
              isOwn ? 'bg-[#005c4b]/10' : 'bg-gray-100'
          )}>
            {message.status?.toLowerCase() === 'sending' && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/30 backdrop-blur-[2px]">
                   <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
            )}
            <div className={cn("flex-shrink-0", message.status?.toLowerCase() === 'sending' && "blur-[1px]")}>
                <button 
                  onClick={() => {
                    const audio = document.getElementById(`audio-${message.id}`) as HTMLAudioElement;
                    if (audio) {
                      if (isPlaying) audio.pause();
                      else audio.play();
                      setIsPlaying(!isPlaying);
                    }
                  }}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isOwn ? 'bg-[#0A66C2] text-white hover:bg-[#004182]' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                </button>
             </div>
             <div className={cn("flex-1 min-w-0 flex flex-col justify-center gap-1", message.status?.toLowerCase() === 'sending' && "blur-[1px]")}>
                <audio 
                  id={`audio-${message.id}`}
                  src={message.mediaUrl}
                  onEnded={() => setIsPlaying(false)}
                  onPause={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  className="hidden"
                />
                <div className="h-1 bg-gray-300 rounded-full overflow-hidden w-full">
                   {/* Simplified progress bar - for full feature use a proper progress state */}
                   <div className={`h-full ${isOwn ? 'bg-[#0A66C2]/40' : 'bg-gray-400'} w-0`} style={{ width: '0%', transition: 'width 0.1s linear' }} id={`progress-${message.id}`} />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 font-medium">
                  <span id={`time-${message.id}`}>0:00</span>
                  <span>{message.mediaDuration ? new Date(message.mediaDuration * 1000).toISOString().substr(14, 5) : "--:--"}</span>
                </div>
             </div>
             
             {/* Script to update progress - lightweight approach without extra state rerenders */}
             <script dangerouslySetInnerHTML={{__html: `
                (function() {
                  const audio = document.getElementById('audio-${message.id}');
                  const progress = document.getElementById('progress-${message.id}');
                  const time = document.getElementById('time-${message.id}');
                  
                  if (audio && progress && time) {
                    audio.ontimeupdate = () => {
                      const pct = (audio.currentTime / audio.duration) * 100;
                      progress.style.width = pct + '%';
                      
                      const mins = Math.floor(audio.currentTime / 60);
                      const secs = Math.floor(audio.currentTime % 60);
                      time.textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;
                    };
                  }
                })();
             `}} />
          </div>
        );

      case 'FILE':
      case 'CHAT_FILE':
        return (
          <div className="mb-1">
            <div className={cn(
                "relative flex items-center gap-3 p-3 rounded-lg overflow-hidden",
                isOwn ? 'bg-[#005c4b]/10' : 'bg-gray-100'
            )}>
              {message.status?.toLowerCase() === 'sending' && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/30 backdrop-blur-[2px]">
                   <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              )}
              <div className={cn(
                  "p-2 bg-red-100 rounded-lg text-red-500",
                  message.status?.toLowerCase() === 'sending' && "blur-[1px]"
              )}>
                <FileText className="w-6 h-6" />
              </div>
              <div className={cn(
                  "flex-1 min-w-0",
                  message.status?.toLowerCase() === 'sending' && "blur-[1px]"
              )}>
                <p className="text-sm font-medium truncate">{message.mediaName || "File"}</p>
                <p className="text-xs opacity-70">{(message.mediaSize ? (Number(message.mediaSize) / 1024).toFixed(1) : 0)} KB • {message.mediaMimeType?.split('/')[1]?.toUpperCase()}</p>
              </div>
              {message.status?.toLowerCase() !== 'sending' && (
                <a href={message.mediaUrl} download target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
                    <Download className="w-4 h-4 text-gray-600" />
                </a>
              )}
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
    <>
      {message.type === 'SYSTEM' ? (
        <div className="flex w-full justify-center my-4">
          <div className="bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 text-xs px-3 py-1.5 rounded-lg text-center max-w-[80%] inline-flex items-center gap-2">
            <Ban className="w-3.5 h-3.5" />
            <span>
                {formatSystemMessage(message.content, participants, currentUserId)}
            </span>
          </div>
        </div>
      ) : (
    <div 
        className={cn(
            "flex w-full mb-1 group relative", 
            isOwn ? "justify-end" : "justify-start",
            selectionMode && "cursor-pointer"
        )}
        onClick={() => selectionMode && onSelect?.()}
    >
      {/* Selection Overlay/Checkbox */}
      {selectionMode && (
        <div className={cn(
            "absolute inset-0 z-10 transition-colors",
            isSelected ? "bg-primary/10" : "hover:bg-muted/30"
        )}>
            <div className={cn(
                "absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                isOwn ? "left-4" : "right-4",
                isSelected ? "bg-primary border-primary" : "border-muted-foreground/30 bg-background"
            )}>
                {isSelected && <Check className="h-3 w-3 text-white stroke-[3px]" />}
            </div>
        </div>
      )}

      {!isOwn && (showAvatar || senderAvatar) && (
        <div className="mr-2 flex-shrink-0 mt-auto">
          <Avatar className="h-8 w-8 border border-border shadow-sm">
            <AvatarImage src={senderAvatar || PROFILE_DEFAULT_URL} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                {senderName?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      <div className={cn(
        "flex flex-col max-w-[75%] md:max-w-[65%] gap-1",
        isOwn ? "items-end" : "items-start"
      )}>
        {/* Sender Name (for group chats) */}
        {!isOwn && senderName && (
          <span className="text-[10px] font-bold text-primary/80 ml-3 mb-0.5 uppercase tracking-wider">
            {senderName}
          </span>
        )}

        {/* Message Content Container */}
        <div className="relative group/bubble">
          {/* Actions Menu (only show if not in selection mode) */}
          {!selectionMode && (
            <div className={cn(
                "absolute top-0 z-20 opacity-0 group-hover/bubble:opacity-100 transition-opacity",
                isOwn ? "-left-12" : "-right-12"
            )}>
                <MessageActionsMenu 
                    message={message} 
                    isOwn={isOwn}
                    onReply={(m) => onReply?.(m)}
                    onEdit={(m) => onEdit?.(m)}
                    onForward={onForward}
                    onDelete={handleDelete}
                    onReact={handleReact}
                    onPin={handlePin}
                    onUnpin={handleUnpin}
                    isPinned={message.isPinned}
                    isBlocked={isBlocked}
                />
            </div>
          )}

          <div
            className={cn(
              "p-3 shadow-md transition-all",
              isOwn 
                ? "bg-primary text-white rounded-2xl rounded-tr-none" 
                : "bg-card text-foreground rounded-2xl rounded-tl-none border border-border/50",
              isSelected && "ring-2 ring-primary ring-offset-2"
            )}
          >
            {/* Forwarded Label */}
            {message.isForwarded && (
                <div className={cn(
                    "flex items-center gap-1 mb-1 italic text-[10px] opacity-70",
                    isOwn ? "text-white/90" : "text-muted-foreground"
                )}>
                    <Forward className="h-3 w-3" />
                    <span>Forwarded</span>
                </div>
            )}

            {/* Reply Preview */}
            {message.replyTo && (
              <div 
                className={cn(
                  "mb-2 p-2 rounded-lg text-xs border-l-4 cursor-pointer",
                  isOwn 
                    ? "bg-white/10 border-white/40 text-white/90" 
                    : "bg-muted/50 border-primary/40 text-muted-foreground"
                )}
                onClick={(e) => {
                    e.stopPropagation();
                    const el = document.getElementById(`message-${message.replyToId}`);
                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                <p className="font-bold mb-1">
                    {message.replyTo.senderId === currentUserId ? 'You' : 'Reply'}
                </p>
                <p className="truncate opacity-80">{message.replyTo.content}</p>
              </div>
            )}
            
            {/* Message content with timestamp inline */}
            <div className="flex flex-col">
              {renderContent()}
              
              {/* Reactions Display */}
              {message.reactions && message.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1 -ml-1">
                      {message.reactions.map((reaction: any, i: number) => (
                          <span key={i} className="bg-black/5 rounded-full px-1.5 py-0.5 text-[10px]">
                              {reaction.emoji}
                          </span>
                      ))}
                  </div>
              )}

              {/* Timestamp + Status (WhatsApp style) */}
              <div className={cn(
                "flex items-center gap-1 justify-end mt-1",
                isOwn ? 'text-blue-100' : 'text-gray-500'
              )}>
                {message.isPinned && <span className="opacity-70 text-[10px] mr-1">📌</span>}
                <span className="text-[11px] leading-none">{formatTime(message.createdAt)}</span>
                {renderStatus()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for sent messages */}
      {isOwn && <div className="w-8" />}
    </div>
      )}
    </>
  );
}
