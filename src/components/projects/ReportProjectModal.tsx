"use client";

import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { reportProject } from "@/src/services/api/project.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import toast from "react-hot-toast";

interface ReportProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

const REPORT_REASONS = [
  { value: "SPAM", label: "Spam", description: "Repetitive, unwanted, or promotional content" },
  { value: "HARASSMENT", label: "Harassment", description: "Bullying, threats, or targeted attacks" },
  { value: "HATE_SPEECH", label: "Hate Speech", description: "Content that attacks or discriminates" },
  { value: "VIOLENCE", label: "Violence", description: "Graphic violence or dangerous content" },
  { value: "FALSE_INFORMATION", label: "False Information", description: "Misleading or factually incorrect" },
  { value: "COPYRIGHT_VIOLATION", label: "Copyright Violation", description: "Unauthorized use of copyrighted material" },
  { value: "SELF_HARM", label: "Self-Harm", description: "Content promoting self-injury" },
  { value: "OTHER", label: "Other", description: "Something else that violates our policies" },
] as const;

type ReportReason = typeof REPORT_REASONS[number]["value"];

export default function ReportProjectModal({
  isOpen,
  onClose,
  projectId,
}: ReportProjectModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const authHeaders = useAuthHeaders();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      toast.error("Please select a reason");
      return;
    }

    setIsSubmitting(true);
    try {
      await reportProject(
        projectId,
        selectedReason,
        description.trim() ? { description: description.trim() } : undefined,
        authHeaders
      );
      toast.success("Project reported successfully");
      onClose();
      setSelectedReason(null);
      setDescription("");
    } catch (error: any) {
      toast.error(error.message || "Failed to report project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold">Report Project</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Help us understand what's wrong with this project. Your report is anonymous.
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
                    disabled={isSubmitting}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{reason.label}</div>
                    <div className="text-xs text-gray-500">{reason.description}</div>
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
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Provide more context about why you're reporting this project..."
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedReason || isSubmitting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

