'use client';

import { Camera } from 'lucide-react';
import Image from 'next/image';

interface CoverImageProps {
  src?: string | null;
  editable?: boolean;
  onEdit?: () => void;
}

const CoverImage = ({ src, editable, onEdit }: CoverImageProps) => {
  return (
    <div className="relative w-full h-48 md:h-60 bg-gradient-to-r from-slate-200 to-slate-300 overflow-hidden">
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