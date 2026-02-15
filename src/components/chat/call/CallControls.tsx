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
    toggleScreenShare,
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
    <div className="flex items-center gap-4 bg-black/60 backdrop-blur-xl px-8 py-4 rounded-full border border-white/10 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-500">
      <TooltipProvider delayDuration={100}>
        
        {/* Toggle Audio */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={toggleAudio}
              variant="ghost"
              size="icon"
              className={cn(
                "w-12 h-12 rounded-full transition-all duration-200",
                !isAudioEnabled 
                  ? "bg-red-500/90 text-white hover:bg-red-600 hover:text-white" 
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
          <TooltipContent side="top">
            <p>{isAudioEnabled ? 'Mute Microphone' : 'Unmute Microphone'}</p>
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
                "w-12 h-12 rounded-full transition-all duration-200",
                !isVideoEnabled 
                  ? "bg-red-500/90 text-white hover:bg-red-600 hover:text-white" 
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
          <TooltipContent side="top">
            <p>{isVideoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Screen Share */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={toggleScreenShare}
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-200"
            >
              <MonitorUp className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Share Screen</p>
          </TooltipContent>
        </Tooltip>

        <div className="w-px h-8 bg-white/10 mx-2" />

        {/* End Call */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={leaveCall}
              variant="destructive"
              size="icon"
              className="w-14 h-14 rounded-full shadow-lg bg-red-600 hover:bg-red-700 text-white transition-transform hover:scale-105"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>End Call</p>
          </TooltipContent>
        </Tooltip>
      
      </TooltipProvider>
    </div>
  );
};
