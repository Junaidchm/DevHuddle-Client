import {
  ImageData,
  ImageTransform,
  User as UserType,
} from "@/src/app/types/feed";
import { useState } from "react";

// ImagePreview component
interface ImagePreviewProps {
  image: string;
  transform: ImageTransform;
  taggedUsers: UserType[];
  badgeContent?: string | number;
  className?: string;
  getImageStyle:()=> React.CSSProperties
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  image,
  transform,
  taggedUsers,
  getImageStyle,
  badgeContent = "33",
  className = "",
}) => {
 
  return (
    <div
      className={`relative flex-1 bg-gray-100 rounded-lg overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={image}
          alt={transform.altText || "Selected"}
          className="max-w-full max-h-full object-contain rounded-lg"
          style={getImageStyle()}
        />
      </div>

      {/* {taggedUsers.length > 0 && (
        <div className="absolute bottom-4 left-4 flex gap-2">
          {taggedUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white bg-opacity-90 px-2 py-1 rounded-full text-xs font-medium text-slate-800 shadow-lg"
            >
              @{user.name.split(" ")[0]}
            </div>
          ))}
        </div>
      )} */}
    </div>
  );
};
