import React from 'react';

interface ContentIdentityCellProps {
  name: string;
  username: string;
  avatar?: string | null;
  subtext?: string;
  avatarSize?: 'sm' | 'md';
}

const ContentIdentityCell: React.FC<ContentIdentityCellProps> = ({
  name,
  username,
  avatar,
  subtext,
  avatarSize = 'md',
}) => {
  const sizeClasses = avatarSize === 'sm' ? 'w-6 h-6' : 'w-8 h-8';
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff`;

  return (
    <div className="flex items-center gap-3">
      <img
        src={avatar || fallbackAvatar}
        alt={name}
        className={`${sizeClasses} rounded-full object-cover bg-gray-200`}
        onError={(e) => {
          (e.target as HTMLImageElement).src = fallbackAvatar;
        }}
      />
      <div className="flex flex-col min-w-0">
        <div className="font-medium text-gray-800 truncate leading-tight">
          {name}
        </div>
        <div className="text-xs text-gray-500 truncate">
          @{username} {subtext && <span>• {subtext}</span>}
        </div>
      </div>
    </div>
  );
};

export default ContentIdentityCell;
