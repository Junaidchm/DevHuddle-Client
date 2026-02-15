"use client";

/**
 * VideoGrid - Responsive grid layout for video call participants
 */

import React from 'react';
import { useVideoCall } from '@/src/contexts/VideoCallContext';
import { ParticipantTile } from './ParticipantTile';

import { useSession } from 'next-auth/react';

interface VideoGridProps {
  participantDetails?: Map<string, { name: string; image?: string }>;
}

export const VideoGrid = ({ participantDetails }: VideoGridProps) => {
  const { localStream, remoteStreams } = useVideoCall();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  console.log('[VideoGrid] Render. ParticipantDetails:', participantDetails?.size);

  // Deduplicate participants to ensure unique IDs
  const uniqueParticipants = new Map();
  
  // 1. Add Local
  if (localStream) {
      uniqueParticipants.set('local', { id: 'local', stream: localStream, isLocal: true, name: 'You' });
  }

  // 2. Add Remote (filtering self)
  Array.from(remoteStreams.entries()).forEach(([id, stream]) => {
      // Strict self check
      if (id === currentUserId) return;
      
      // Prevent duplicate
      if (uniqueParticipants.has(id)) return;

      // Lookup metadata
      const details = participantDetails?.get(id);
      const displayName = details?.name || 'Unknown User';
      // Note: ParticipantTile currently doesn't support image, we might need to update it users want avatar on video off
      
      uniqueParticipants.set(id, {
          id,
          stream,
          isLocal: false,
          name: displayName
      });
  });

  const participants = Array.from(uniqueParticipants.values());
  
  console.log('[VideoGrid] Final Participants List:', participants.map(p => ({ id: p.id, isLocal: p.isLocal, name: p.name })));

  const count = participants.length;

  // Dynamic grid configuration
  let gridClassName = "";
  
  if (count === 1) {
    gridClassName = "grid-cols-1 place-items-center"; // Single user centered
  } else if (count === 2) {
    gridClassName = "grid-cols-1 md:grid-cols-2 aspect-video"; // Split view
  } else if (count <= 4) {
    gridClassName = "grid-cols-2 grid-rows-2"; // 2x2 grid
  } else if (count <= 6) {
    gridClassName = "grid-cols-2 md:grid-cols-3"; // 2x3 grid
  } else {
    gridClassName = "grid-cols-3 md:grid-cols-4"; // Dense grid
  }

  return (
    <div className={`grid ${gridClassName} gap-4 w-full h-full max-w-7xl mx-auto p-4 transition-all duration-500`}>
      {participants.map((p) => (
        <div 
          key={p.id} 
          className={`relative w-full h-full overflow-hidden rounded-2xl shadow-2xl bg-gray-900 border border-white/5 transition-all
            ${count === 1 ? 'max-w-4xl aspect-video' : ''} 
            ${count === 2 ? 'aspect-video' : ''}
          `}
        >
          {p.stream ? (
            <ParticipantTile
              stream={p.stream}
              userId={p.id}
              displayName={p.name}
              isLocal={p.isLocal}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white/50 animate-pulse">
                Connecting...
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
