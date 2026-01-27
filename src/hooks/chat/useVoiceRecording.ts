import { useState, useRef, useCallback } from 'react';
import { useMediaUpload } from './useMediaUpload';

type RecordingState = 'idle' | 'recording' | 'paused' | 'preview';

interface VoiceRecordingHookState {
  state: RecordingState;
  duration: number;
  error: string | null;
  audioBlob: Blob | null;
  analyser: AnalyserNode | null;
  waveformPeaks?: number[];
}

import { useEffect } from 'react';

export function useVoiceRecording() {
  const [hookState, setHookState] = useState<VoiceRecordingHookState>({
    state: 'idle',
    duration: 0,
    error: null,
    audioBlob: null,
    analyser: null,
    waveformPeaks: [],
  });

  // Refs for stable access during intervals/events
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null); // Ref for analyser
  const startTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0);

  const { uploadMediaAsync, isUploading } = useMediaUpload();

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create Audio Context for waveform visualization
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      
      // Store in refs
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

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

      mediaRecorder.start(100); // Collect chunks every 100ms
      mediaRecorderRef.current = mediaRecorder;

      // Start duration timer
      startTimeRef.current = Date.now();
      pausedDurationRef.current = 0;
      
      durationIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current - pausedDurationRef.current;
        setHookState((prev) => ({
          ...prev,
          duration: Math.floor(elapsed / 1000),
        }));
      }, 100);

      setHookState({
        state: 'recording',
        duration: 0,
        error: null,
        audioBlob: null,
        analyser,
        waveformPeaks: [],
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      setHookState({
        state: 'idle',
        duration: 0,
        error: 'Microphone access denied. Please enable microphone permissions.',
        audioBlob: null,
        analyser: null,
        waveformPeaks: [],
      });
    }
  }, []);

  // Capture waveform data for preview
  const captureWaveformData = useCallback(() => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate average amplitude for this frame
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      
      // Use functional state update to avoid dependency on hookState
      setHookState(prev => {
        // Only update if we are in recording state
        if (prev.state !== 'recording') return prev;
        
        return {
          ...prev,
          waveformPeaks: [...(prev.waveformPeaks || []), average]
        };
      });
    }
  }, []); // ID empty dependency array because we use refs

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && hookState.state === 'recording') {
      mediaRecorderRef.current.pause();
      
      // Stop duration timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      
      pausedDurationRef.current += Date.now() - startTimeRef.current;

      setHookState((prev) => ({
        ...prev,
        state: 'paused',
      }));
    }
  }, [hookState.state]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && hookState.state === 'paused') {
      mediaRecorderRef.current.resume();
      
      // Restart duration timer
      startTimeRef.current = Date.now();
      
      durationIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setHookState((prev) => ({
          ...prev,
          duration: Math.floor((pausedDurationRef.current + elapsed) / 1000),
        }));
        
        // Also trigger waveform capture here if needed, but usually we rely on the visualizer loop or a separate interval
        // Since the visualizer is a separate component, let's start a data collection interval
      }, 100);

      setHookState((prev) => ({
        ...prev,
        state: 'recording',
      }));
    }
  }, [hookState.state]);

  // Effect to collect waveform data
  const dataCollectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (hookState.state === 'recording') {
      dataCollectionIntervalRef.current = setInterval(captureWaveformData, 100);
    } else {
      if (dataCollectionIntervalRef.current) {
        clearInterval(dataCollectionIntervalRef.current);
      }
    }
    return () => {
      if (dataCollectionIntervalRef.current) clearInterval(dataCollectionIntervalRef.current);
    };
  }, [hookState.state, captureWaveformData]);

  // Stop recording and enter preview mode
  const stopRecording = useCallback(() => {
    return new Promise<void>((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve();
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        // Clear interval
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }

        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const finalDuration = hookState.duration;

        setHookState((prev) => ({
          ...prev,
          state: 'preview',
          audioBlob,
          duration: finalDuration,
          // Keep the collected peaks
        }));

        resolve();
      };

      mediaRecorderRef.current.stop();
    });
  }, [hookState.duration]);

  // Send voice message (upload now)
  const sendVoiceMessage = useCallback(async (): Promise<{
    mediaUrl: string;
    mediaId: string;
    duration: number;
  } | null> => {
    if (!hookState.audioBlob) return null;

    try {
      const file = new File([hookState.audioBlob], `voice-${Date.now()}.webm`, {
        type: 'audio/webm',
      });

      const uploadResult = await uploadMediaAsync({
        file,
        mediaType: 'CHAT_AUDIO',
      });

      // Cleanup after successful send
      cleanup();

      return {
        mediaUrl: uploadResult.mediaUrl,
        mediaId: uploadResult.mediaId,
        duration: hookState.duration,
      };
    } catch (error) {
      console.error('Failed to upload voice recording:', error);
      setHookState((prev) => ({
        ...prev,
        error: 'Failed to upload voice recording',
      }));
      return null;
    }
  }, [hookState.audioBlob, hookState.duration, uploadMediaAsync]);

  // Discard recording
  const discardRecording = useCallback(() => {
    cleanup();
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

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

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;

    // Clear chunks
    audioChunksRef.current = [];

    // Reset state
    setHookState({
      state: 'idle',
      duration: 0,
      error: null,
      audioBlob: null,
      analyser: null,
      waveformPeaks: [],
    });
  }, []);

  return {
    ...hookState,
    isUploading,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    sendVoiceMessage,
    discardRecording,
  };
}
