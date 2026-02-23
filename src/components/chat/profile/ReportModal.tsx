"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { Flag, X, ShieldAlert, AlertTriangle, MessageSquare, Info } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { reportChat } from "@/src/services/api/chat.service";
import { useMutation } from "@tanstack/react-query";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import toast from "react-hot-toast";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    conversationId: string;
    targetId: string;
    targetType: 'USER' | 'CONVERSATION';
    targetName: string;
}

const REPORT_REASONS = [
    { value: 'SPAM', label: 'Spam', icon: <Info className="w-4 h-4" /> },
    { value: 'INAPPROPRIATE', label: 'Inappropriate', icon: <MessageSquare className="w-4 h-4" /> },
    { value: 'HARASSMENT', label: 'Harassment', icon: <ShieldAlert className="w-4 h-4" /> },
    { value: 'HATE_SPEECH', label: 'Hate Speech', icon: <AlertTriangle className="w-4 h-4" /> },
    { value: 'VIOLENCE', label: 'Violence', icon: <AlertTriangle className="w-4 h-4" /> },
    { value: 'OTHER', label: 'Other', icon: <Info className="w-4 h-4" /> },
];

export function ReportModal({ isOpen, onClose, conversationId, targetId, targetType, targetName }: ReportModalProps) {
    const [reason, setReason] = useState<string>("");
    const [description, setDescription] = useState("");
    const authHeaders = useAuthHeaders();

    const reportMutation = useMutation({
        mutationFn: () => reportChat({
            conversationId,
            targetId,
            targetType,
            reason,
            description: description.trim() || undefined,
            metadata: { source: 'web_chat_profile' }
        }, authHeaders),
        onSuccess: () => {
            toast.success("Report submitted successfully");
            onClose();
            setReason("");
            setDescription("");
        },
        onError: (error: any) => {
            console.error("Report error:", error);
            const message = error.response?.data?.message || "Failed to submit report";
            toast.error(message);
        }
    });

    const handleSubmit = () => {
        if (!reason) {
            toast.error("Please select a reason for reporting");
            return;
        }
        reportMutation.mutate();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md p-0 overflow-hidden bg-background border-border/50 shadow-2xl" showCloseButton={false}>
                <div className="flex flex-col">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between bg-destructive/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-destructive/10 text-destructive">
                                <Flag className="w-5 h-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold tracking-tight">Report {targetType === 'CONVERSATION' ? 'Group' : 'User'}</DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground">
                                    Why are you reporting <span className="font-semibold text-foreground">{targetName}</span>?
                                </DialogDescription>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-muted/80 transition-colors text-muted-foreground">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-5 space-y-6">
                        {/* Reasons Grid */}
                        <div className="space-y-3">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">Select a Reason</p>
                            <div className="grid grid-cols-2 gap-2">
                                {REPORT_REASONS.map((r) => (
                                    <button
                                        key={r.value}
                                        onClick={() => setReason(r.value)}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-left",
                                            reason === r.value 
                                                ? "bg-primary/5 border-primary text-primary shadow-sm"
                                                : "border-border/50 hover:border-border hover:bg-muted/30 text-muted-foreground"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                                            reason === r.value ? "bg-primary/10" : "bg-muted"
                                        )}>
                                            {r.icon}
                                        </div>
                                        <span className="text-xs font-semibold">{r.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-3">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">Additional Details (Optional)</p>
                            <Textarea 
                                placeholder="Provide more context to help us review this report..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="resize-none h-24 bg-muted/20 border-border/50 focus:bg-background transition-all rounded-xl text-sm"
                            />
                        </div>

                        <div className="bg-muted/30 p-4 rounded-2xl flex items-start gap-3 border border-border/30">
                            <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Your report is anonymous. Devhuddle moderators will review the recent activity in this chat to take appropriate action.
                            </p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-border/50 bg-muted/10 flex gap-2">
                        <Button 
                            variant="ghost" 
                            onClick={onClose}
                            className="flex-1 h-11 rounded-xl font-medium"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!reason || reportMutation.isPending}
                            className="flex-[1.5] h-11 rounded-xl font-bold shadow-sm bg-destructive hover:bg-destructive/90 text-destructive-foreground dark:text-white"
                        >
                            {reportMutation.isPending ? "Submitting..." : "Submit Report"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
