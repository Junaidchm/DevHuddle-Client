"use client";

import React, { useState, useEffect } from "react";
import { X, Search, Loader2, Users } from "lucide-react";
import { useChatSuggestions } from "@/src/hooks/chat/useChatSuggestions";
import { CreateGroupModal } from "./CreateGroupModal";
import { PROFILE_DEFAULT_URL } from "@/src/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";

interface User {
  id: string;
  username: string;
  fullName: string;
  profilePhoto?: string;
  bio?: string;
}

import { ConversationWithMetadata } from "@/src/types/chat.types";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserSelect: (userId: string) => void;
  onConversationSelect?: (conversation: ConversationWithMetadata) => void;
}

export function NewChatModal({ isOpen, onClose, onUserSelect, onConversationSelect }: NewChatModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Use TanStack Query hook for fetching
  const { data: rawSuggestions = [], isLoading } = useChatSuggestions();
  
  // Memoize the mapped users to avoid re-mapping on every render
  const suggestedUsers: User[] = React.useMemo(() => {
    return rawSuggestions.map((item: any) => ({
      id: item.id,
      username: item.username,
      fullName: item.fullName || item.name || item.username,
      profilePhoto: item.profilePhoto, // Backend returns profilePhoto
      bio: item.bio || item.headline || item.jobTitle, 
    }));
  }, [rawSuggestions]);

  // Filter users based on search query
  const filteredUsers = React.useMemo(() => {
    if (!searchQuery.trim()) return suggestedUsers;
    
    const query = searchQuery.toLowerCase();
    return suggestedUsers.filter(
      (user) =>
        user.fullName.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query)
    );
  }, [suggestedUsers, searchQuery]);

  const handleUserClick = (userId: string) => {
    onUserSelect(userId);
    onClose();
    setSearchQuery("");
  };

  const handleClose = () => {
    onClose();
    setSearchQuery("");
  };

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  // If group modal is open, we can hide this modal or render group modal on top.
  // Better to close this and open group modal, OR render conditionally.
  // Let's render conditionally inside this component if prop controlled, 
  // OR we can just have NewChatModal render CreateGroupModal when needed.
  
  if (isGroupModalOpen) {
      return (
          <CreateGroupModal 
            isOpen={isGroupModalOpen} 
            onClose={() => {
                setIsGroupModalOpen(false);
                onClose(); // Close parent as well? Or go back? Let's close parent logic for now.
            }} 
            onGroupCreated={(group) => {
                if (onConversationSelect) {
                    onConversationSelect(group);
                } else {
                    // Fallback to onUserSelect if parent doesn't handle groups directly (but try to pass ID)
                    onUserSelect(group.conversationId);
                }
                setIsGroupModalOpen(false);
            }} 
          />
      );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden flex flex-col max-h-[85vh]">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="text-xl font-semibold">New message</DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="px-6 py-2 border-b border-border">
          <div className="relative mb-3">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name or number"
              className="pl-9 bg-muted/40"
              autoFocus
            />
          </div>
          
          <button 
            onClick={() => setIsGroupModalOpen(true)}
            className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors text-left group"
          >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Users className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium text-foreground">New group</span>
          </button>
        </div>

        {/* Suggested Users List */}
        <div className="flex-1 overflow-y-auto px-2 py-2"> 
          <h3 className="text-xs font-semibold text-muted-foreground px-4 py-2 uppercase tracking-wider">Suggested</h3>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
              <p>Loading suggestions...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>
                {searchQuery ? "No users found" : "No suggestions available"}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 rounded-lg transition-colors text-left"
                >
                  {/* Avatar */}
                  <Avatar className="w-10 h-10 border border-border">
                     <AvatarImage src={user.profilePhoto || PROFILE_DEFAULT_URL} alt={user.fullName} className="object-cover" />
                     <AvatarFallback>{user.fullName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {user.fullName}
                    </p>
                    {user.bio && (
                      <p className="text-sm text-muted-foreground truncate">
                        {user.bio}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
