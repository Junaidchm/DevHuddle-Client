"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { useCreateProjectComment, useUpdateProjectComment } from "@/src/customHooks/useProjectComments";
import { Loader2, Send } from "lucide-react";

interface CommentInputProps {
  projectId: string;
  parentCommentId?: string;
  commentId?: string; // For updates
  initialValue?: string;
  placeholder?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}

export default function CommentInput({
  projectId,
  parentCommentId,
  commentId,
  initialValue = "",
  placeholder = "Write a comment...",
  onSuccess,
  onCancel,
  autoFocus = false,
}: CommentInputProps) {
  const [content, setContent] = useState(initialValue);
  const createMutation = useCreateProjectComment();
  const updateMutation = useUpdateProjectComment();

  const isUpdate = !!commentId;
  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isLoading) return;

    if (isUpdate) {
      updateMutation.mutate(
        { commentId: commentId!, content },
        {
          onSuccess: () => {
            setContent("");
            onSuccess?.();
          },
        }
      );
    } else {
      createMutation.mutate(
        { projectId, content, parentCommentId },
        {
          onSuccess: () => {
            setContent("");
            onSuccess?.();
          },
        }
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="min-h-[100px] resize-none border-border bg-background focus-visible:ring-1 focus-visible:ring-primary/30"
        autoFocus={autoFocus}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {isUpdate ? "Update" : parentCommentId ? "Reply" : "Post"}
        </Button>
      </div>
    </form>
  );
}
