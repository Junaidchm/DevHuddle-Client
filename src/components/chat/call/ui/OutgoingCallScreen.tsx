import React, { useEffect, useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import { PhoneOff } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { getConversationById } from '@/src/services/api/chat.service';

interface OutgoingCallScreenProps {
  conversationId: string;
  onCancel: () => void;
}

export const OutgoingCallScreen = ({
  conversationId,
  onCancel,
}: OutgoingCallScreenProps) => {
  const { data: session } = useSession();
  const [receiver, setReceiver] = useState<{ name: string; image?: string } | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!session?.user?.accessToken) return;
      try {
        const convo = await getConversationById(conversationId, {
          Authorization: `Bearer ${session.user.accessToken}`,
        });
        
        // Find the other participant
        const other = convo.participants.find(p => p.userId !== session.user.id);
        if (other) {
            setReceiver({
                name: other.name || other.username || 'Unknown User',
                image: other.profilePhoto || undefined
            });
        }
      } catch (error) {
        console.error("Failed to fetch call receiver details:", error);
      }
    };
    fetchDetails();
  }, [conversationId, session]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-black/95 backdrop-blur-xl relative overflow-hidden">
        {/* Subtle Background Pulse */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-primary/5 to-black/0 animate-pulse pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center space-y-10">
            {/* Receiver Avatar */}
            <div className="relative">
                <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl animate-pulse" />
                <Avatar className="w-40 h-40 border-4 border-white/5 shadow-2xl">
                    <AvatarImage src={receiver?.image} className="object-cover" />
                    <AvatarFallback className="text-5xl bg-gray-800 text-gray-400">
                        {receiver?.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            </div>

            {/* Info */}
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-semibold text-white tracking-wide">
                    {receiver ? receiver.name : 'Calling...'}
                </h3>
                <p className="text-white/50 font-medium tracking-widest text-sm uppercase animate-pulse">
                    Ringing...
                </p>
            </div>
        </div>

        {/* Cancel Button */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-center z-20">
            <Button
                size="icon"
                onClick={onCancel}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-red-500/30 transition-all hover:scale-105"
            >
                <PhoneOff className="w-8 h-8" />
            </Button>
        </div>
    </div>
  );
};
