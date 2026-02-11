'use client';

import { Camera } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/src/lib/utils';

interface CoverImageProps {
  src?: string | null;
  editable?: boolean;
  onEdit?: () => void;
  className?: string;
}

const CoverImage = ({ src, editable, onEdit, className }: CoverImageProps) => {
  return (
    <div className={cn("relative w-full h-48 md:h-60 bg-muted overflow-hidden", className)}>
      {src ? (
        <Image
          src={src}
          alt="Cover"
          fill
          className="object-cover"
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-90" />
      )}
      
      {editable && (
        <button
          onClick={onEdit}
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors z-10"
          aria-label="Edit cover photo"
        >
          <Camera size={20} className="text-gray-600" />
        </button>
      )}
    </div>
  );
};

export default CoverImage;