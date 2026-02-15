/**
 * Custom Hook for WebRTC Peer Connection Management
 * Handles RTCPeerConnection lifecycle, media tracks, and ICE candidates
 */

import { useCallback, useRef, useMemo } from 'react';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

export interface WebRTCHookReturn {
  createPeerConnection: (
    remoteUserId: string,
    onTrack: (stream: MediaStream) => void,
    onIceCandidate: (candidate: RTCIceCandidate) => void
  ) => RTCPeerConnection;
  
  createOffer: (pc: RTCPeerConnection) => Promise<RTCSessionDescriptionInit>;
  
  createAnswer: (
    pc: RTCPeerConnection,
    offer: RTCSessionDescriptionInit
  ) => Promise<RTCSessionDescriptionInit>;
  
  handleRemoteOffer: (
    pc: RTCPeerConnection,
    offer: RTCSessionDescriptionInit
  ) => Promise<void>;
  
  handleRemoteAnswer: (
    pc: RTCPeerConnection,
    answer: RTCSessionDescriptionInit
  ) => Promise<void>;
  
  addIceCandidate: (
    pc: RTCPeerConnection,
    candidate: RTCIceCandidateInit
  ) => Promise<void>;
  
  addLocalStream: (pc: RTCPeerConnection, stream: MediaStream) => void;
  
  getUserMedia: (audioOnly?: boolean) => Promise<MediaStream>;
  
  getDisplayMedia: () => Promise<MediaStream>;
}

export const useWebRTC = (): WebRTCHookReturn => {
  const pendingIceCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

  /**
   * Create a new RTCPeerConnection
   */
  const createPeerConnection = useCallback(
    (
      remoteUserId: string,
      onTrack: (stream: MediaStream) => void,
      onIceCandidate: (candidate: RTCIceCandidate) => void
    ): RTCPeerConnection => {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      // Handle incoming tracks
      pc.ontrack = (event) => {
        console.log('[WebRTC] Received remote track', { remoteUserId, kind: event.track.kind });
        if (event.streams && event.streams[0]) {
          onTrack(event.streams[0]);
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('[WebRTC] ICE candidate generated', { remoteUserId });
          onIceCandidate(event.candidate);
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('[WebRTC] Connection state:', {
          remoteUserId,
          state: pc.connectionState,
        });
      };

      pc.oniceconnectionstatechange = () => {
        console.log('[WebRTC] ICE connection state:', {
          remoteUserId,
          state: pc.iceConnectionState,
        });
      };

      return pc;
    },
    []
  );

  /**
   * Create an offer
   */
  const createOffer = useCallback(async (pc: RTCPeerConnection) => {
    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    await pc.setLocalDescription(offer);
    return offer;
  }, []);

  /**
   * Create an answer
   */
  const createAnswer = useCallback(
    async (pc: RTCPeerConnection, offer: RTCSessionDescriptionInit) => {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      return answer;
    },
    []
  );

  /**
   * Handle remote offer
   */
  const handleRemoteOffer = useCallback(
    async (pc: RTCPeerConnection, offer: RTCSessionDescriptionInit) => {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
    },
    []
  );

  /**
   * Handle remote answer
   */
  const handleRemoteAnswer = useCallback(
    async (pc: RTCPeerConnection, answer: RTCSessionDescriptionInit) => {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    },
    []
  );

  /**
   * Add ICE candidate
   */
  const addIceCandidate = useCallback(
    async (pc: RTCPeerConnection, candidate: RTCIceCandidateInit) => {
      try {
        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('[WebRTC] ICE candidate added');
        } else {
          console.warn('[WebRTC] Remote description not set, queuing ICE candidate');
          // Queue for later
        }
      } catch (error) {
        console.error('[WebRTC] Failed to add ICE candidate:', error);
      }
    },
    []
  );

  /**
   * Add local stream to peer connection
   */
  const addLocalStream = useCallback((pc: RTCPeerConnection, stream: MediaStream) => {
    stream.getTracks().forEach((track) => {
      console.log('[WebRTC] Adding local track:', track.kind);
      pc.addTrack(track, stream);
    });
  }, []);

  /**
   * Get user media (camera + microphone)
   */
  const getUserMedia = useCallback(async (audioOnly = false) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: audioOnly ? false : { width: 1280, height: 720 },
      });
      console.log('[WebRTC] Got user media:', { audioOnly });
      return stream;
    } catch (error) {
      console.error('[WebRTC] Failed to get user media:', error);
      throw error;
    }
  }, []);

  /**
   * Get display media (screen share)
   */
  const getDisplayMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' } as any,
        audio: false,
      });
      console.log('[WebRTC] Got display media');
      return stream;
    } catch (error) {
      console.error('[WebRTC] Failed to get display media:', error);
      throw error;
    }
  }, []);

  return useMemo(() => ({
    createPeerConnection,
    createOffer,
    createAnswer,
    handleRemoteOffer,
    handleRemoteAnswer,
    addIceCandidate,
    addLocalStream,
    getUserMedia,
    getDisplayMedia,
  }), [
    createPeerConnection,
    createOffer,
    createAnswer,
    handleRemoteOffer,
    handleRemoteAnswer,
    addIceCandidate,
    addLocalStream,
    getUserMedia,
    getDisplayMedia
  ]);
};
