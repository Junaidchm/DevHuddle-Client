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
        className="max-w-[100vw] w-full h-[100vh] p-0 overflow-hidden bg-black border-none shadow-none sm:rounded-none"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Video Call Interface</DialogTitle>
        
        {/* State Routing */}
        
        {isIncomingCall && incomingCall && (
          <IncomingCallScreen 
            callerName={incomingCall.callerName || 'Unknown'}
            callerProfileImage={incomingCall.callerProfileImage}
            isVideoCall={incomingCall.isVideoCall}
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
