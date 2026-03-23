"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Phone, Video, MoreVertical, AlertCircle, Users, ChevronLeft, ShieldAlert } from "lucide-react";
import { ConversationWithMetadata } from "@/src/types/chat.types";
import { PROFILE_DEFAULT_URL } from "@/src/constants";
import { Badge } from "@/src/components/ui/badge";
import { useVideoCall } from "@/src/contexts/VideoCallContext";
import { GroupCallParticipantSelector } from "./call/GroupCallParticipantSelector";

interface ChatHeaderProps {
  conversation: ConversationWithMetadata | null;
  currentUserId: string;
  isConnected: boolean;
  onViewInfo?: () => void;
  onBack?: () => void;
}

export function ChatHeader({ 
  conversation, 
  currentUserId, 
  isConnected,
  onViewInfo,
  onBack
}: ChatHeaderProps) {
  const { data: session } = useSession();
  const { startCall } = useVideoCall();
  const validCurrentUserId = currentUserId || session?.user?.id;

  const [selectorOpen, setSelectorOpen] = useState(false);
  const [pendingCallType, setPendingCallType] = useState<boolean>(false); // isVideoCall

  if (!conversation) return null;

  const isGroup = conversation.type === 'GROUP';
  
  // For Direct messages, find the other participant
  const otherParticipant = !isGroup 
    ? (conversation.participants.find(p => p.userId !== validCurrentUserId) || conversation.participants[0])
    : null;

  const getParticipantName = (p: any) => p?.name;
  const getParticipantUsername = (p: any) => p?.username;
  const getParticipantPhoto = (p: any) => p?.profilePhoto;

  const title = isGroup 
    ? conversation.name || "Group Chat"
    : getParticipantName(otherParticipant) || getParticipantUsername(otherParticipant) || "Unknown User";

  const image = isGroup
    ? conversation.icon
    : getParticipantPhoto(otherParticipant) || PROFILE_DEFAULT_URL;

  const onlineCount = conversation.participants.filter(p => p.userId !== validCurrentUserId && p.isOnline).length;
  
  const subtitle = isGroup
    ? `${conversation.memberCount ?? conversation.participants.length} members${onlineCount > 0 ? `, ${onlineCount} online` : ''}` 
    : (otherParticipant?.isOnline ? "Active now" : "Offline");

  const fallback = isGroup 
    ? (conversation.name?.[0] || 'G').toUpperCase()
    : (title?.[0] || 'U').toUpperCase();

  const isBlocked = conversation.isBlockedByMe || conversation.isBlockedByThem;
  const convId = conversation.conversationId || (conversation as any).id;

  const handleAudioCall = () => {
    if (isBlocked || !convId) return;
    if (isGroup) {
      // Show participant selector for group calls
      setPendingCallType(false);
      setSelectorOpen(true);
    } else {
      startCall(convId, false);
    }
  };

  const handleVideoCall = () => {
    if (isBlocked || !convId) return;
    if (isGroup) {
      // Show participant selector for group calls
      setPendingCallType(true);
      setSelectorOpen(true);
    } else {
      startCall(convId, true);
    }
  };

  const handleSelectorConfirm = (selectedIds: string[]) => {
    setSelectorOpen(false);
    if (convId && selectedIds.length > 0) {
      startCall(convId, pendingCallType, selectedIds);
    }
  };

  return (
    <>
      <div className="bg-card border-b border-border px-3 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm h-[73px]">
        <div className="flex items-center gap-1 md:gap-3 min-w-0">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden -ml-4 shrink-0 rounded-full"
              onClick={onBack}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          )}
          <div 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:bg-muted/50 p-2 -ml-2 rounded-lg transition-colors min-w-0 overflow-hidden"
            onClick={onViewInfo}
          >
            <Avatar className="w-10 h-10 border border-border">
              <AvatarImage src={image || undefined} alt={title} className="object-cover" />
              <AvatarFallback className={isGroup ? "bg-primary/10 text-primary" : ""}>
                {isGroup && !image ? <Users className="w-5 h-5" /> : fallback}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground leading-none truncate">
                  {title}
                </h3>
                {conversation.isSuspended && (
                  <Badge variant="destructive" className="h-4 px-1.5 py-0 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                    <ShieldAlert className="w-2.5 h-2.5" />
                    Suspended
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-none">
                 {subtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isConnected && (
              <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full text-xs mr-2">
                <AlertCircle className="w-3 h-3" />
                Disconnected
              </div>
          )}

          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full text-muted-foreground hover:text-foreground"
            onClick={handleAudioCall}
            title={isBlocked ? "Cannot call blocked users" : "Audio Call"}
            disabled={isBlocked}
          >
              <Phone className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full text-muted-foreground hover:text-foreground"
            onClick={handleVideoCall}
            title={isBlocked ? "Cannot call blocked users" : "Video Call"}
            disabled={isBlocked}
          >
              <Video className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground" onClick={onViewInfo}>
              <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Group Call Participant Selector Modal */}
      {isGroup && validCurrentUserId && selectorOpen && (
        <GroupCallParticipantSelector
          open={selectorOpen}
          isVideoCall={pendingCallType}
          participants={conversation.participants}
          currentUserId={validCurrentUserId}
          onConfirm={handleSelectorConfirm}
          onClose={() => setSelectorOpen(false)}
        />
      )}
    </>
  );
}
