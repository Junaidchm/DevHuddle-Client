"use client";

/**
 * CallControls - Control bar for call actions
 */

import React from 'react';
import { useVideoCall } from '@/src/contexts/VideoCallContext';
import { Button } from '@/src/components/ui/button';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MonitorUp,
  MonitorOff,
  MoreVertical,
  Settings
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";

export const CallControls = () => {
  const {
    leaveCall,
    toggleAudio,
    toggleVideo,
    localStream,
  } = useVideoCall();

  // We need to access tracks from the context state or inspect the stream directly
  // Ideally, useVideoCall should export these booleans directly to avoid direct stream access in UI
  const audioTrack = localStream?.getAudioTracks()[0];
  const videoTrack = localStream?.getVideoTracks()[0];

  const isAudioEnabled = audioTrack?.enabled ?? true; // Default to true if track exists
  const isVideoEnabled = videoTrack?.enabled ?? true;
  
  // TODO: Add isScreenSharing boolean to context for better tracking

  return (
    <div className="flex items-center gap-4 bg-black/40 backdrop-blur-2xl px-6 py-3 rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] animate-in slide-in-from-bottom-10 fade-in duration-700">
      <TooltipProvider delayDuration={100}>
        
        {/* Toggle Audio */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={toggleAudio}
              variant="ghost"
              size="icon"
              className={cn(
                "w-12 h-12 rounded-full transition-all duration-300",
                !isAudioEnabled 
                  ? "bg-red-500 text-white hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.4)]" 
                  : "bg-white/10 text-white hover:bg-white/20"
              )}
            >
              {!isAudioEnabled ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-black/80 border-white/10 text-white">
            <p>{isAudioEnabled ? 'Mute' : 'Unmute'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Toggle Video */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={toggleVideo}
              variant="ghost"
              size="icon"
              className={cn(
                "w-12 h-12 rounded-full transition-all duration-300",
                !isVideoEnabled 
                  ? "bg-red-500 text-white hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.4)]" 
                  : "bg-white/10 text-white hover:bg-white/20"
              )}
            >
              {!isVideoEnabled ? (
                <VideoOff className="w-5 h-5" />
              ) : (
                <Video className="w-5 h-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-black/80 border-white/10 text-white">
            <p>{isVideoEnabled ? 'Stop Video' : 'Start Video'}</p>
          </TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* End Call */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={leaveCall}
              variant="destructive"
              size="icon"
              className="w-14 h-14 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.4)] bg-red-600 hover:bg-red-700 text-white transition-all hover:scale-110 active:scale-95"
            >
              <PhoneOff className="w-7 h-7" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-black/80 border-white/10 text-white">
            <p>End Call</p>
          </TooltipContent>
        </Tooltip>
      
      </TooltipProvider>
    </div>
  );
};
