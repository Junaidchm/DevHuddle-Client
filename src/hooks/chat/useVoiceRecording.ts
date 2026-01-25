import { useState, useRef, useCallback } from 'react';
import { useMediaUpload } from './useMediaUpload';

interface VoiceRecordingState {
  isRecording: boolean;
  duration: number;
  error: string | null;
}

export function useVoiceRecording() {
  const [state, setState] = useState<VoiceRecordingState>({
    isRecording: false,
    duration: 0,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { uploadMediaAsync, isUploading } = useMediaUpload();

  const startRecording = useCallback(async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;

      // Start duration timer
      const startTime = Date.now();
      durationIntervalRef.current = setInterval(() => {
        setState((prev) => ({
          ...prev,
          duration: Math.floor((Date.now() - startTime) / 1000),
        }));
      }, 100);

      setState({
        isRecording: true,
        duration: 0,
        error: null,
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      setState({
        isRecording: false,
        duration: 0,
        error: 'Microphone access denied. Please enable microphone permissions.',
      });
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<{
    mediaUrl: string;
    mediaId: string;
    duration: number;
  } | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = async () => {
        // Clear interval
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const duration = state.duration;

        // Reset state
        setState({
          isRecording: false,
          duration: 0,
          error: null,
        });

        // Upload to media service
        try {
          const file = new File([audioBlob], `voice-${Date.now()}.webm`, {
            type: 'audio/webm',
          });

          const uploadResult = await uploadMediaAsync({
            file,
            mediaType: 'CHAT_AUDIO',
          });

          resolve({
            mediaUrl: uploadResult.mediaUrl,
            mediaId: uploadResult.mediaId,
            duration,
          });
        } catch (error) {
          console.error('Failed to upload voice recording:', error);
          setState((prev) => ({
            ...prev,
            error: 'Failed to upload voice recording',
          }));
          resolve(null);
        }
      };

      mediaRecorderRef.current.stop();
    });
  }, [state.duration, uploadMediaAsync]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      audioChunksRef.current = [];

      setState({
        isRecording: false,
        duration: 0,
        error: null,
      });
    }
  }, [state.isRecording]);

  return {
    ...state,
    isUploading,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
