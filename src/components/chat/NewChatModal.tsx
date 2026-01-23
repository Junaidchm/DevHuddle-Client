"use client";

import React, { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { useChatSuggestions } from "@/src/hooks/chat/useChatSuggestions";

interface User {
  id: string;
  username: string;
  fullName: string;
  profilePhoto?: string;
  bio?: string;
}

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserSelect: (userId: string) => void;
}

export function NewChatModal({ isOpen, onClose, onUserSelect }: NewChatModalProps) {
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

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent scroll
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Transparent Click-Outside Overlay */}
      <div 
        className="fixed inset-0 z-40 bg-transparent"
        onClick={handleClose}
      />

      {/* Popover */}
      <div className="absolute top-16 left-2 z-50 w-[95%] max-w-sm">
        <div 
          className="bg-white rounded-lg shadow-2xl border border-gray-100 flex flex-col max-h-[70vh] animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">New message</h2>
            <button
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Search Input */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type a name or multiple names"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/10 transition-all text-gray-900 placeholder:text-gray-400"
                autoFocus
              />
            </div>
          </div>

          {/* Suggested Users List */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <h3 className="text-sm font-medium text-gray-600 mb-3">Suggested</h3>
            
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-[#0A66C2] rounded-full animate-spin" />
                <p className="text-gray-500 mt-3">Loading suggestions...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {searchQuery ? "No users found" : "No suggestions available"}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserClick(user.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {user.profilePhoto ? (
                        <img
                          src={user.profilePhoto}
                          alt={user.fullName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-lg">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {user.fullName}
                      </p>
                      {user.bio && (
                        <p className="text-sm text-gray-500 truncate">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
