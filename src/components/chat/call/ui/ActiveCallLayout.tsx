import React, { useEffect, useState, useRef } from 'react';
import { useVideoCall } from '@/src/contexts/VideoCallContext';
import { CallControls } from '../CallControls';
import { useSession } from 'next-auth/react';
import { getConversationById } from '@/src/services/api/chat.service';
import { ParticipantTile } from '../ParticipantTile';
import { cn } from '@/src/lib/utils';
import { Loader2 } from 'lucide-react';

export const ActiveCallLayout = () => {
  const { activeCall, callState, localStream, remoteStreams } = useVideoCall();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const [participantDetails, setParticipantDetails] = useState<Map<string, { name: string; image?: string }>>(new Map());
  
  // PiP State
  const [isPipSwapped, setIsPipSwapped] = useState(false);

  // Fetch participant details
  useEffect(() => {
    const fetchParticipants = async () => {
       if (!session?.user?.accessToken || !activeCall?.conversationId) return;

       try {
         const convo = await getConversationById(activeCall.conversationId, {
            Authorization: `Bearer ${session.user.accessToken}`,
         });

         const map = new Map();
         convo.participants.forEach(p => {
             // Store all participants including self for easy lookup
             map.set(p.userId, {
                 name: p.name || p.username || 'User',
                 image: p.profilePhoto || undefined
             });
         });
         setParticipantDetails(map);
         console.log('[ActiveCallLayout] Fetched participants:', map);
       } catch (error) {
           console.error("Failed to fetch participant details:", error);
       }
    };

    fetchParticipants();
  }, [activeCall?.conversationId, session]);

  // Construct Participants List
  const participants = Array.from(remoteStreams.entries())
    .filter(([id]) => id !== currentUserId)
    .map(([id, stream]) => {
      const details = participantDetails.get(id);
      console.log(`[ActiveCallLayout] Mapping ID: ${id} -> Name: ${details?.name}`);
      return {
        id,
        stream,
        isLocal: false,
        name: details?.name || 'Unknown User',
        image: details?.image
      };
    });

  const remoteCount = participants.length;
  const isOneOnOne = remoteCount <= 1;

  // --- Render Layouts ---

  // 1. One-on-One Layout (WhatsApp Style PiP)
  if (isOneOnOne) {
      const remoteUser = participants[0]; // Might be undefined if waiting
      const localUser = { 
          id: 'local', 
          stream: localStream, 
          isLocal: true, 
          name: 'You',
          image: session?.user?.image 
      };

      // Determine who is Main vs PiP based on swap state
      // Default: Remote is Main, Local is PiP
      const mainUser = isPipSwapped ? localUser : (remoteUser || localUser); 
      const pipUser = isPipSwapped ? (remoteUser || localUser) : localUser;
      
      // Special case: If waiting for remote, Main is Local (or empty placeholder)
      const showWaitingState = !remoteUser && !isPipSwapped;

      return (
        <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
            
            {/* MAIN VIDEO LAYER (Background) */}
            <div className="absolute inset-0 z-0">
                {showWaitingState ? (
                     <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                            <div className="bg-primary/10 p-4 rounded-full relative z-10">
                                <Loader2 className="w-12 h-12 text-primary animate-spin" /> 
                            </div>
                        </div>
                        <p className="text-white/60 font-medium">Waiting for others to join...</p>
                     </div>
                ) : (
                    <ParticipantTile 
                        stream={mainUser.stream || null}
                        userId={mainUser.id}
                        displayName={mainUser.name}
                        isLocal={mainUser.isLocal}
                        className="w-full h-full object-cover" // Ensure it covers full screen
                    />
                )}
            </div>

            {/* PiP VIDEO LAYER (Floating) */}
            {/* Only show PiP if we have a remote user OR if we want to confirm self-view while waiting */}
            <div 
                className={cn(
                    "absolute bottom-24 right-6 z-30 w-48 aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-gray-900 transition-all duration-300 hover:scale-105 cursor-pointer",
                    "hover:shadow-primary/20",
                    !pipUser.stream && "hidden"
                )}
                onClick={() => setIsPipSwapped(!isPipSwapped)}
            >
                 <ParticipantTile 
                    stream={pipUser.stream || null}
                    userId={pipUser.id}
                    displayName={pipUser.name}
                    isLocal={pipUser.isLocal}
                    className="w-full h-full object-cover"
                 />
            </div>

            {/* CONTROLS LAYER */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
                <CallControls />
            </div>
            
            {/* Timer Pill */}
             <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
                <div className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/5 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-white/90 text-sm font-medium tracking-wide">
                        {callState === 'CONNECTED' ? '00:00' : 'Connecting...'}
                    </span>
                 </div>
            </div>
        </div>
      );
  }

  // 2. Group Grid Layout (Responsive Grid)
  // Include self in the grid for groups
  const allParticipants = [
      { id: 'local', stream: localStream, isLocal: true, name: 'You' },
      ...participants
  ];

  return (
    <div className="flex flex-col h-full bg-black/95 relative">
        <div className="flex-1 p-4 flex items-center justify-center overflow-hidden">
             <div className={cn(
                 "grid gap-4 w-full h-full max-w-[1600px] transition-all duration-500",
                 // Grid Logic:
                 // 3-4 users: 2x2
                 // 5-6 users: 3x2 (landscape preference)
                 // 7+ users: 4x3
                 allParticipants.length <= 2 ? "grid-cols-2" :
                 allParticipants.length <= 4 ? "grid-cols-2 grid-rows-2" :
                 allParticipants.length <= 6 ? "grid-cols-3 grid-rows-2" :
                 "grid-cols-4"
             )}>
                 {allParticipants.map(p => (
                     <div key={p.id} className="relative w-full h-full bg-gray-900 rounded-xl overflow-hidden border border-white/5">
                          <ParticipantTile 
                            stream={p.stream || null}
                            userId={p.id}
                            displayName={p.name}
                            isLocal={p.isLocal}
                             className="w-full h-full object-cover"
                         />
                     </div>
                 ))}
             </div>
        </div>

        {/* Floating Controls Bar */}
        <div className="p-8 flex justify-center w-full z-20">
           <CallControls />
        </div>
    </div>
  );
};
