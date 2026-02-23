import { ConversationParticipant } from "../types/chat.types";

/**
 * Formats system messages from machine-readable strings to human-readable text.
 * Handles various group management events like additions, removals, and role updates.
 */
export function formatSystemMessage(
    content: string, 
    participants: ConversationParticipant[] = [], 
    currentUserId: string = ""
): string {
    if (!content) return "";

    const [type, payload] = content.includes(":") 
        ? [content.split(":")[0], content.substring(content.indexOf(":") + 1).trim()] 
        : [content.trim(), ""];

    // Helper to get name from ID
    const getName = (userId: string) => {
        if (userId === currentUserId) return "You";
        const p = participants.find(p => p.userId === userId);
        return p ? (p.name || p.username) : "Unknown User";
    };

    // Helper to extract a name from a potential JSON snapshot, falling back to getName lookup
    const resolveActorName = (payloadStr: string) => {
        try {
            const data = JSON.parse(payloadStr);
            if (data && data.name) return data.name;
        } catch (e) {
            // Not a JSON snapshot, fallback to ID lookup
        }
        return getName(payloadStr);
    };

    switch (type.toLowerCase()) {
        case "promoted_admin":
            return `${resolveActorName(payload)} was promoted to Admin`;
        
        case "demoted_admin":
            return `${resolveActorName(payload)} is no longer an Admin`;
        
        case "added_participant":
            try {
                const addedData = JSON.parse(payload);
                if (Array.isArray(addedData)) {
                    if (addedData.length === 1) {
                        const singleName = typeof addedData[0] === 'object' ? addedData[0].name : getName(addedData[0]);
                        return `${singleName} was added to the group`;
                    }
                    const names = addedData.map(item => typeof item === 'object' ? item.name : getName(item));
                    const last = names.pop();
                    return `${names.join(", ")} and ${last} were added to the group`;
                }
            } catch (e) {
                return "New participants were added";
            }
            return "New participants were added";

        case "removed_participant":
            return `${resolveActorName(payload)} was removed from the group`;

        case "left_group":
            return `${resolveActorName(payload)} left the group`;

        case "group_created":
            return "Group created";

        // Legacy/Direct block messages
        case "blocked":
            return "User has been blocked";
        
        case "unblocked":
            return "User has been unblocked";

        default:
            // Fallback for custom or legacy messages
            const lowContent = content.toLowerCase();
            if (lowContent.includes("unblocked")) return "User unblocked";
            if (lowContent.includes("blocked")) return "User blocked";
            
            return content;
    }
}
