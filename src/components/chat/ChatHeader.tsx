"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Phone, Video, MoreVertical, AlertCircle, Users } from "lucide-react";
import { ConversationWithMetadata } from "@/src/types/chat.types";
import { PROFILE_DEFAULT_URL } from "@/src/constants";
import { useVideoCall } from "@/src/contexts/VideoCallContext";

interface ChatHeaderProps {
  conversation: ConversationWithMetadata | null;
  currentUserId: string;
  isConnected: boolean;
  onViewInfo?: () => void;
}

export function ChatHeader({ 
  conversation, 
  currentUserId, 
  isConnected,
  onViewInfo 
}: ChatHeaderProps) {
  const { data: session } = useSession();
  const { startCall } = useVideoCall();
  const validCurrentUserId = currentUserId || session?.user?.id;

  if (!conversation) return null;

  const isGroup = conversation.type === 'GROUP';
  
  // For Direct messages, find the other participant
  // If no other participant found (e.g. self chat), fall back to the first participant (self)
  const otherParticipant = !isGroup 
    ? (conversation.participants.find(p => p.userId !== validCurrentUserId) || conversation.participants[0])
    : null;

  // Get participant details from flat ConversationParticipant structure
  const getParticipantName = (p: any) => p?.name;
  const getParticipantUsername = (p: any) => p?.username;
  const getParticipantPhoto = (p: any) => p?.profilePhoto;

  const title = isGroup 
    ? conversation.name || "Group Chat"
    : getParticipantName(otherParticipant) || getParticipantUsername(otherParticipant) || "Unknown User";

  const image = isGroup
    ? conversation.icon
    : getParticipantPhoto(otherParticipant) || PROFILE_DEFAULT_URL;

  const subtitle = isGroup
    ? `${conversation.participants.length} members` 
    : "Online"; // Fixed online status for now

  // Fallback for avatar
  const fallback = isGroup 
    ? (conversation.name?.[0] || 'G').toUpperCase()
    : (title?.[0] || 'U').toUpperCase();

  const handleAudioCall = () => {
    if (conversation?.conversationId) {
      startCall(conversation.conversationId, false); // Audio only
    } else {
      console.error("Critical: Start call failed - Missing conversation ID", conversation);
    }
  };

  const handleVideoCall = () => {
    if (conversation?.conversationId) {
      startCall(conversation.conversationId, true); // Video call
    } else {
      console.error("Critical: Start call failed - Missing conversation ID", conversation);
    }
  };

  return (
    <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm h-[73px]">
      <div 
        className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 -ml-2 rounded-lg transition-colors"
        onClick={onViewInfo}
      >
        <Avatar className="w-10 h-10 border border-border">
          <AvatarImage src={image || undefined} alt={title} className="object-cover" />
          <AvatarFallback className={isGroup ? "bg-primary/10 text-primary" : ""}>
            {isGroup && !image ? <Users className="w-5 h-5" /> : fallback}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col">
          <h3 className="font-semibold text-foreground leading-none mb-1">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground leading-none">
             {subtitle}
          </p>
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
          title="Audio Call"
        >
            <Phone className="w-5 h-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full text-muted-foreground hover:text-foreground"
          onClick={handleVideoCall}
          title="Video Call"
        >
            <Video className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground" onClick={onViewInfo}>
            <MoreVertical className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
