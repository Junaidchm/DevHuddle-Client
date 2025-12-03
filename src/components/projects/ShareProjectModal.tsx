"use client";

import React, { useState } from "react";
import { X, Share2, Link2, Copy, Check } from "lucide-react";
import { useShareProjectMutation } from "./hooks/useShareProjectMutation";
import toast from "react-hot-toast";

interface ShareProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
}

export default function ShareProjectModal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
}: ShareProjectModalProps) {
  const [shareType, setShareType] = useState<"SHARE" | "QUOTE">("SHARE");
  const [caption, setCaption] = useState("");
  const [copied, setCopied] = useState(false);
  const shareMutation = useShareProjectMutation(projectId);

  if (!isOpen) return null;

  const projectUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/projects/${projectId}`
    : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(projectUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await shareMutation.mutateAsync({
        shareType,
        caption: caption.trim() || undefined,
      });
      onClose();
      setCaption("");
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Share Project</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleShare} className="p-4">
          {/* Share Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShareType("SHARE")}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                  shareType === "SHARE"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Share2 className="w-5 h-5" />
                <span className="text-sm font-medium">Share</span>
              </button>
              <button
                type="button"
                onClick={() => setShareType("QUOTE")}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                  shareType === "QUOTE"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Share2 className="w-5 h-5" />
                <span className="text-sm font-medium">Quote</span>
              </button>
            </div>
          </div>

          {/* Caption/Comment for Quote */}
          {shareType === "QUOTE" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add a comment
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Say something about this project..."
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {caption.length}/500
              </div>
            </div>
          )}

          {/* Copy Link Section */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Project Link
              </label>
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border">
              <Link2 className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={projectUrl}
                readOnly
                className="flex-1 text-sm text-gray-600 bg-transparent border-none outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={shareMutation.isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {shareMutation.isPending ? "Sharing..." : "Share"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

