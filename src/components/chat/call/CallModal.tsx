import React from 'react';
import { useVideoCall } from '@/src/contexts/VideoCallContext';
import { Dialog, DialogContent, DialogTitle } from '@/src/components/ui/dialog';
import { IncomingCallScreen } from './ui/IncomingCallScreen';
import { OutgoingCallScreen } from './ui/OutgoingCallScreen';
import { ActiveCallLayout } from './ui/ActiveCallLayout';

export const CallModal = () => {
  const { 
    callState, 
    activeCall, 
    acceptCall, 
    rejectCall, 
    leaveCall, 
    incomingCall,
    remoteStreams 
  } = useVideoCall();

  const isIncomingCall = callState === 'INCOMING';
  const isCalling = callState === 'CALLING';
  const isConnected = callState === 'CONNECTED';
  
  // Logic to determine if we are "Calling" (waiting for answer) or "Active" (in call with people)
  // For 1:1 calls, if we are connected but no remote streams yet -> we are technically waiting.
  // But strictly, 'CONNECTED' means verifyClient accepted the join. 
  // We can trust callState for the coarse transition, and ActiveCallLayout can handle the "Waiting for others" sub-state if needed.
  // HOWEVER: The user wants a distinct "Calling..." screen with Avatar.
  
  // If we initiated (isCalling), show Outgoing.
  // If we are connected, show Active.
  
  const isOpen = isIncomingCall || isCalling || isConnected;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-[1000px] w-[95vw] h-[650px] max-h-[85vh] p-0 overflow-hidden bg-[#0b0b0b] border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] sm:rounded-[32px] outline-none"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Video Call Interface</DialogTitle>
        
        {/* State Routing */}
        
        {isIncomingCall && incomingCall && (
          <IncomingCallScreen 
            callerName={incomingCall.callerName || incomingCall.data?.callerName || 'Unknown'}
            callerProfileImage={incomingCall.callerProfileImage || incomingCall.data?.callerProfileImage}
            isVideoCall={incomingCall.isVideoCall ?? incomingCall.data?.isVideoCall}
            callScope={incomingCall.callScope || incomingCall.data?.callScope}
            groupName={incomingCall.groupName || incomingCall.data?.groupName}
            groupAvatar={incomingCall.groupAvatar || incomingCall.data?.groupAvatar}
            onAccept={acceptCall}
            onReject={rejectCall}
          />
        )}

        {isCalling && activeCall && (
           <OutgoingCallScreen 
             conversationId={activeCall.conversationId}
             onCancel={leaveCall}
           />
        )}

        {isConnected && (
            <ActiveCallLayout />
        )}

      </DialogContent>
    </Dialog>
  );
};
