import React from "react";
import { Phone, Video, MoreVertical } from "lucide-react";
import { PROFILE_DEFAULT_URL } from "@/src/constents";

interface ChatHeaderProps {
  name: string;
  avatar: string; // Keep this for backward compatibility or use as initials
  image?: string | null;
  isOnline?: boolean;
  lastSeen?: string;
}

export function ChatHeader({ name, avatar, image, isOnline, lastSeen }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
      {/* User Info */}
      <div className="flex items-center gap-3">
        <div className="relative">
          {image ? (
            <img 
              src={image || PROFILE_DEFAULT_URL} 
              alt={name} 
              className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-100"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0A66C2] to-[#004182] flex items-center justify-center text-white font-semibold shadow-sm">
              {avatar}
            </div>
          )}
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#1B8917] rounded-full border-2 border-white shadow-sm" />
          )}
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">{name}</h2>
          <p className="text-xs text-gray-500">
            {isOnline ? (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#1B8917] rounded-full"></span>
                Active now
              </span>
            ) : lastSeen ? `Last seen ${lastSeen}` : 'Offline'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        <button className="p-2.5 text-gray-600 hover:text-[#0A66C2] hover:bg-blue-50 rounded-lg transition-colors">
          <Video className="w-5 h-5" />
        </button>
        <button className="p-2.5 text-gray-600 hover:text-[#0A66C2] hover:bg-blue-50 rounded-lg transition-colors">
          <Phone className="w-5 h-5" />
        </button>
        <button className="p-2.5 text-gray-600 hover:text-[#0A66C2] hover:bg-blue-50 rounded-lg transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
