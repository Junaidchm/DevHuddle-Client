import React from 'react';
import { Message } from '@/src/types/chat.types';
import { X, Pin } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

interface PinnedMessageBarProps {
  message: Message;
  count: number;
  onUnpin: (messageId: string) => void;
  onClick: (messageId: string) => void;
  canUnpin: boolean;
}

export function PinnedMessageBar({ message, count, onUnpin, onClick, canUnpin }: PinnedMessageBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-background border-b z-10 cursor-pointer hover:bg-muted/50 transition-colors"
         onClick={() => onClick(message.id)}>
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="bg-primary/10 p-2 rounded-lg">
           <Pin className="w-4 h-4 text-primary fill-current" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-xs font-semibold text-primary">
            {count > 1 ? `${count} Pinned Messages` : 'Pinned Message'}
          </span>
          <span className="text-sm truncate text-muted-foreground max-w-[300px] md:max-w-[500px]">
            {message.content}
          </span>
        </div>
      </div>
      
      {canUnpin && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onUnpin(message.id);
          }}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
