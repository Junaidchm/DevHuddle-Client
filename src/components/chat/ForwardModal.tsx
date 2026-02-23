import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Users, 
  MessageCircle, 
  Check, 
  Loader2, 
  Send 
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/src/components/ui/avatar';
import { cn } from '@/src/lib/utils';
import { ConversationWithMetadata, Message } from '@/src/types/chat.types';
import { PROFILE_DEFAULT_URL } from '@/src/constants';

interface ForwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onForward: (targetIds: string[]) => Promise<void>;
  conversations: ConversationWithMetadata[];
  connections: any[];
  isLoading?: boolean;
  selectedMessages: Message[];
}

export function ForwardModal({
  isOpen,
  onClose,
  onForward,
  conversations,
  connections,
  isLoading = false,
  selectedMessages
}: ForwardModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [tab, setTab] = useState<'chats' | 'connections'>('chats');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (tab === 'chats') {
      if (!query) return conversations;
      return conversations.filter(c => 
        c.name?.toLowerCase().includes(query) || 
        c.participants.some(p => p.username.toLowerCase().includes(query) || p.name.toLowerCase().includes(query))
      );
    } else {
      if (!query) return connections;
      return connections.filter(c => 
        c.name?.toLowerCase().includes(query) || 
        c.username?.toLowerCase().includes(query)
      );
    }
  }, [tab, searchQuery, conversations, connections]);

  const toggleTarget = (id: string) => {
    setSelectedTargets(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleForward = async () => {
    if (selectedTargets.length === 0) return;
    setIsSubmitting(true);
    try {
      await onForward(selectedTargets);
      onClose();
      setSelectedTargets([]);
    } catch (error) {
      console.error("Forwarding failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-0 gap-0 overflow-hidden bg-card">
        <DialogHeader className="p-4 border-b bg-card">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold">Forward message</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div className="flex gap-2 mt-4">
            <Button 
                variant={tab === 'chats' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setTab('chats')} 
                className="rounded-full h-8 text-xs"
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              Recent Chats
            </Button>
            <Button 
                variant={tab === 'connections' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setTab('connections')} 
                className="rounded-full h-8 text-xs"
            >
              <Users className="w-3 h-3 mr-1" />
              Connections
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[350px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
              <p className="text-sm">No results found</p>
            </div>
          ) : (
            <div className="py-2">
              {filteredItems.map((item) => {
                const id = tab === 'chats' ? item.conversationId : item.id;
                const isSelected = selectedTargets.includes(id);
                const title = tab === 'chats' 
                    ? (item.name || item.participants.map(p => p.name).join(', '))
                    : item.name;
                const subtitle = tab === 'chats' ? '' : `@${item.username}`;
                const image = tab === 'chats' ? item.icon : item.profilePicture || item.avatar;

                return (
                  <div
                    key={id}
                    onClick={() => toggleTarget(id)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/50",
                      isSelected && "bg-primary/5"
                    )}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={image || PROFILE_DEFAULT_URL} className="object-cover" />
                        <AvatarFallback>{title?.[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {isSelected && (
                        <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-0.5 border-2 border-background">
                          <Check className="h-2 w-2" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{title}</p>
                      {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="p-4 border-t flex items-center justify-between sm:justify-between bg-card">
          <div className="flex flex-col">
            <p className="text-xs font-medium">{selectedTargets.length} selected</p>
            <p className="text-[10px] text-muted-foreground">
                {selectedMessages.length} message{selectedMessages.length !== 1 ? 's' : ''} to forward
            </p>
          </div>
          <Button 
            disabled={selectedTargets.length === 0 || isSubmitting}
            onClick={handleForward}
            className="rounded-full gap-2 px-6"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
