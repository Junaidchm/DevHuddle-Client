// app/components/SidebarClient.tsx
"use client";
import { useQuery } from "@tanstack/react-query";
import { FollowButtonText } from "@/src/components/FollowButton";
import { SuggestedFollower } from "@/src/app/types";
import { getSuggestedUsersWithFollowerInfo } from "@/src/app/actions/follow";



export default function SidebarClient() {
  const data = useQuery({
    queryKey: ["suggestions"],
    queryFn: ()=> getSuggestedUsersWithFollowerInfo(), // Client-side API call
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Assume the data is already the array of users to follow
  const usersToFollow: SuggestedFollower[] | [] = data?.data?.suggestions ?? [];
  console.log(
    "this is the suggested data ---------------->",
    usersToFollow,
    usersToFollow.length
  );

  if (!usersToFollow.length) {
    return (
      <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
        <div className="text-xl font-bold">Who to follow</div>
        <p className="text-muted-foreground">
          No suggestions yet—start connecting!
        </p>
      </div>
    );
  }

  return (
    <aside className="w-[300px] flex-shrink-0">
      <div className="bg-white rounded-xl p-6 mb-6 border border-slate-200 shadow-sm">
        <h3 className="m-0 mb-4 text-lg font-semibold text-text-main flex items-center gap-2">
          {/* SVG icon here */}
          Who to Follow
        </h3>
        <div className="flex flex-col gap-4">
          {usersToFollow.map((user, index) => (
            <div key={user.id} className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={`${process.env.NEXT_PUBLIC_IMAGE_PATH}${user.profilePicture}` || "/default-avatar.png"}
                  alt={`${user.name}'s avatar`}
                  className="w-[42px] h-[42px] rounded-full object-cover"
                  aria-label="Contributor avatar"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] bg-success rounded-full flex items-center justify-center border-2 border-white">
                  <span className="text-white text-[0.5rem]">{index + 1}</span>
                </div>
              </div>
              <div className="flex-1">
                <span className="font-semibold text-sm text-text-main">
                  @{user.username}
                </span>
                <div className="text-xs text-text-light flex items-center gap-1">
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span className="text-xs text-text-light">
                    {user._count.followers} followers
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <FollowButtonText
                  userId={user.id}
                  initialData={{
                    followers: user._count.followers,
                    isFollowedByUser: false,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
