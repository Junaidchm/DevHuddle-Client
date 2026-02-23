"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Phone, Video, Users } from "lucide-react";
import { ConversationParticipant } from "@/src/types/chat.types";
import { PROFILE_DEFAULT_URL } from "@/src/constants";

interface GroupCallParticipantSelectorProps {
  open: boolean;
  isVideoCall: boolean;
  participants: ConversationParticipant[];
  currentUserId: string;
  onConfirm: (selectedIds: string[]) => void;
  onClose: () => void;
}

export function GroupCallParticipantSelector({
  open,
  isVideoCall,
  participants,
  currentUserId,
  onConfirm,
  onClose,
}: GroupCallParticipantSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    // Pre-select all other participants by default (like WhatsApp)
    const others = participants.filter((p) => p.userId !== currentUserId);
    return new Set(others.map((p) => p.userId));
  });

  const otherParticipants = participants.filter((p) => p.userId !== currentUserId);

  const toggle = (userId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleCallAll = () => {
    const allIds = otherParticipants.map((p) => p.userId);
    onConfirm(allIds);
  };

  const handleCallSelected = () => {
    if (selectedIds.size === 0) return;
    onConfirm(Array.from(selectedIds));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            {isVideoCall ? (
              <Video className="w-5 h-5 text-primary" />
            ) : (
              <Phone className="w-5 h-5 text-primary" />
            )}
            {isVideoCall ? "Video Call" : "Voice Call"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Select who you want to call
          </p>
        </DialogHeader>

        {/* Participants list */}
        <div className="max-h-72 overflow-y-auto space-y-1 py-2">
          {otherParticipants.length === 0 && (
            <div className="text-center text-muted-foreground py-6 text-sm">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No other participants to call
            </div>
          )}
          {otherParticipants.map((p) => {
            const isChecked = selectedIds.has(p.userId);
            const displayName = p.name || p.username || "Unknown";
            const initial = displayName[0]?.toUpperCase() || "?";

            return (
              <label
                key={p.userId}
                htmlFor={`participant-${p.userId}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-muted/60 transition-colors"
              >
                <Checkbox
                  id={`participant-${p.userId}`}
                  checked={isChecked}
                  onCheckedChange={() => toggle(p.userId)}
                  className="border-border"
                />
                <Avatar className="w-9 h-9 border border-border flex-shrink-0">
                  <AvatarImage src={p.profilePhoto || PROFILE_DEFAULT_URL} alt={displayName} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-foreground truncate">
                    {displayName}
                  </span>
                  {p.username && p.name && (
                    <span className="text-xs text-muted-foreground truncate">
                      @{p.username}
                    </span>
                  )}
                </div>
              </label>
            );
          })}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t border-border">
          {/* Select all shortcut */}
          {otherParticipants.length > 0 && selectedIds.size !== otherParticipants.length && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCallAll}
              className="text-muted-foreground text-xs sm:mr-auto"
            >
              Call everyone
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleCallSelected}
            disabled={selectedIds.size === 0}
            className="gap-2"
          >
            {isVideoCall ? (
              <Video className="w-4 h-4" />
            ) : (
              <Phone className="w-4 h-4" />
            )}
            Call ({selectedIds.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
