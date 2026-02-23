import React from "react";
import { 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Reply, 
  Smile, 
  Pin, 
  PinOff,
  Forward 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Button } from "@/src/components/ui/button";
import { Message } from "@/src/types/chat.types";

interface MessageActionsMenuProps {
  message: Message;
  isOwn: boolean;
  onReply?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message, forEveryone: boolean) => void;
  onReact?: (message: Message, emoji: string) => void;
  onPin?: (message: Message) => void;
  onUnpin?: (message: Message) => void;
  onForward?: (message: Message) => void;
  isPinned?: boolean;
  isBlocked?: boolean;
}

export function MessageActionsMenu({
  message,
  isOwn,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onPin,
  onUnpin,
  onForward,
  isPinned,
  isBlocked
}: MessageActionsMenuProps) {
  // Common emoji reactions
  const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-black/10 text-gray-500"
        >
          <MoreVertical className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isOwn ? "end" : "start"} className="w-56">
        {/* Quick Reactions */}
        {!isBlocked && (
          <div className="flex justify-between px-2 py-2 border-b mb-1">
            {quickReactions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onReact?.(message, emoji)}
                className="hover:scale-125 transition-transform text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <DropdownMenuItem onClick={() => onReply?.(message)}>
          <Reply className="mr-2 h-4 w-4" />
          <span>Reply</span>
        </DropdownMenuItem>

        {isOwn && (
          <DropdownMenuItem onClick={() => onEdit?.(message)}>
            <Pencil className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
        )}

        {isPinned ? (
             <DropdownMenuItem onClick={() => onUnpin?.(message)}>
                <PinOff className="mr-2 h-4 w-4" />
                <span>Unpin</span>
            </DropdownMenuItem>
        ) : (
            <DropdownMenuItem onClick={() => onPin?.(message)}>
                <Pin className="mr-2 h-4 w-4" />
                <span>Pin</span>
            </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={() => onForward?.(message)}>
            <Forward className="mr-2 h-4 w-4" />
            <span>Forward</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => onDelete?.(message, false)}
          className="text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete for me</span>
        </DropdownMenuItem>

        {isOwn && (
          <DropdownMenuItem 
            onClick={() => onDelete?.(message, true)}
            className="text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete for everyone</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
