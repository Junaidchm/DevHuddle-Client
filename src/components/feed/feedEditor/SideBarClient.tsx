"use client";
import { useQuery } from "@tanstack/react-query";
import { FollowButton } from "@/src/components/FollowButton";
import { SuggestedFollower } from "@/src/app/types";
import { getSuggestedUsersWithFollowerInfo } from "@/src/app/actions/follow";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { PROFILE_DEFAULT_URL } from "@/src/constants";
import { Info } from "lucide-react";
import { getMediaUrl } from "@/src/utils/media";

export default function SidebarClient({id}: { id: string }) {
  const { data } = useQuery({
    queryKey: ["suggestions", id],
    queryFn: () => getSuggestedUsersWithFollowerInfo(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Extract suggestions from the server action result: { suggestions: [...] }
  const usersToFollow: SuggestedFollower[] | [] = data?.suggestions ?? [];
  
  if (!usersToFollow.length) {
    return (
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Who to follow</CardTitle>
        </CardHeader>
        <CardContent>
             <p className="text-sm text-muted-foreground">
                No suggestions yet—start connecting!
            </p>
        </CardContent>
      </Card>
    );
  }

  return (
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-base font-semibold text-foreground">Add to your feed</CardTitle>
          <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
        </CardHeader>
        <CardContent className="grid gap-4">
          {usersToFollow.map((user, index) => (
            <div key={user.id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 overflow-hidden">
                 <Avatar className="h-10 w-10 border border-border shrink-0">
                    <AvatarImage 
                      src={getMediaUrl(user.profilePicture) || PROFILE_DEFAULT_URL} 
                      alt={user.name} 
                      className="object-cover"
                    />
                    <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm text-foreground truncate">
                        {user.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                       @{user.username}
                    </span>
                </div>
              </div>
              
              <FollowButton
                userId={user.id}
                isFollowing={user.isFollowedByUser}
                size="sm"
                className="w-fit h-7 text-xs px-3 rounded-full border-2 font-semibold hover:bg-muted/50 hover:border-foreground/50 shrink-0"
                variant="outline"
              />
            </div>
          ))}
          
           <div className="flex items-center gap-1 text-xs text-muted-foreground hover:bg-muted p-1 rounded cursor-pointer mt-1">
             <span className="font-semibold">View all recommendations</span>
             <Info className="h-3 w-3" /> {/* Arrow icon would be better */}
         </div>
        </CardContent>
      </Card>
  );
}
