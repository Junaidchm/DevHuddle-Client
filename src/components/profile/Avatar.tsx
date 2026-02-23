// app/components/Avatar.tsx
'use client';
import React from 'react';
import { cn } from '@/src/lib/utils';
import { PROFILE_DEFAULT_URL } from '@/src/constants';

interface AvatarProps {
  src: string;
  alt: string;
  className?: string;
}

const Avatar = ({ src, alt, className }: AvatarProps) => {
  const [imgSrc, setImgSrc] = React.useState(src);

  React.useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <div className="relative">
      <div className={cn("w-[150px] h-[150px] rounded-full border-4 border-white overflow-hidden bg-white shadow-lg", className)}>
        <img 
          src={imgSrc || PROFILE_DEFAULT_URL} 
          alt={alt} 
          className="w-full h-full object-cover"
          onError={() => setImgSrc(PROFILE_DEFAULT_URL)}
        />
      </div>
    </div>
  );
};

export default Avatar;