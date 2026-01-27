"use client";

import { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  analyser: AnalyserNode | null;
  isActive: boolean;
  barColor?: string; // Default to theme or gray
  barCount?: number;
  height?: number;
}

export function WaveformVisualizer({ 
  analyser, 
  isActive, 
  barColor = '#9ca3af', // gray-400 default
  barCount = 40,
  height = 30
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!analyser || !isActive || !canvasRef.current) {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const draw = () => {
      if (!isActive) return;

      analyser.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      // Calculate spacing
      const totalWidth = rect.width;
      const barWidth = 3; // Fixed thin bars like WhatsApp
      const gap = 3;
      // Recalculate bar count to fill width
      const totalBars = Math.floor(totalWidth / (barWidth + gap));
      const step = Math.floor(dataArray.length / totalBars);
      
      for (let i = 0; i < totalBars; i++) {
        const value = dataArray[i * step];
        
        // Randomize slightly for "voice" look if signal is low
        const percent = Math.max(0.1, value / 255); 
        
        // WhatsApp style: Bars grow from center
        const barHeight = Math.max(3, percent * rect.height);
        
        const x = i * (barWidth + gap);
        const y = (rect.height - barHeight) / 2;
        
        // Rounded caps
        ctx.fillStyle = barColor;
        
        // Use path for rounded rect
        ctx.beginPath();
        // ctx.roundRect(x, y, barWidth, barHeight, 50); // roundRect not universally supported in all TS/browsers context yet, using arc or fillRect is safer or polyfill
        // Simple manual rounded rect
        const radius = barWidth / 2;
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
      }
      
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser, isActive, barColor]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ width: '100%', height: `${height}px` }}
    />
  );
}
