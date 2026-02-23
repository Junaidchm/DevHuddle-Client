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

import { useReportProjectMutation } from "./hooks/useReportProjectMutation";

export default function ReportProjectModal({
  isOpen,
  onClose,
  projectId,
}: ReportProjectModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState("");
  
  const reportMutation = useReportProjectMutation(projectId);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      toast.error("Please select a reason");
      return;
    }

    reportMutation.mutate({
      reason: selectedReason,
      description: description.trim() || undefined,
    }, {
      onSuccess: () => {
        onClose();
        setSelectedReason(null);
        setDescription("");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-full">
                <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <h2 className="text-xl font-bold">Report Project</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-all"
            disabled={reportMutation.isPending}
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-sm text-muted-foreground mb-6">
            Help us maintain a high-quality community. Your report will be reviewed by our team.
          </p>

          {/* Reason Selection */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Reason for reporting
            </label>
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all group ${
                    selectedReason === reason.value
                      ? "border-primary bg-primary/5"
                      : "border-border/60 hover:border-border hover:bg-muted/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={() => setSelectedReason(reason.value)}
                    className="mt-1 accent-primary"
                    disabled={reportMutation.isPending}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-sm group-hover:text-primary transition-colors">{reason.label}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{reason.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Details */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Additional context (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-border rounded-xl bg-muted/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none resize-none"
              placeholder="Tell us more about the issue..."
              disabled={reportMutation.isPending}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={reportMutation.isPending}
              className="flex-1 h-11 border border-border rounded-xl font-semibold hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedReason || reportMutation.isPending}
              className="flex-1 h-11 bg-destructive text-destructive-foreground rounded-xl font-bold hover:bg-destructive/90 transition-all shadow-lg shadow-destructive/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {reportMutation.isPending ? "Reporting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

