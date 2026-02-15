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
    <div className="relative bg-muted/20 rounded-xl overflow-hidden shadow-lg border border-white/5 aspect-video w-full h-full group">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // Mute local video to prevent echo - CRITICAL
        className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isVideoOff ? "opacity-0" : "opacity-100"
        )}
      />

      {/* Placeholder when video is off */}
      <div 
        className={cn(
            "absolute inset-0 flex items-center justify-center bg-gray-900 transition-opacity duration-300",
             isVideoOff ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
             <User className="w-12 h-12 text-muted-foreground" />
        </div>
      </div>

      {/* Participant Info Bar */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
        <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2">
            <span className="text-white text-sm font-medium shadow-sm">
                {displayName} {isLocal && '(You)'}
            </span>
            {isMuted && <MicOff className="w-3 h-3 text-red-500" />}
        </div>
      </div>

      {/* Status Overlay */}
      <div className="absolute top-4 right-4 flex gap-2">
         {isVideoOff && (
            <div className="bg-black/40 backdrop-blur-md p-2 rounded-full text-red-500">
                <VideoOff className="w-4 h-4" />
            </div>
         )}
      </div>
      
      {/* Speaking Border Indicator */}
      {isSpeaking && !isLocal && (
        <div className="absolute inset-0 border-4 border-green-500/50 rounded-xl pointer-events-none" />
      )}
    </div>
  );
};
