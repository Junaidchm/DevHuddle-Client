import React from 'react';
import { Button } from '@/src/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface IncomingCallScreenProps {
  callerName: string;
  callerProfileImage?: string;
  isVideoCall: boolean;
  onAccept: () => void;
  onReject: () => void;
}

export const IncomingCallScreen = ({
  callerName,
  callerProfileImage,
  isVideoCall,
  onAccept,
  onReject,
}: IncomingCallScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-black/90 backdrop-blur-xl relative overflow-hidden animate-in fade-in duration-500">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full animate-pulse pointer-events-none" />

      {/* Caller Info */}
      <div className="relative z-10 flex flex-col items-center space-y-8 mb-12">
        <div className="relative">
          {/* Ringing Ripple Effect */}
          <div className="absolute inset-0 rounded-full border-2 border-primary/50 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
          <div className="absolute inset-0 rounded-full border border-primary/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_200ms]" />
          
          <Avatar className="w-32 h-32 border-4 border-black/50 shadow-2xl">
            <AvatarImage src={callerProfileImage} className="object-cover" />
            <AvatarFallback className="text-4xl bg-muted/20 text-white font-bold">
              {callerName?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {/* Call Type Icon Badge */}
          <div className="absolute -bottom-2 -right-2 bg-black/60 p-2 rounded-full border border-white/10 backdrop-blur-md">
            {isVideoCall ? (
                <Video className="w-5 h-5 text-white" />
            ) : (
                <Phone className="w-5 h-5 text-white" />
            )}
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white tracking-tight">{callerName}</h2>
          <p className="text-white/60 text-lg font-medium animate-pulse">
            Incoming {isVideoCall ? 'Video' : 'Audio'} Call...
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="relative z-10 flex items-center gap-16 mt-8">
        {/* Reject */}
        <div className="flex flex-col items-center gap-3">
          <Button
            size="icon"
            onClick={onReject}
            className="w-16 h-16 rounded-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 transition-all duration-300 shadow-lg hover:shadow-red-500/40 hover:scale-110"
          >
            <PhoneOff className="w-8 h-8" />
          </Button>
          <span className="text-xs font-medium text-white/50 tracking-wider uppercase">Decline</span>
        </div>

        {/* Accept */}
        <div className="flex flex-col items-center gap-3">
          <Button
            size="icon"
            onClick={onAccept}
            className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-400 text-white border-none shadow-[0_0_40px_-10px_rgba(34,197,94,0.6)] hover:shadow-[0_0_60px_-10px_rgba(34,197,94,0.8)] hover:scale-110 transition-all duration-300"
          >
            <Phone className="w-10 h-10 fill-current" />
          </Button>
          <span className="text-xs font-medium text-white/50 tracking-wider uppercase">Accept</span>
        </div>
      </div>
    </div>
  );
};
