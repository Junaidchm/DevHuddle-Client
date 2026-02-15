"use client";

/**
 * Video Call Context - Manages Video Call State and WebRTC Connections
 * Integrates with WebSocketContext for signaling
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import { useWebRTC } from '@/src/hooks/useWebRTC';
import { useWebSocket } from './WebSocketContext';
import { useSession } from 'next-auth/react';

// ==================== Types ====================

export type CallState = 'IDLE' | 'INCOMING' | 'CALLING' | 'CONNECTED' | 'ENDED';

export interface CallParticipant {
  userId: string;
  stream?: MediaStream;
  isMuted: boolean;
  isVideoOff: boolean;
  isSharingScreen: boolean;
}

export interface ActiveCall {
  conversationId: string;
  initiatorId: string;
  isVideoCall: boolean;
  participants: Map<string, CallParticipant>;
}

export interface VideoCallContextType {
  callState: CallState;
  activeCall: ActiveCall | null;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  
  // Actions
  startCall: (conversationId: string, isVideoCall: boolean) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  leaveCall: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => Promise<void>;
  incomingCall?: any;
}

const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined);

// ==================== Provider ====================

export const VideoCallProvider = ({ children }: { children: ReactNode }) => {
  const { sendMessage, isConnected } = useWebSocket();
  const webrtc = useWebRTC();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  // State
  const [callState, setCallState] = useState<CallState>('IDLE');
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [incomingCall, setIncomingCall] = useState<any>(null);

  // Media state
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Refs
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const screenStream = useRef<MediaStream | null>(null);

  // ==================== Safety Effects ====================

  // Clean up self-streams if they sneak in (e.g. race conditions)
  useEffect(() => {
    if (!currentUserId) return;

    setRemoteStreams(prev => {
      if (prev.has(currentUserId)) {
        console.warn('[VideoCall] 🧹 Found self in remoteStreams, purging...');
        const next = new Map(prev);
        next.delete(currentUserId);
        
        // Also close the peer connection
        const pc = peerConnections.current.get(currentUserId);
        if (pc) {
            console.warn('[VideoCall] 🔌 Closing loopback peer connection');
            pc.close();
            peerConnections.current.delete(currentUserId);
        }
        
        return next;
      }
      return prev;
    });
  }, [currentUserId]);

  // ==================== WebSocket Event Listeners ====================

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    console.log('[VideoCall] Effect running, currentUserId:', currentUserId);

    const handleIncomingCall = (event: CustomEvent) => {
      const data = event.detail;
      console.log('[VideoCall] Incoming call:', data);
      setIncomingCall(data);
      setCallState('INCOMING');
    };

    const handleParticipantJoined = async (event: CustomEvent) => {
      const { conversationId, userId } = event.detail;
      
      // SAFETY: Wait for session to load
      if (!currentUserId) {
          console.warn('[VideoCall] ⏳ Session loading, deferring join handling');
          return; 
      }

      console.log('[VideoCall] Participant joined:', { userId, currentUserId, match: userId === currentUserId });
      
      // SAFETY: Ignore self-join events to prevent loopback connections
      if (userId === currentUserId) {
          console.warn('[VideoCall] ⛔ Ignoring participant_joined for self');
          return;
      }

      if (activeCall?.conversationId !== conversationId) return;

      // Create peer connection and send offer
      await createPeerConnectionAndOffer(userId);
    };

    const handleParticipantLeft = (event: CustomEvent) => {
      const { userId } = event.detail;
      console.log('[VideoCall] Participant left:', userId);
      
      // Remove peer connection
      const pc = peerConnections.current.get(userId);
      if (pc) {
        pc.close();
        peerConnections.current.delete(userId);
      }
      
      // Remove remote stream
      setRemoteStreams((prev) => {
        const next = new Map(prev);
        next.delete(userId);
        return next;
      });
    };

    const handleCallSignal = async (event: CustomEvent) => {
      const { conversationId, fromUserId, signalType, signalData } = event.detail;
      
      if (!currentUserId) {
          console.warn('[VideoCall] ⏳ Session loading, ignoring signal');
          return;
      }

      console.log('[VideoCall] Signal received:', { fromUserId, currentUserId, signalType, match: fromUserId === currentUserId });
      
      // SAFETY: Ignore signals from self
      if (fromUserId === currentUserId) {
          console.warn('[VideoCall] ⛔ Ignoring signal from self');
          return;
      }

      if (activeCall?.conversationId !== conversationId) return;

      console.log('[VideoCall] Received signal:', { fromUserId, signalType });

      let pc = peerConnections.current.get(fromUserId);

      if (signalType === 'offer') {
        // Ensure we have a peer connection
        if (!pc) {
          pc = createPeerConnectionForUser(fromUserId);
        }
        // Handle offer and send answer
        await webrtc.handleRemoteOffer(pc, signalData);
        const answer = await webrtc.createAnswer(pc, signalData);
        sendSignal(fromUserId, 'answer', answer);
      } else if (signalType === 'answer') {
        if (pc) {
          if (pc.signalingState === 'stable') {
              console.warn("[VideoCall] Received answer but connection is already stable. Ignoring.", { fromUserId });
              return;
          }
          await webrtc.handleRemoteAnswer(pc, signalData);
        }
      } else if (signalType === 'ice-candidate') {
        if (pc) {
          await webrtc.addIceCandidate(pc, signalData);
        }
      }
    };

    const handleCallEnded = (event: CustomEvent) => {
      console.log('[VideoCall] Call ended:', event.detail);
      endCallCleanup();
    };

    const handleCallParticipants = (event: CustomEvent) => {
      const { participants } = event.detail;
      
      if (!currentUserId) return;

      console.log('[VideoCall] Current participants:', { participants, currentUserId });
      
      // Initialize placeholder state for participants so UI shows them
      // But DO NOT initiate offer to avoid Glare (collision). 
      // Let the existing participants (who receive 'participant_joined') initiate.
      setActiveCall((prev) => {
          if (!prev) return prev;
          const next = { ...prev };
          participants.forEach((userId: string) => {
             // SAFETY: Filter out self from participants list
             if (userId === currentUserId) return;

             if (!next.participants.has(userId)) {
                 next.participants.set(userId, {
                     userId,
                     isMuted: false,
                     isVideoOff: false,
                     isSharingScreen: false
                 });
             }
          });
          return next;
      });
    };

    const handleMediaToggled = (event: CustomEvent) => {
      const { userId, mediaType, isEnabled } = event.detail;
      console.log('[VideoCall] Media toggled:', { userId, mediaType, isEnabled });
      
      // Update participant state (UI will reflect this)
      setActiveCall((prev) => {
        if (!prev) return prev;
        const participant = prev.participants.get(userId);
        if (participant) {
          const updated = { ...participant };
          if (mediaType === 'audio') updated.isMuted = !isEnabled;
          if (mediaType === 'video') updated.isVideoOff = !isEnabled;
          if (mediaType === 'screen') updated.isSharingScreen = isEnabled;
          prev.participants.set(userId, updated);
          return { ...prev };
        }
        return prev;
      });
    };

    // Register listeners
    window.addEventListener('call:incoming', handleIncomingCall as unknown as EventListener);
    window.addEventListener('call:participant_joined', handleParticipantJoined as unknown as EventListener);
    window.addEventListener('call:participant_left', handleParticipantLeft as unknown as EventListener);
    window.addEventListener('call:signal', handleCallSignal as unknown as EventListener);
    window.addEventListener('call:ended', handleCallEnded as unknown as EventListener);
    window.addEventListener('call:participants', handleCallParticipants as unknown as EventListener);
    window.addEventListener('call:media_toggled', handleMediaToggled as unknown as EventListener);

    return () => {
      window.removeEventListener('call:incoming', handleIncomingCall as unknown as EventListener);
      window.removeEventListener('call:participant_joined', handleParticipantJoined as unknown as EventListener);
      window.removeEventListener('call:participant_left', handleParticipantLeft as unknown as EventListener);
      window.removeEventListener('call:signal', handleCallSignal as unknown as EventListener);
      window.removeEventListener('call:ended', handleCallEnded as unknown as EventListener);
      window.removeEventListener('call:participants', handleCallParticipants as unknown as EventListener);
      window.removeEventListener('call:media_toggled', handleMediaToggled as unknown as EventListener);
    };
  }, [activeCall, webrtc, currentUserId]);

  // ==================== Helper Functions ====================

  const sendSignal = (targetUserId: string, signalType: 'offer' | 'answer' | 'ice-candidate', signalData: any) => {
    if (!activeCall) return;
    sendMessage({
      type: 'call:signal',
      conversationId: activeCall.conversationId,
      targetUserId,
      signalType,
      signalData,
      content: '', // Required by type but unused
    });
  };

  const createPeerConnectionForUser = (userId: string): RTCPeerConnection => {
    console.log('[VideoCall] Creating peer connection for user:', { userId, currentUserId, isSelf: userId === currentUserId });
    const pc = webrtc.createPeerConnection(
      userId,
      (stream) => {
        if (!userId) {
            console.warn('[VideoCall] ⚠️ Attempted to add stream with invalid userId');
            return;
        }
        console.log('[VideoCall] Received remote stream from:', userId);
        setRemoteStreams((prev) => {
           // Prevent overwriting if stream ID is same (redundant event)
           const existing = prev.get(userId);
           if (existing && existing.id === stream.id) return prev;

           const next = new Map(prev).set(userId, stream);
           console.log('[VideoCall] Updated remoteStreams. Keys:', Array.from(next.keys()));
           return next;
        });
      },
      (candidate) => {
        sendSignal(userId, 'ice-candidate', candidate.toJSON());
      }
    );

    // Add local stream tracks
    if (localStream) {
      webrtc.addLocalStream(pc, localStream);
    }

    peerConnections.current.set(userId, pc);
    return pc;
  };

  const createPeerConnectionAndOffer = async (userId: string) => {
    const pc = createPeerConnectionForUser(userId);
    const offer = await webrtc.createOffer(pc);
    sendSignal(userId, 'offer', offer);
  };

  const endCallCleanup = () => {
    // Close all peer connections
    peerConnections.current.forEach((pc) => pc.close());
    peerConnections.current.clear();

    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    // Stop screen share
    if (screenStream.current) {
      screenStream.current.getTracks().forEach((track) => track.stop());
      screenStream.current = null;
      setIsScreenSharing(false);
    }

    // Clear state
    setRemoteStreams(new Map());
    setActiveCall(null);
    setCallState('IDLE');
    setIncomingCall(null);
  };

  // ==================== Public Actions ====================

  const startCall = async (conversationId: string, isVideoCall: boolean) => {
    try {
      setCallState('CALLING');

      // Get user media
      const stream = await webrtc.getUserMedia(!isVideoCall);
      setLocalStream(stream);
      setIsAudioEnabled(true);
      setIsVideoEnabled(isVideoCall);

      // Send start call message
      sendMessage({
        type: 'call:start',
        conversationId,
        isVideoCall,
        content: '', // Required by type
      });

      setActiveCall({
        conversationId,
        initiatorId: '', // Will be set by server
        isVideoCall,
        participants: new Map(),
      });

      setCallState('CONNECTED');
    } catch (error) {
      console.error('[VideoCall] Failed to start call:', error);
      setCallState('IDLE');
      alert('Failed to access camera/microphone');
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;

    try {
      const { conversationId, isVideoCall } = incomingCall;

      // Get user media
      const stream = await webrtc.getUserMedia(!isVideoCall);
      setLocalStream(stream);
      setIsAudioEnabled(true);
      setIsVideoEnabled(isVideoCall);

      // Join call
      sendMessage({
        type: 'call:join',
        conversationId,
        content: '',
      });

      setActiveCall({
        conversationId,
        initiatorId: incomingCall.callerId,
        isVideoCall,
        participants: new Map(),
      });

      setCallState('CONNECTED');
      setIncomingCall(null);
    } catch (error) {
      console.error('[VideoCall] Failed to accept call:', error);
      alert('Failed to access camera/microphone');
      setCallState('IDLE');
    }
  };

  const rejectCall = () => {
    setIncomingCall(null);
    setCallState('IDLE');
  };

  const leaveCall = () => {
    if (!activeCall) return;

    sendMessage({
      type: 'call:leave',
      conversationId: activeCall.conversationId,
      content: '',
    });

    endCallCleanup();
  };

  const toggleAudio = () => {
    if (!localStream || !activeCall) return;

    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);

      sendMessage({
        type: 'call:toggle_media',
        conversationId: activeCall.conversationId,
        mediaType: 'audio',
        isEnabled: audioTrack.enabled,
        content: '',
      });
    }
  };

  const toggleVideo = () => {
    if (!localStream || !activeCall) return;

    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);

      sendMessage({
        type: 'call:toggle_media',
        conversationId: activeCall.conversationId,
        mediaType: 'video',
        isEnabled: videoTrack.enabled,
        content: '',
      });
    }
  };

  const toggleScreenShare = async () => {
    if (!activeCall) return;

    try {
      if (!isScreenSharing) {
        // Start screen share
        const stream = await webrtc.getDisplayMedia();
        screenStream.current = stream;
        
        // Update local stream state to reflect screen share (this ensures self-view shows screen)
        setLocalStream(stream); 
        setIsScreenSharing(true);

        // Replace video track in all peer connections
        const videoTrack = stream.getVideoTracks()[0];
        peerConnections.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack).catch(err => console.error("Failed to replace track", err));
          }
        });

        // Handle screen share stop (user clicks "Stop sharing" in browser UI)
        videoTrack.onended = () => {
             stopScreenSharing();
        };

        sendMessage({
          type: 'call:toggle_media',
          conversationId: activeCall.conversationId,
          mediaType: 'screen',
          isEnabled: true,
          content: '',
        });
      } else {
         stopScreenSharing();
      }
    } catch (error) {
      console.error('[VideoCall] Failed to toggle screen share:', error);
    }
  };

  const stopScreenSharing = useCallback(async () => {
    // Stop screen tracks
    if (screenStream.current) {
        screenStream.current.getTracks().forEach((track) => track.stop());
        screenStream.current = null;
    }
    setIsScreenSharing(false);

    // RESTORE CAMERA
    try {
        // We need to get the camera stream again because the original might have been stopped or lost
        // Check if we can reuse the original localStream if we saved it? 
        // Better to request camera access again to be safe and ensure fresh tracks
        const cameraStream = await webrtc.getUserMedia(!isVideoEnabled); // Use current video preference
        setLocalStream(cameraStream);
        
        const cameraTrack = cameraStream.getVideoTracks()[0];
        
        // If video was disabled, we might get a track but it should be disabled if we respect isVideoEnabled
        // BUT getUserMedia(!isVideoEnabled) might return audio only if isVideoEnabled is false.
        // Let's assume we want to restore to previous state.
        
        if (cameraTrack) {
             if (!isVideoEnabled) cameraTrack.enabled = false;

             peerConnections.current.forEach((pc) => {
                const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
                if (sender) {
                    sender.replaceTrack(cameraTrack).catch(err => console.error("Failed to restore camera track", err));
                }
             });
        }
    } catch (e) {
        console.error("Failed to restore camera after screen share", e);
    }

    if (activeCall) {
        sendMessage({
            type: 'call:toggle_media',
            conversationId: activeCall.conversationId,
            mediaType: 'screen',
            isEnabled: false,
            content: '',
        });
    }
  }, [activeCall, isVideoEnabled, webrtc, sendMessage]);

  return (
    <VideoCallContext.Provider
      value={{
        callState,
        activeCall,
        localStream,
        remoteStreams,
        startCall,
        acceptCall,
        rejectCall,
        leaveCall,
        toggleAudio,
        toggleVideo,
        toggleScreenShare,
        incomingCall,
      }}
    >
      {children}
    </VideoCallContext.Provider>
  );
};

// ==================== Hook ====================

export const useVideoCall = () => {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error('useVideoCall must be used within VideoCallProvider');
  }
  return context;
};
