"use client";

import { cn } from "@/src/lib/utils";

import { Loader2, UserPlus, UserMinus } from "lucide-react";

import { useFollow } from "../hooks/useFollow";

interface FollowButtonProps {
  userId: string;

  initialFollowerCount?: number;

  initialIsFollowing?: boolean;

  context?: "suggestion" | "profile";

  variant?: "default" | "outline" | "ghost";

  size?: "sm" | "md" | "lg";

  showIcon?: boolean;

  className?: string;

  children?: React.ReactNode;
}

export function FollowButton({
  userId,

  initialFollowerCount,

  initialIsFollowing,

  context = "suggestion",

  variant = "default",

  size = "md",

  showIcon = true,

  className,

  children,
}: FollowButtonProps) {
  const { toggleFollow, isFollowing, isPending, followerCount } = useFollow({
    userId,

    context,

    initialFollowerCount,

    initialIsFollowing,
  });

  return (
    <button
      onClick={toggleFollow}
      disabled={isPending}
      className={cn(
        "flex items-center justify-center gap-2 rounded-full font-semibold transition-colors",

        {
          "bg-blue-500 text-white hover:bg-blue-600":
            !isFollowing && variant === "default",

          "border border-slate-300 text-slate-600 hover:bg-slate-100":
            isFollowing && variant === "default",

          "hover:bg-gray-100": variant === "ghost",
        },

        {
          "h-8 px-3 text-xs": size === "sm",

          "h-9 px-4 text-sm": size === "md",

          "h-12 px-6 text-base": size === "lg",
        },

        className
      )}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : showIcon ? (
        isFollowing ? (
          <UserMinus className="h-4 w-4" />
        ) : (
          <UserPlus className="h-4 w-4" />
        )
      ) : null}

      {children || (isFollowing ? "Unfollow" : "Follow")}
    </button>
  );
}
