"use client";

import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useReportPost, ReportReason } from "./Hooks/useReportPost";
import Modal from "@/src/components/ui/Modal";

interface ReportPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  targetType?: "POST" | "COMMENT";
}

const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  { value: "SPAM", label: "Spam", description: "Repetitive, unwanted, or promotional content" },
  { value: "HARASSMENT", label: "Harassment", description: "Bullying, threats, or targeted attacks" },
  { value: "HATE_SPEECH", label: "Hate Speech", description: "Content that attacks or discriminates" },
  { value: "VIOLENCE", label: "Violence", description: "Graphic violence or dangerous content" },
  { value: "FALSE_INFORMATION", label: "False Information", description: "Misleading or factually incorrect" },
  { value: "COPYRIGHT_VIOLATION", label: "Copyright Violation", description: "Unauthorized use of copyrighted material" },
  { value: "SELF_HARM", label: "Self-Harm", description: "Content promoting self-injury" },
  { value: "OTHER", label: "Other", description: "Something else that violates our policies" },
];

export default function ReportPostModal({
  isOpen,
  onClose,
  postId,
  targetType = "POST",
}: ReportPostModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState("");
  const reportMutation = useReportPost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // ✅ FIX: Prevent event bubbling
    
    if (!selectedReason) {
      return;
    }

    try {
      await reportMutation.mutateAsync({
        postId,
        reason: selectedReason,
        description: description.trim() || undefined,
      });
      // ✅ FIX: Only close modal on success
      onClose();
      setSelectedReason(null);
      setDescription("");
    } catch (error: any) {
      // ✅ FIX: Error handled by hook, but don't close modal on error
      // This allows user to see the error and retry
      console.error("Report error:", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span>Report {targetType === "POST" ? "Post" : "Comment"}</span>
        </div>
      }
      maxWidth="md"
      closeOnBackdropClick={true}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Help us understand what's wrong with this {targetType.toLowerCase()}. Your report is anonymous.
          </p>

          {/* Reason Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Why are you reporting this?
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedReason === reason.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={() => setSelectedReason(reason.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{reason.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {reason.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Details */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional details (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more context about why you're reporting this..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {description.length}/500
            </div>
          </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={reportMutation.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedReason || reportMutation.isPending}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {reportMutation.isPending ? "Reporting..." : "Report"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

