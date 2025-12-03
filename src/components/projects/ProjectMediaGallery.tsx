"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MediaItem {
  id: string;
  type: string;
  url: string;
  thumbnailUrl?: string;
  order: number;
  isPreview: boolean;
}

interface ProjectMediaGalleryProps {
  media: MediaItem[];
}

export default function ProjectMediaGallery({ media }: ProjectMediaGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sortedMedia = [...media].sort((a, b) => a.order - b.order);

  if (sortedMedia.length === 0) return null;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % sortedMedia.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + sortedMedia.length) % sortedMedia.length);
  };

  const currentMedia = sortedMedia[currentIndex];

  return (
    <div className="relative w-full bg-black">
      {/* Main Image/Video */}
      <div className="relative w-full aspect-video">
        {currentMedia.type === "IMAGE" ? (
          <Image
            src={currentMedia.url}
            alt={`Project media ${currentIndex + 1}`}
            fill
            className="object-contain"
          />
        ) : (
          <video
            src={currentMedia.url}
            controls
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* Navigation */}
      {sortedMedia.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Thumbnail Strip */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {sortedMedia.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(index)}
                className={`w-16 h-16 rounded overflow-hidden border-2 ${
                  index === currentIndex
                    ? "border-blue-500"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={item.thumbnailUrl || item.url}
                  alt={`Thumbnail ${index + 1}`}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
          </div>

          {/* Image Counter */}
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {sortedMedia.length}
          </div>
        </>
      )}
    </div>
  );
}

