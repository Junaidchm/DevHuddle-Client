"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { X, Search, Check, Loader2, Send, AlertCircle } from "lucide-react";
import { useSendPost } from "./Hooks/useSendPost";
import { useConnections } from "./Hooks/useConnections";
import Modal from "@/src/components/ui/Modal";
import { Connection } from "@/src/app/types/feed";
import { PROFILE_DEFAULT_URL } from "@/src/constents";
import useGetUserData from "@/src/customHooks/useGetUserData";
import { useQueryClient } from "@tanstack/react-query";
import { NewPost } from "@/src/app/types/feed";

interface SendPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  post?: NewPost; // Optional: to get post author name
}

/**
 * LinkedIn-style Send Post Modal
 * 
 * Features:
 * - Large, centered modal with full-screen overlay
 * - Searchable list of connections
 * - Multi-select with checkboxes
 * - Optional message input
 * - Smooth animations and transitions
 * - Perfect LinkedIn-style UI/UX
 */
export default function SendPostModal({
  isOpen,
  onClose,
  postId,
  post,
}: SendPostModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<Set<string>>(
    new Set()
  );
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const { data: connections, isLoading, error, refetch } = useConnections(isOpen);
  const sendMutation = useSendPost();
  const queryClient = useQueryClient();
  const currentUser = useGetUserData();

  // Get post author name for modal title
  const postAuthorName = useMemo(() => {
    if (post?.user?.name) return post.user.name;
    // Try to get from cache
    const cachedPost = queryClient.getQueryData<any>(["post", postId]);
    return cachedPost?.user?.name || "Post";
  }, [post, postId, queryClient]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSelectedRecipients(new Set());
      setMessage("");
      setErrorMessage(null);
    } else {
      // Clear any previous errors when modal opens
      // Connections will be fetched automatically when modal opens (enabled: isOpen)
      setErrorMessage(null);
    }
  }, [isOpen]);

  // Clear error when mutation resets or when user makes changes
  useEffect(() => {
    if (sendMutation.isSuccess || sendMutation.isIdle) {
      setErrorMessage(null);
    }
  }, [sendMutation.isSuccess, sendMutation.isIdle]);

  // Scroll to error when it appears
  useEffect(() => {
    if (errorMessage && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [errorMessage]);

  // Filter connections based on search query
  const filteredConnections = useMemo(() => {
    if (!connections || connections.length === 0) return [];

    if (!searchQuery.trim()) return connections;

    const query = searchQuery.toLowerCase().trim();
    return connections.filter(
      (conn) =>
        conn.name.toLowerCase().includes(query) ||
        conn.username?.toLowerCase().includes(query) ||
        conn.jobTitle?.toLowerCase().includes(query) ||
        conn.company?.toLowerCase().includes(query) ||
        conn.headline?.toLowerCase().includes(query)
    );
  }, [connections, searchQuery]);

  const handleToggleRecipient = useCallback((userId: string) => {
    setSelectedRecipients((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRecipients.size === 0) {
      setErrorMessage("Please select at least one connection to send the post to.");
      return;
    }

    // Clear any previous errors
    setErrorMessage(null);

    try {
      await sendMutation.mutateAsync({
        postId,
        recipientIds: Array.from(selectedRecipients),
        message: message.trim() || undefined,
      });
      // Only close on success
      onClose();
    } catch (error: any) {
      // Extract error message for display in modal
      const errorMsg = 
        error?.response?.data?.message ||
        error?.message ||
        error?.response?.data?.error ||
        "Failed to send post. Please try again.";
      
      setErrorMessage(errorMsg);
      console.error("[SendPostModal] Error in handleSubmit:", error);
      
      // Keep modal open so user can see the error and retry
      // Don't close the modal on error
    }
  };

  const getAvatarUrl = (connection: Connection) => {
    return connection.profilePicture || PROFILE_DEFAULT_URL;
  };

  const getHeadline = (connection: Connection) => {
    if (connection.headline) return connection.headline;
    const parts = [];
    if (connection.jobTitle) parts.push(connection.jobTitle);
    if (connection.company) parts.push(`at ${connection.company}`);
    return parts.length > 0 ? parts.join(" ") : null;
  };

  const selectedCount = selectedRecipients.size;
  const canSend = selectedCount > 0 && !sendMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Send className="w-5 h-5 text-gray-700" />
          <span>Send to connections</span>
        </div>
      }
      maxWidth="lg"
      closeOnBackdropClick={true}
      className="flex flex-col h-[90vh] max-h-[600px]"
    >
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Search Bar - LinkedIn Style */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search connections..."
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Connections List - LinkedIn Style */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0 bg-gray-50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
              <p className="text-sm text-gray-600 font-medium">Loading connections...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">Failed to load connections</p>
              <p className="text-xs text-gray-500 mb-4">Please try again later</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
              >
                Retry
              </button>
            </div>
          ) : filteredConnections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                {searchQuery
                  ? "No connections found"
                  : connections && connections.length === 0
                  ? "You don't have any connections yet"
                  : "No results"}
              </p>
              <p className="text-xs text-gray-500 text-center max-w-xs">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Start following people to send them posts"}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConnections.map((connection) => {
                const isSelected = selectedRecipients.has(connection.id);
                const headline = getHeadline(connection);
                
                return (
                  <button
                    key={connection.id}
                    type="button"
                    onClick={() => handleToggleRecipient(connection.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150 ${
                      isSelected
                        ? "bg-blue-50 hover:bg-blue-100 border border-blue-200"
                        : "hover:bg-white border border-transparent"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={getAvatarUrl(connection)}
                        alt={connection.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = PROFILE_DEFAULT_URL;
                        }}
                      />
                      {isSelected && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-semibold text-gray-900 text-sm truncate">
                        {connection.name}
                      </div>
                      {headline && (
                        <div className="text-xs text-gray-600 truncate mt-0.5">
                          {headline}
                        </div>
                      )}
                    </div>

                    {/* Checkbox - LinkedIn Style (on the right) */}
                    <div className="flex-shrink-0">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-blue-600 border-blue-600"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Error Message Display - LinkedIn Style */}
        {errorMessage && (
          <div ref={errorRef} className="px-6 pt-4">
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-md shadow-sm">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-900 mb-1">
                  Error sending post
                </p>
                <p className="text-sm text-red-700 break-words">
                  {errorMessage}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="flex-shrink-0 p-1 hover:bg-red-100 rounded-full transition-colors"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        )}

        {/* Message Input - LinkedIn Style */}
        <div className={`px-6 ${errorMessage ? 'pt-4' : 'py-4'} pb-4 border-t border-gray-200 bg-white`}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add a note (optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              // Clear error when user starts typing
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="Add a personal message..."
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm placeholder-gray-400"
            rows={3}
            maxLength={500}
          />
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500">
              {message.length}/500 characters
            </span>
            {selectedCount > 0 && (
              <span className="text-xs font-medium text-blue-600">
                {selectedCount} {selectedCount === 1 ? "connection" : "connections"} selected
              </span>
            )}
          </div>
        </div>

        {/* Footer Actions - LinkedIn Style */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={sendMutation.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSend}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold flex items-center justify-center gap-2 shadow-sm"
          >
            {sendMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send{selectedCount > 0 ? ` (${selectedCount})` : ""}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
