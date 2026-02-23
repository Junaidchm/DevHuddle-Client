import React from 'react';
import { Button } from '@/src/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface IncomingCallScreenProps {
  callerName: string;
  callerProfileImage?: string;
  isVideoCall: boolean;
  callScope?: 'ONE_TO_ONE' | 'GROUP';
  groupName?: string;
  groupAvatar?: string | null;
  onAccept: () => void;
  onReject: () => void;
}

export const IncomingCallScreen = ({
  callerName,
  callerProfileImage,
  isVideoCall,
  callScope,
  groupName,
  groupAvatar,
  onAccept,
  onReject,
}: IncomingCallScreenProps) => {
  const isGroup = callScope === 'GROUP';
  const displayTitle = isGroup ? (groupName || 'Group Call') : callerName;
  const displayImage = isGroup ? groupAvatar : callerProfileImage;
  const displaySubtitle = isGroup ? `Started by ${callerName}` : (isVideoCall ? 'Incoming Video Call' : 'Incoming Voice Call');
  return (
    <div className="flex flex-col items-center justify-between py-20 h-full w-full bg-black/95 backdrop-blur-2xl relative overflow-hidden animate-in fade-in duration-700">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full animate-pulse pointer-events-none" />

      {/* Caller Info */}
      <div className="relative z-10 flex flex-col items-center space-y-6">
        <div className="relative">
          {/* Ringing Ripple Effects */}
          <div className="absolute inset-0 rounded-full border border-primary/40 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
          <div className="absolute inset-0 rounded-full border border-primary/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite_1s]" />
          
          <Avatar className="w-40 h-40 border-4 border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <AvatarImage src={displayImage || undefined} className="object-cover" />
            <AvatarFallback className="text-5xl bg-gradient-to-br from-gray-800 to-gray-900 text-white font-semibold">
              {displayTitle?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="text-center space-y-3">
          <h2 className="text-4xl font-bold text-white tracking-tight">{displayTitle}</h2>
          <div className="flex flex-col items-center justify-center gap-1">
            <p className="text-white/60 text-lg font-medium">{displaySubtitle}</p>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <p className="text-primary/90 text-sm font-bold uppercase tracking-widest">
                {isVideoCall ? 'Video Call' : 'Audio Call'}
                </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="relative z-10 flex items-center gap-24">
        {/* Reject */}
        <div className="flex flex-col items-center gap-4">
          <Button
            size="icon"
            onClick={onReject}
            className="w-18 h-18 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-[0_0_25px_rgba(239,68,68,0.4)] transition-all duration-300 hover:scale-110 active:scale-95 border-none"
          >
            <PhoneOff className="w-8 h-8" />
          </Button>
          <span className="text-sm font-semibold text-white/40 tracking-wider uppercase">Decline</span>
        </div>

        {/* Accept */}
        <div className="flex flex-col items-center gap-4">
          <Button
            size="icon"
            onClick={onAccept}
            className="w-18 h-18 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-[0_0_25px_rgba(34,197,94,0.4)] transition-all duration-300 hover:scale-110 active:scale-95 border-none"
          >
            {isVideoCall ? (
              <Video className="w-8 h-8 fill-current" />
            ) : (
              <Phone className="w-8 h-8 fill-current" />
            )}
          </Button>
          <span className="text-sm font-semibold text-white/40 tracking-wider uppercase">Accept</span>
        </div>
      </div>
    </div>
  );
};
