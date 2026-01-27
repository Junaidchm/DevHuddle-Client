"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Send, Trash2 } from 'lucide-react';

interface VoicePreviewPlayerProps {
  audioBlob: Blob;
  duration: number;
  waveformPeaks?: number[];
  onSend: () => void;
  onDiscard: () => void;
  isSending: boolean;
}

export function VoicePreviewPlayer({
  audioBlob,
  duration,
  waveformPeaks = [],
  onSend,
  onDiscard,
  isSending,
}: VoicePreviewPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');

  useEffect(() => {
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [audioBlob]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Draw static waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, rect.width, rect.height);

    // If no peaks, generate dummy ones
    const peaks = waveformPeaks.length > 0 
      ? waveformPeaks 
      : Array.from({ length: 50 }, () => Math.random() * 100 + 50);

    const barWidth = 3;
    const gap = 2;
    const totalBars = Math.floor(rect.width / (barWidth + gap));
    
    // Resample peaks to fit totalBars
    const resampledPeaks: number[] = [];
    const step = peaks.length / totalBars;
    for (let i = 0; i < totalBars; i++) {
        const index = Math.floor(i * step);
        resampledPeaks.push(peaks[index] || 0);
    }

    const progressPercent = duration > 0 ? currentTime / duration : 0;

    resampledPeaks.forEach((value, i) => {
        const x = i * (barWidth + gap);
        // Normalize height
        const normalizedValue = Math.min(1, Math.max(0.1, value / 255)); 
        const barHeight = normalizedValue * rect.height * 0.8; // 80% height Max
        const y = (rect.height - barHeight) / 2;

        const isPlayed = (i / totalBars) < progressPercent;

        // Color based on playback
        ctx.fillStyle = isPlayed ? '#0A66C2' : '#D1D5DB'; // Client Blue vs Gray-300

        // Rounded rect
        const radius = barWidth / 2;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx.lineTo(x + barWidth, y + barHeight - radius);
        ctx.quadraticCurveTo(x + barWidth, y + barHeight, x + barWidth - radius, y + barHeight);
        ctx.lineTo(x + radius, y + barHeight);
        ctx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    });

  }, [waveformPeaks, currentTime, duration]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    try {
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
      setIsPlaying(!audio.paused);
    } catch (error) {
      console.error("Playback failed:", error);
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.min(1, Math.max(0, x / rect.width));
    const time = percent * duration;
    
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 w-full h-full">
      <audio ref={audioRef} src={audioUrl || undefined} preload="metadata" />

      {/* Trash Button (Left) */}
        <button
            type="button"
            onClick={onDiscard}
            disabled={isSending}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors"
        >
            <Trash2 className="w-5 h-5" />
        </button>

      {/* Play/Pause */}
      <button
        type="button"
        onClick={togglePlayPause}
        className="p-2 text-gray-500 hover:text-[#0A66C2] hover:bg-gray-100 rounded-full transition-colors"
      >
        {isPlaying ? (
          <Pause className="w-6 h-6 fill-current" />
        ) : (
          <Play className="w-6 h-6 fill-current" />
        )}
      </button>

      {/* Waveform / Seek Area */}
      <div 
        className="flex-1 h-8 cursor-pointer relative"
        onClick={handleSeek}
      >
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* Duration */}
      <span className="text-xs text-gray-500 font-medium min-w-[35px]">
        {formatTime(currentTime || duration)}
      </span>

      {/* Send Button (Right) */}
      <button
        type="button"
        onClick={onSend}
        disabled={isSending}
        className="p-3 bg-[#0A66C2] text-white rounded-full hover:bg-[#004182] transition-colors shadow-sm disabled:opacity-70"
      >
        {isSending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
            <Send className="w-5 h-5 ml-0.5" />
        )}
      </button>
    </div>
  );
}
