// "use client";

// import { cn } from "@/src/lib/utils";
// import { Loader2, UserPlus, UserMinus } from "lucide-react";
// import { useSession } from "next-auth/react";
// import { useFollowerInfo } from "../customHooks/useFollowerInfo";

// interface FollowButtonProps {
//   userId: string;
//   initialData?: {
//     followers: number;
//     isFollowedByUser: boolean;
//   };
//   variant?: "default" | "outline" | "ghost";
//   size?: "sm" | "md" | "lg";
//   showIcon?: boolean;
//   className?: string;
//   children?: React.ReactNode;
// }

// // export function FollowButton({
// //   userId,
// //   initialData,
// //   variant = "default",
// //   size = "md",
// //   showIcon = true,
// //   className,
// //   children,
// // }: FollowButtonProps) {
// //   const { data: session } = useSession();
// //   const { toggleFollow, isFollowing, isPending, followerInfo } =
// //     useFollowerInfo({
// //       userId,
// //       initialData,
// //     });

// //   // Don't render if no session (user not authenticated)
// //   if (!session?.user?.accessToken) {
// //     return null;
// //   }

// //   const baseClasses =
// //     "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

// //   const variantClasses = {
// //     default: isFollowing
// //       ? "bg-red-500 text-white hover:bg-red-600"
// //       : "bg-blue-500 text-white hover:bg-blue-600",
// //     outline: isFollowing
// //       ? "border border-red-500 text-red-500 hover:bg-red-50"
// //       : "border border-blue-500 text-blue-500 hover:bg-blue-50",
// //     ghost: isFollowing
// //       ? "text-red-500 hover:bg-red-50"
// //       : "text-blue-500 hover:bg-blue-50",
// //   };

// //   const sizeClasses = {
// //     sm: "h-8 px-3 text-sm",
// //     md: "h-10 px-4 text-sm",
// //     lg: "h-12 px-6 text-base",
// //   };

// //   const iconSizes = {
// //     sm: 14,
// //     md: 16,
// //     lg: 18,
// //   };

// //   const getButtonText = () => {
// //     if (children) return children;

// //     if (isPending) {
// //       return isFollowing ? "Unfollowing..." : "Following...";
// //     }

// //     return isFollowing ? "Unfollow" : "Follow";
// //   };

// //   const getIcon = () => {
// //     if (isPending) {
// //       return <Loader2 className="animate-spin" size={iconSizes[size]} />;
// //     }

// //     if (showIcon) {
// //       return isFollowing ? (
// //         <UserMinus size={iconSizes[size]} />
// //       ) : (
// //         <UserPlus size={iconSizes[size]} />
// //       );
// //     }

// //     return null;
// //   };

// //   return (
// //     <button
// //       onClick={toggleFollow}
// //       disabled={isPending}
// //       className={cn(
// //         baseClasses,
// //         variantClasses[variant],
// //         sizeClasses[size],
// //         className
// //       )}
// //       aria-label={isFollowing ? "Unfollow user" : "Follow user"}
// //     >
// //       {getIcon()}
// //       {showIcon && <span className="ml-2">{getButtonText()}</span>}
// //       {!showIcon && getButtonText()}
// //     </button>
// //   );
// // }

// // Compact version for lists/sidebars
// // export function FollowButtonCompact({
// //   userId,
// //   initialData,
// //   className,
// // }: Omit<FollowButtonProps, "variant" | "size" | "showIcon" | "children">) {
// //   return (
// //     <FollowButton
// //       userId={userId}
// //       initialData={initialData}
// //       variant="ghost"
// //       size="sm"
// //       showIcon={false}
// //       className={cn("text-xs", className)}
// //     />
// //   );
// // }

// // Text-only version for minimal UI
// export function FollowButtonText({
//   userId,
//   initialData,
//   className,
// }: Omit<FollowButtonProps, "variant" | "size" | "showIcon" | "children">) {
//   const { data: session } = useSession();
//   const {  isFollowing, isPending , toggleFollow } = useFollowerInfo({
//     userId,
//     initialData,
//   });

//   console.log(
//     "these are the use follower Info =============================>",
//     useFollowerInfo({
//       userId,
//       initialData,
//     })
//   );

//   if (!session?.user?.accessToken) {
//     return null;
//   }

//   return (
//     <button
//       onClick={() => toggleFollow()}
//       disabled={isPending}
//       className={cn(
//         "text-sm font-medium transition-colors hover:underline disabled:opacity-50",
//         isFollowing
//           ? "text-red-500 hover:text-red-600"
//           : "text-blue-500 hover:text-blue-600",
//         className
//       )}
//     >
//       {isPending ? (
//         <span className="flex items-center gap-1">
//           <Loader2 className="animate-spin" size={12} />
//           {isFollowing ? "Unfollowing..." : "Following..."}
//         </span>
//       ) : isFollowing ? (
//         "Unfollow"
//       ) : (
//         "Follow"
//       )}
//     </button>
//   );
// }


"use client";

import { cn } from "@/src/lib/utils";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useFollowerInfo } from "../customHooks/useFollowerInfo";

interface FollowButtonTextProps {
  userId: string;
  initialData?: {
    followers: number;
    isFollowedByUser: boolean;
  };
  className?: string;
  buttonType?: "profile" | "suggestion";
}

export function FollowButtonText({
  userId,
  initialData,
  className,
  buttonType = "profile",
}: FollowButtonTextProps) {
  const { data: session } = useSession();

  const { isFollowing, isPending, toogleFollow, actionBeingPerformed } = useFollowerInfo({
    userId,
    initialData,
    buttonType,
  });

  if (!session?.user?.accessToken) return null;

  const getButtonText = () => {
    if (isPending) {
      // Use the action being performed to determine the text
      return actionBeingPerformed === 'follow' ? "Following..." : "Unfollowing...";
    }
    return isFollowing ? "Unfollow" : "Follow";
  };

  return (
    <button
      onClick={() => toogleFollow("suggestion")}
      disabled={isPending}
      className={cn(
        "text-sm font-medium transition-colors hover:underline disabled:opacity-50",
        isFollowing
          ? "text-red-500 hover:text-red-600"
          : "text-blue-500 hover:text-blue-600",
        className
      )}
    >
      {isPending && <Loader2 className="animate-spin" size={12} />}
      {getButtonText()}
    </button>
  );
}
