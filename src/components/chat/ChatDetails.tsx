"use client";

import { ConversationWithMetadata } from "@/src/types/chat.types";
import { GroupDetailsModal } from "./GroupDetailsModal";
import { UserProfile } from "./UserProfile";

interface ChatDetailsProps {
    conversation: ConversationWithMetadata;
    currentUserId: string;
    onClose: () => void;
}

export function ChatDetails({ 
    conversation, 
    currentUserId, 
    onClose 
}: ChatDetailsProps) {
    const isGroup = conversation.type === 'GROUP';

    // For groups, use centered modal
    if (isGroup) {
        return (
            <GroupDetailsModal
                conversation={conversation}
                currentUserId={currentUserId}
                isOpen={true}
                onClose={onClose}
            />
        );
    }

    // For direct chats, use user profile drawer
    return (
        <UserProfile
            conversation={conversation}
            currentUserId={currentUserId}
            onClose={onClose}
        />
    );
}
