"use client";

import { Comment, Edit, Like, Share } from "@/src/constents/svg";
import React from "react";

// SocialActionButton component
interface SocialActionButtonProps {
  icon: React.ReactNode;
  count?: number;
  onClick?: () => void;
  className?: string;
}

export const SocialActionButton: React.FC<SocialActionButtonProps> = ({
  icon,
  count,
  onClick,
  className = "",
}) => (
  <button
    className={`bg-transparent border-none flex items-center gap-1.5 text-sm text-text-light cursor-pointer px-2 py-1 rounded transition-colors duration-200 ease-in-out hover:bg-gray-200 hover:text-gradient-start ${className}`}
    onClick={onClick}
  >
    {icon}
    {count !== undefined && count}
  </button>
);

// SocialIconButton component
interface SocialIconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const SocialIconButton: React.FC<SocialIconButtonProps> = ({
  icon,
  onClick,
  className = "",
}) => (
  <button
    className={`bg-transparent border-none p-1 text-text-light cursor-pointer transition-colors duration-200 ease-in-out rounded hover:text-gradient-start ${className}`}
    onClick={onClick}
  >
    {icon}
  </button>
);

interface PostIntractProps {
  actions?: {
    likes?: { count: number; onClick?: () => void };
    comments?: { count: number; onClick?: () => void };
    share?: { onClick?: () => void };
    edit?: { onClick?: () => void };
    more?: { onClick?: () => void };
  };
  className?: string;
}

export const PostIntract: React.FC<PostIntractProps> = ({ actions }) => {
  return (
    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
      <div className="flex gap-6">
        {true && (
          <SocialActionButton
            icon={Like}
            count={3}
            onClick={()=> {}}
          />
        )}
        {true && (
          <SocialActionButton
            icon={Comment}
            count={2}
            onClick={()=> {}}
          />
        )}
      </div>
      <div className="flex gap-3">
        {true && (
          <SocialIconButton icon={Share} onClick={()=> {}} />
        )}
        {true && (
          <SocialIconButton icon={Edit} onClick={()=> {}} />
        )}
      </div>
    </div>
  );
};
