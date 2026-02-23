"use client";

/**
 * ParticipantTile - Individual video tile for a participant
 */

import React, { useEffect, useRef } from 'react';
import { MicOff, VideoOff, User } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface ParticipantTileProps {
  stream: MediaStream;
  userId: string;
  displayName: string;
  isLocal: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
  className?: string;
}

export const ParticipantTile = ({
  stream,
  userId,
  displayName,
  isLocal,
  isMuted = false,
  isVideoOff = false,
}: ParticipantTileProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !stream) return;

    // Only update if stream ID changed or srcObject is missing
    const currentStream = videoElement.srcObject as MediaStream;
    if (currentStream && currentStream.id === stream.id) {
        return;
    }

    videoElement.srcObject = stream;
    
    // Force play and ensure volume is up for remote participants
    if (!isLocal) { 
      videoElement.volume = 1.0;
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
          playPromise.catch(e => {
              // Ignore abort errors caused by video pauses or new load requests
              if (e.name !== 'AbortError' && e.name !== 'NotAllowedError') {
                  console.error("Error playing remote video:", e);
              }
          });
      }
    }
  }, [stream, isLocal]);

  // Audio indicator animation
  const isSpeaking = false; // TODO: Implement audio level detection

  return (
    <div className="relative bg-[#0f0f0f] rounded-2xl overflow-hidden shadow-2xl border border-white/[0.03] w-full h-full group">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} 
        className={cn(
            "w-full h-full object-cover transition-all duration-700",
            isVideoOff ? "opacity-0 scale-105" : "opacity-100 scale-100"
        )}
      />

      {/* Placeholder when video is off */}
      <div 
        className={cn(
            "absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] transition-all duration-700",
             isVideoOff ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl relative z-10">
                 <User className="w-12 h-12 text-white/20" />
            </div>
        </div>
        {!isLocal && (
            <span className="mt-4 text-white/40 text-xs font-bold tracking-[0.2em] uppercase">{displayName}</span>
        )}
      </div>

      {/* Participant Info Bar */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-black/30 backdrop-blur-xl px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/5 transition-opacity duration-300 group-hover:bg-black/50">
            <span className="text-white/90 text-[10px] font-bold tracking-widest uppercase">
                {isLocal ? 'YOU' : displayName}
            </span>
            {isMuted && <MicOff className="w-3 h-3 text-red-500/80" />}
        </div>
      </div>

      {/* Status Overlay */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
         {isVideoOff && (
            <div className="bg-red-500/10 backdrop-blur-md p-1.5 rounded-full text-red-500 border border-red-500/20">
                <VideoOff className="w-3 h-3" />
            </div>
         )}
      </div>
      
      {/* Speaking Border Indicator */}
      {isSpeaking && !isLocal && (
        <div className="absolute inset-0 border-2 border-primary/50 rounded-2xl pointer-events-none z-30" />
      )}
    </div>
  );
};
