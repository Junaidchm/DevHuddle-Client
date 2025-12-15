import { useState, useRef, useCallback } from "react";
import { getCursorXY } from "@/src/app/lib/general/getCursorXY";
import { SearchedUser } from "@/src/services/api/user.service";

interface MentionState {
    isActive: boolean;
    query: string;
    position: { top: number; left: number };
}

interface UseMentionsReturn {
    mentionState: MentionState;
    handleInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    insertMention: (user: SearchedUser, content: string, textarea: HTMLTextAreaElement | null) => string;
    closeMentions: () => void;
}

export const useMentions = (): UseMentionsReturn => {
    const [mentionState, setMentionState] = useState<MentionState>({
        isActive: false,
        query: "",
        position: { top: 0, left: 0 }
    });

    const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        const selectionStart = e.target.selectionStart;
        const textBeforeCursor = newValue.substring(0, selectionStart);
        const words = textBeforeCursor.split(/\s+/);
        const lastWord = words[words.length - 1];

        // Check if last word starts with @
        if (lastWord.startsWith("@")) {
            const query = lastWord.slice(1);
            
            // Get Position
            const { x, y } = getCursorXY(e.target, selectionStart);
            
            setMentionState({
                isActive: true,
                query,
                position: { top: y + 24, left: x }
            });
        } else {
            setMentionState(prev => prev.isActive ? { ...prev, isActive: false } : prev);
        }
    }, []);

    const insertMention = useCallback((user: SearchedUser, content: string, textarea: HTMLTextAreaElement | null): string => {
        if (!textarea) return content;

        const selectionStart = textarea.selectionStart;
        const textBeforeCursor = content.substring(0, selectionStart);
        const textAfterCursor = content.substring(selectionStart);
        
        const words = textBeforeCursor.split(/\s+/);
        const lastWord = words[words.length - 1]; // This is the @query
        
        const mentionText = `@[${user.username}](${user.id}) `;
        
        // Remove the partial @query
        const textWithoutLastWord = textBeforeCursor.slice(0, -lastWord.length);
        
        return textWithoutLastWord + mentionText + textAfterCursor;
    }, []);

    const closeMentions = useCallback(() => {
        setMentionState(prev => ({ ...prev, isActive: false, query: "" }));
    }, []);

    return {
        mentionState,
        handleInput,
        insertMention,
        closeMentions
    };
};
