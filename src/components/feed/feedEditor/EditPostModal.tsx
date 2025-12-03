"use client";

import React, { useState, useEffect } from "react";
import { Image as ImageIcon, Trash2, History, RotateCcw } from "lucide-react";
import { useEditPost, usePostVersions, useRestorePostVersion, PostVersion } from "./Hooks/useEditPost";
import { NewPost } from "@/src/app/types/feed";
import toast from "react-hot-toast";
import Modal from "@/src/components/ui/Modal";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: NewPost;
}

interface Attachment {
  id: string;
  postId: string;
  type: string;
  url: string;
  createdAt: string;
}

export default function EditPostModal({
  isOpen,
  onClose,
  post,
}: EditPostModalProps) {
  const [content, setContent] = useState(post.content || "");
  const [attachments, setAttachments] = useState<Attachment[]>(
    post.attachments || []
  );
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<string[]>([]);
  const [newAttachmentIds, setNewAttachmentIds] = useState<string[]>([]);

  const editMutation = useEditPost();
  const { data: versions, isLoading: versionsLoading } = usePostVersions(
    showVersionHistory ? post.id : ""
  );
  const restoreMutation = useRestorePostVersion();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setContent(post.content || "");
      setAttachments(post.attachments || []);
      setRemovedAttachmentIds([]);
      setNewAttachmentIds([]);
      setShowVersionHistory(false);
    }
  }, [isOpen, post]);

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    setRemovedAttachmentIds((prev) => [...prev, attachmentId]);
  };

  const handleAddAttachment = () => {
    // TODO: Implement file upload logic similar to CreatePostModal
    // For now, this is a placeholder
    toast.info("File upload functionality coming soon. Use the existing media upload system.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && attachments.length === 0) {
      toast.error("Post must have content or media");
      return;
    }

    try {
      await editMutation.mutateAsync({
        postId: post.id,
        data: {
          content: content.trim() || undefined,
          removeAttachmentIds: removedAttachmentIds.length > 0 ? removedAttachmentIds : undefined,
          addAttachmentIds: newAttachmentIds.length > 0 ? newAttachmentIds : undefined,
        },
      });
      onClose();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleRestoreVersion = async (versionNumber: number) => {
    if (!confirm(`Restore version ${versionNumber}? This will create a new version with the old content.`)) {
      return;
    }

    try {
      await restoreMutation.mutateAsync({
        postId: post.id,
        versionNumber,
      });
      setShowVersionHistory(false);
      onClose();
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>Edit Post</span>
          <button
            onClick={() => setShowVersionHistory(!showVersionHistory)}
            className="ml-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
            type="button"
          >
            <History className="w-4 h-4" />
            Version History
          </button>
        </div>
      }
      maxWidth="2xl"
      closeOnBackdropClick={true}
      className="flex flex-col"
    >
      <div className="flex-1 overflow-y-auto -mx-4 px-4">
          {showVersionHistory ? (
            /* Version History View */
            <div>
              <h3 className="text-md font-semibold mb-4">Version History</h3>
              {versionsLoading ? (
                <div className="text-center py-8 text-gray-500">Loading versions...</div>
              ) : versions && versions.length > 0 ? (
                <div className="space-y-3">
                  {versions.map((version: PostVersion) => (
                    <div
                      key={version.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-sm">
                            Version {version.versionNumber}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(version.editedAt).toLocaleString()}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRestoreVersion(version.versionNumber)}
                          disabled={restoreMutation.isPending}
                          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Restore
                        </button>
                      </div>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {version.content}
                      </div>
                      {version.attachmentIds.length > 0 && (
                        <div className="text-xs text-gray-500 mt-2">
                          {version.attachmentIds.length} attachment(s)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No version history available
                </div>
              )}
            </div>
          ) : (
            /* Edit View */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Content Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={6}
                  maxLength={5000}
                />
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {content.length}/5000
                </div>
              </div>

              {/* Attachments Display */}
              {attachments.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachments
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="relative group border border-gray-200 rounded-lg overflow-hidden"
                      >
                        {attachment.type === "IMAGE" ? (
                          <img
                            src={attachment.url}
                            alt="Attachment"
                            className="w-full h-32 object-cover"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(attachment.id)}
                          className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Attachment Button */}
              <div>
                <button
                  type="button"
                  onClick={handleAddAttachment}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  Add Media
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  Note: Full media upload integration requires connecting to your existing upload system
                </p>
              </div>
            </form>
          )}
      </div>

      {/* Footer Actions */}
      {!showVersionHistory && (
        <div className="flex gap-2 pt-4 border-t px-4 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={editMutation.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={editMutation.isPending || (!content.trim() && attachments.length === 0)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {editMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </Modal>
  );
}

