import React, { useEffect, useState, useRef } from 'react';
import { useVideoCall } from '@/src/contexts/VideoCallContext';
import { CallControls } from '../CallControls';
import { useSession } from 'next-auth/react';
import { getConversationById } from '@/src/services/api/chat.service';
import { ParticipantTile } from '../ParticipantTile';
import { cn } from '@/src/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import { Loader2, Users, ShieldCheck } from 'lucide-react';

export const ActiveCallLayout = () => {
  const { activeCall, callState, localStream, remoteStreams } = useVideoCall();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const [participantDetails, setParticipantDetails] = useState<Map<string, { name: string; image?: string }>>(new Map());
  
  // Layout State
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isPipSwapped, setIsPipSwapped] = useState(false);
  const [isGroup, setIsGroup] = useState(false);

  // Fetch participant details
  useEffect(() => {
    const fetchParticipants = async () => {
       if (!session?.user?.accessToken || !activeCall?.conversationId) return;

       try {
         const convo = await getConversationById(activeCall.conversationId, {
            Authorization: `Bearer ${session.user.accessToken}`,
         });

         const map = new Map();
         convo.participants.forEach((p: any) => {
             // Store all participants including self for easy lookup
             map.set(p.userId, {
                 name: p.name || p.username || p.user?.username || 'User',
                 image: p.profilePhoto || p.user?.profileImage || undefined
             });
         });
         setParticipantDetails(map);
         setIsGroup(convo.type === 'GROUP');
         console.log('[ActiveCallLayout] Fetched participants:', map, 'isGroup:', convo.type === 'GROUP');
       } catch (error) {
           console.error("Failed to fetch participant details:", error);
       }
    };

    fetchParticipants();
  }, [activeCall?.conversationId, session?.user?.accessToken]);

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
        image: details?.image,
        profileImage: details?.image // Explicitly added for clarity
      };
    });

  const remoteCount = participants.length;
  const isOneOnOne = remoteCount <= 1;

  // --- Render Layouts ---

  // 1. Voice Only Layout (ONLY for 1:1)
  if (!activeCall?.isVideoCall && !isGroup) {
       const remoteUser = participants[0]; // For 1:1 Voice Call
       const showWaitingState = !remoteUser;
       
       return (
         <div className="relative w-full h-full bg-[#080808] flex items-center justify-center overflow-hidden">
             {/* Background Glow */}
             <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full animate-pulse pointer-events-none" />

             {/* Main Info */}
             <div className="z-10 flex flex-col items-center justify-center space-y-10">
                 <div className="relative">
                    {/* Audio track playback element (Hidden) */}
                    {participants.map(p => (
                        <div key={`audio-${p.id}`} className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0 overflow-hidden">
                            <ParticipantTile 
                                stream={p.stream as MediaStream}
                                userId={p.id}
                                displayName={p.name}
                                isLocal={false}
                                isVideoOff={true}
                                profileImage={p.image}
                            />
                        </div>
                    ))}

                    {/* Ringing / Active State Circles */}
                    <div className="absolute inset-0 rounded-full border border-primary/20 animate-[ping_3s_ease-out_infinite]" />
                    <div className="absolute -inset-4 rounded-full border border-primary/10 animate-[ping_3s_ease-out_infinite_1s]" />
                     
                    {remoteUser ? (
                       <img 
                          src={remoteUser.image || '/images/default-avatar.png'} 
                          alt={remoteUser.name}
                          className="w-48 h-48 rounded-full object-cover border-4 border-white/5 shadow-2xl relative z-10"
                       />
                    ) : (
                       <div className="w-48 h-48 rounded-full bg-[#151515] border-4 border-white/5 shadow-2xl relative z-10 flex items-center justify-center">
                          <Loader2 className="w-12 h-12 text-primary/50 animate-spin" />
                       </div>
                    )}
                 </div>
                 
                 <div className="text-center space-y-4">
                     <h2 className="text-4xl font-bold text-white tracking-tight">
                         {remoteUser ? remoteUser.name : 'Calling...'}
                     </h2>
                     <div className="flex items-center justify-center space-x-3 bg-white/5 px-6 py-2 rounded-full backdrop-blur-md border border-white/10">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-white/80 font-medium tracking-widest uppercase text-sm font-mono">
                            {callState === 'CONNECTED' ? 'Voice Call' : 'Connecting'}
                        </span>
                     </div>
                 </div>
             </div>

             {/* Controls Layer */}
             <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 bg-black/60 backdrop-blur-2xl p-4 rounded-[2rem] border border-white/10 shadow-2xl">
                 <CallControls />
             </div>
         </div>
       );
  }

  // 2. One-on-One Video Layout (WhatsApp Style PiP)
  if (isOneOnOne && activeCall?.isVideoCall && !isGroup) {
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
        <div className="relative w-full h-full bg-[#0b0b0b] flex items-center justify-center overflow-hidden">
            
            {/* MAIN VIDEO LAYER (Background) */}
            <div className="absolute inset-0 z-0">
                {showWaitingState ? (
                     <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                            <div className="relative z-10 w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                <Loader2 className="w-10 h-10 text-primary animate-spin" /> 
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-white text-xl font-semibold tracking-tight">Calling...</p>
                            <p className="text-white/40 text-sm font-medium">Waiting for participant to join</p>
                        </div>
                     </div>
                ) : (
                    <ParticipantTile 
                        stream={mainUser.stream as MediaStream}
                        userId={mainUser.id}
                        displayName={mainUser.name}
                        isLocal={mainUser.isLocal}
                        className="w-full h-full object-cover" 
                    />
                )}
            </div>

            {/* PiP VIDEO LAYER (Floating) */}
            <div 
                className={cn(
                    "absolute top-10 right-6 z-30 w-32 sm:w-44 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#1a1a1a] transition-all duration-500 hover:scale-[1.02] cursor-pointer group",
                    !pipUser.stream && "hidden"
                )}
                onClick={() => setIsPipSwapped(!isPipSwapped)}
            >
                 <ParticipantTile 
                    stream={pipUser.stream as MediaStream}
                    userId={pipUser.id}
                    displayName={pipUser.name}
                    isLocal={pipUser.isLocal}
                    className="w-full h-full object-cover"
                 />
                 <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-[10px] text-white/60 font-medium uppercase tracking-widest">Swap</span>
                 </div>
            </div>

            {/* CONTROLS LAYER */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40">
                <CallControls />
            </div>
            
            {/* Timer Pill */}
             <div className="absolute top-8 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
                <div className="bg-black/40 backdrop-blur-2xl px-5 py-2 rounded-full border border-white/10 flex items-center gap-3 shadow-xl">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-white/90 text-sm font-bold tracking-widest tabular-nums font-mono">
                        {callState === 'CONNECTED' ? '00:00' : 'CONNECTING...'}
                    </span>
                 </div>
            </div>

            {/* Top Bar Info (Optional, WhatsApp style) */}
            <div className="absolute top-8 left-8 z-40 flex items-center gap-3">
                 <div className="bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-bold">DH</span>
                    </div>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-white/90 text-sm font-bold uppercase tracking-widest">DevHuddle</span>
                    <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">{activeCall?.isVideoCall ? 'Video' : 'Audio'} Call</span>
                 </div>
            </div>
        </div>
      );
  }

  // For local user video status tracking (simplified)
  const isVideoSwitchedOnOrContextState = localStream?.getVideoTracks()[0]?.enabled ?? false;

  // 3. Group layout (WhatsApp Style: Main Area + Sidebar)
  const allParticipants = [
      { 
        id: 'local', 
        stream: localStream, 
        isLocal: true, 
        name: 'You', 
        image: session?.user?.image as string | undefined,
        isVideoOff: !isVideoSwitchedOnOrContextState // Ideally we get this from context
      },
      ...participants.map(p => ({
          ...p,
          isVideoOff: activeCall?.participants.get(p.id)?.isVideoOff ?? false
      }))
  ];

  // Determine which user to show in the main area
  // Priority: 1. Manually selected user, 2. First remote participant, 3. Local user
  const mainUser = allParticipants.find(p => p.id === selectedUser) || allParticipants.find(p => !p.isLocal) || allParticipants[0];

  return (
    <div className="flex flex-row h-full bg-[#080808] relative overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative h-full">
            {/* Background Ambient Glows */}
            <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
            
            {/* Main Video View */}
            <div className="flex-1 p-6 flex items-center justify-center z-10">
                <div className="w-full h-full max-w-4xl aspect-video rounded-3xl overflow-hidden border border-white/5 shadow-2xl bg-[#121212] relative group">
                    {/* BACKGROUND AUDIO ROUTER: 
                        Ensure all remote streams are rendered (even if hidden) so their audio plays.
                        We only render those NOT currently shown as mainUser.
                    */}
                    <div className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0 overflow-hidden">
                        {participants.map(p => (
                            p.id !== mainUser.id && (
                                <ParticipantTile 
                                    key={`audio-${p.id}`}
                                    stream={p.stream as MediaStream}
                                    userId={p.id}
                                    displayName={p.name}
                                    isLocal={false}
                                    isVideoOff={true}
                                    profileImage={p.image}
                                />
                            )
                        ))}
                    </div>

                    {mainUser.stream ? (
                        <ParticipantTile 
                            stream={mainUser.stream as MediaStream}
                            userId={mainUser.id}
                            displayName={mainUser.name}
                            isLocal={mainUser.isLocal}
                            isVideoOff={!activeCall?.isVideoCall || mainUser.isVideoOff}
                            profileImage={mainUser.image}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                            <Avatar className="w-32 h-32 border-4 border-white/10">
                                <AvatarImage src={mainUser.image || undefined} />
                                <AvatarFallback className="text-4xl bg-white/5">{mainUser.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <p className="text-white/60 font-medium">{mainUser.name}</p>
                        </div>
                    )}
                    
                    {/* User Label */}
                    <div className="absolute bottom-6 left-6 z-20">
                         <div className="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10">
                            <span className="text-white font-bold text-sm tracking-widest uppercase">
                                {mainUser.isLocal ? 'YOU' : mainUser.name}
                            </span>
                         </div>
                    </div>
                </div>
            </div>

            {/* Controls Bar - Floating in Main Area */}
            <div className="pb-10 pt-4 flex justify-center w-full z-20">
                <CallControls />
            </div>

            {/* Header / Info */}
            <div className="absolute top-8 left-10 flex items-center gap-4 z-20">
                <div className="flex flex-col">
                    <h2 className="text-white/90 text-sm font-bold uppercase tracking-[0.3em]">{activeCall?.isVideoCall ? 'Group Video Call' : 'Group Voice Call'}</h2>
                    <span className="text-primary text-[10px] font-bold tracking-widest mt-1 uppercase">Active Room</span>
                </div>
            </div>
        </div>

        {/* Sidebar: Participant List */}
        <div className="w-[340px] border-l border-white/5 bg-[#0a0a0a] flex flex-col z-30 shadow-2xl">
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold tracking-widest uppercase text-xs">Participants</h3>
                    <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">{allParticipants.length}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {allParticipants.map(profile => {
                    const isSelected = mainUser.id === profile.id;
                    return (
                        <div 
                            key={profile.id}
                            onClick={() => setSelectedUser(profile.id)}
                            className={cn(
                                "group p-3 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center gap-4",
                                isSelected 
                                    ? "bg-primary/10 border-primary/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
                                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
                            )}
                        >
                            <div className="relative">
                                <Avatar className="w-12 h-12 border border-white/10">
                                    <AvatarImage src={profile.image || undefined} />
                                    <AvatarFallback className="bg-white/5 text-white/40 text-xs">
                                        {profile.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                {profile.stream && (
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#0a0a0a] animate-pulse" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-white text-sm font-bold truncate">
                                        {profile.name} {profile.isLocal && '(You)'}
                                    </p>
                                </div>
                                <p className="text-white/40 text-[10px] font-medium tracking-wider uppercase mt-0.5">
                                    {profile.stream ? 'Connected' : 'Ringing...'}
                                </p>
                            </div>

                            {/* Media Status Icons can be added here */}
                        </div>
                    );
                })}
            </div>

            {/* Sidebar Bottom Ad (Optional, DevHuddle branding) */}
            <div className="p-6 mt-auto">
                <div className="bg-gradient-to-br from-primary/10 to-transparent p-4 rounded-2xl border border-primary/10">
                    <p className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Encrypted</p>
                    <p className="text-white/40 text-[9px] leading-relaxed">Your calls are private and secure with DevHuddle end-to-end encryption.</p>
                </div>
            </div>
        </div>
    </div>
  );
};

