import { ConversationWithMetadata } from "@/src/types/chat.types";
import { ProfilePanel } from "./ProfilePanel";
import { useEffect, useRef } from "react";

interface ChatDetailsProps {
    conversation: ConversationWithMetadata;
    currentUserId: string;
    onClose: () => void;
    onConversationDeleted?: () => void;
}

export function ChatDetails({ 
    conversation, 
    currentUserId, 
    onClose,
    onConversationDeleted
}: ChatDetailsProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Handle ESC key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                aria-hidden="true"
            />
            
            {/* Centered Modal */}
            <div 
                ref={modalRef}
                className="relative w-full max-w-5xl h-[85vh] bg-background rounded-xl shadow-2xl flex overflow-hidden animate-in zoom-in-95 duration-200 border border-border"
                role="dialog"
                aria-modal="true"
            >
                <ProfilePanel 
                    conversation={conversation}
                    currentUserId={currentUserId}
                    onClose={onClose}
                    onConversationDeleted={onConversationDeleted}
                />
            </div>
        </div>
    );
}
