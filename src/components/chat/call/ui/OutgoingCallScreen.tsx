import React, { useEffect, useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import { PhoneOff, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { getConversationById } from '@/src/services/api/chat.service';
import { ConversationWithMetadata } from '@/src/types/chat.types';

interface OutgoingCallScreenProps {
  conversationId: string;
  onCancel: () => void;
}

export const OutgoingCallScreen = ({
  conversationId,
  onCancel,
}: OutgoingCallScreenProps) => {
  const { data: session } = useSession();
  const [conversation, setConversation] = useState<ConversationWithMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!session?.user?.accessToken) return;
      try {
        const convo = await getConversationById(conversationId, {
          Authorization: `Bearer ${session.user.accessToken}`,
        });
        setConversation(convo);
      } catch (error) {
        console.error("Failed to fetch call receiver details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [conversationId, session?.user?.accessToken]);

  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center h-full w-full bg-black/95 backdrop-blur-2xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
      );
  }

  const isGroup = conversation?.type === 'GROUP';
  const otherParticipants = conversation?.participants.filter(p => p.userId !== session?.user?.id) || [];
  
  const displayName = isGroup 
    ? conversation?.name || 'Group Call' 
    : otherParticipants[0]?.name || otherParticipants[0]?.username || 'Unknown User';
    
  const displayImage = isGroup 
    ? conversation?.icon || undefined 
    : otherParticipants[0]?.profilePhoto || undefined;

  return (
    <div className="flex flex-col items-center justify-between py-24 h-full w-full bg-black/95 backdrop-blur-2xl relative overflow-hidden animate-in fade-in duration-700">
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center space-y-8 w-full max-w-md px-6">
            {/* Receiver Avatar */}
            <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-[60px] animate-pulse" />
                <Avatar className="w-44 h-44 border-4 border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.6)]">
                    <AvatarImage src={displayImage} className="object-cover" />
                    <AvatarFallback className="text-6xl bg-gradient-to-br from-gray-800 to-gray-900 text-white font-semibold">
                        {isGroup ? <Users className="w-20 h-20" /> : displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            </div>

            {/* Info */}
            <div className="text-center space-y-4">
                <h3 className="text-3xl font-bold text-white tracking-tight">
                    {displayName}
                </h3>
                
                {isGroup && (
                    <div className="flex flex-wrap justify-center gap-2 max-h-24 overflow-y-auto px-4 custom-scrollbar">
                        {otherParticipants.map((p) => (
                            <span key={p.userId} className="text-white/40 text-xs bg-white/5 px-2 py-1 rounded-full whitespace-nowrap">
                                {p.name || p.username}
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <p className="text-primary/80 font-semibold tracking-widest text-sm uppercase">
                        {isGroup ? 'Initiating Group Call...' : 'Ringing...'}
                    </p>
                </div>
            </div>
        </div>

        {/* Cancel Button */}
        <div className="relative z-20 flex flex-col items-center gap-4">
            <Button
                size="icon"
                onClick={onCancel}
                className="w-18 h-18 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all duration-300 hover:scale-110 active:scale-95 border-none"
            >
                <PhoneOff className="w-8 h-8" />
            </Button>
            <span className="text-xs font-bold text-white/30 tracking-widest uppercase">Cancel Call</span>
        </div>
    </div>
  );
};

