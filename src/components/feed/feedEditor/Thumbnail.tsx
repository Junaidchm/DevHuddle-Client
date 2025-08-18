import { ImageTransform, ThumbnailProps } from "@/src/app/types/feed";
import { IconButton } from "./IconButton";
import { getImageStyle } from "@/lib/feed/getImageStyle";
import { useMedia } from "@/src/contexts/MediaContext";

export const Thumbnail: React.FC<ThumbnailProps> = ({
  image,
  index,
  isSelected,
  onSelect,
  onRemove,
  onMoveUp,
  onMoveDown,
  className = "",
}) => {

  const {setcurrentMediaId} = useMedia()
  return (
    <div className={`relative group ${className}`}>
      <img
        src={image.url}
        alt="Thumbnail"
        className={`w-24 h-24 object-cover rounded-lg cursor-pointer border-2 transition-all duration-200 ${
          isSelected
            ? "border-blue-500 shadow-lg"
            : "border-gray-200 hover:border-gray-300"
        } `}
        onClick={() => {
          onSelect(index);
          setcurrentMediaId(image.id)
        }}
        aria-label={`Select image ${index + 1}`}
        style={getImageStyle(image.transform as ImageTransform)}
      />
      <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
        {String(index + 1).padStart(2, "0")}
      </div>
      <IconButton
        icon={<span>×</span>}
        onClick={() => onRemove(image.id)}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
        ariaLabel={`Remove image ${image.name}`}
      />
      <div className="absolute left-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <IconButton
          icon={<span>↑</span>}
          onClick={onMoveUp}
          disabled={!onMoveUp}
          className="bg-white shadow-md rounded p-1 mb-1 text-xs hover:bg-gray-50"
          ariaLabel="Move image up"
        />
        <IconButton
          icon={<span>↓</span>}
          onClick={onMoveDown}
          disabled={!onMoveDown}
          className="bg-white shadow-md rounded p-1 text-xs hover:bg-gray-50"
          ariaLabel="Move image down"
        />
      </div>
    </div>
  );
};
