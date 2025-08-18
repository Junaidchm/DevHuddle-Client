import { ImageTransform, ThumbnailGalleryProps } from "@/src/app/types/feed";
import { Thumbnail } from "./Thumbnail";
import { getImageStyle } from "@/lib/feed/getImageStyle";

// ThumbnailGallery component
export const ThumbnailGallery: React.FC<ThumbnailGalleryProps> = ({
  images,
  currentIndex,
  onSelect,
  onRemove,
  onMove,
  className = '',
}) => (
  <div className={`w-32 ${className}`}>
    <div className="text-center mb-4">
      <span className="text-sm text-slate-600 font-medium">
        {images.length > 0 ? `${currentIndex + 1} of ${images.length}` : '0 of 0'}
      </span>
    </div>
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
      {images.map((image, index) => (
        <Thumbnail
        key={image.id}
        image={image}
        index={index}
        isSelected={index === currentIndex}
        onSelect={onSelect}
        onRemove={onRemove}
        onMoveUp={index > 0 ? () => onMove(index, index - 1) : undefined}
        onMoveDown={index < images.length -1 ? () => onMove(index , index + 1) : undefined}
        />
      ))}
    </div>
  </div>
);