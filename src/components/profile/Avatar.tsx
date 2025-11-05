// app/components/Avatar.tsx
'use client';
import React from 'react';
import { cn } from '@/src/lib/utils';

interface AvatarProps {
  src: string;
  alt: string;
  className?: string;
}

const Avatar = ({ src, alt, className }: AvatarProps) => {
  return (
    <div className="relative">
      <div className={cn("w-[150px] h-[150px] rounded-full border-4 border-white overflow-hidden bg-white shadow-lg", className)}>
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </div>
      <button
        className="absolute bottom-2 right-2 bg-white text-blue-500 border-none w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shadow-md"
        title="Change Profile Picture"
        onClick={() => alert('Change profile picture clicked')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>

      </button>
    </div>
  );
};

export default Avatar;