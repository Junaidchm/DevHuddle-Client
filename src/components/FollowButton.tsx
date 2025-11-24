
"use client";

import { cn } from "@/src/lib/utils";
import { Loader2, UserPlus, UserMinus } from "lucide-react";
import { useFollow } from "../hooks/useFollow";

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function FollowButton({
  userId,
  isFollowing,
  variant = "default",
  size = "md",
  className,
}: FollowButtonProps) {
  const { followMutation, unfollowMutation } = useFollow();
  const isPending = followMutation.isPending || unfollowMutation.isPending;

  const handleToggleFollow = () => {
    if (isFollowing) {
      unfollowMutation.mutate(userId);
    } else {
      followMutation.mutate(userId);
    }
  };

  return (
    <button
      onClick={handleToggleFollow}
      disabled={isPending}
      className={cn(
        "py-2.5 px-5 rounded-lg font-medium cursor-pointer transition-all duration-200 text-sm flex items-center justify-center gap-2 disabled:opacity-50",
        {
          "bg-gray-200 text-gray-600 hover:bg-gray-300": isFollowing,
          "bg-blue-500 text-white hover:bg-blue-600": !isFollowing,
        },
        {
          "py-2 px-4 text-sm": size === "sm", // smaller variant
        },
        className
      )}
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {"..."}
        </>
      ) : isFollowing ? (
        "Unfollow"
      ) : (
        "Follow"
      )}
    </button>
  );
}
