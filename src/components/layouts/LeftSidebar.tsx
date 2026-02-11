import { auth } from "@/auth";
import { Card, CardContent } from "@/src/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import Link from "next/link";
import { PROFILE_DEFAULT_URL } from "@/src/constants";
import { Separator } from "@/src/components/ui/separator";

export default async function LeftSidebar() {
  const session = await auth();
  const user = session?.user;

  if (!user) return null;

  return (
    <div className="w-[225px] flex-shrink-0 hidden md:block space-y-2">
      <Card className="overflow-hidden border-none shadow-sm pb-2">
        <div className="relative h-14 bg-[#A0B4B7] w-full">
            {/* Cover Photo Placeholder */}
        </div>
        
        <div className="px-3 pb-3 relative text-center">
            <Link href={`/profile/${user.username}`}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 cursor-pointer">
                    <Avatar className="h-16 w-16 border-2 border-white cursor-pointer">
                        <AvatarImage src={user.image || PROFILE_DEFAULT_URL} alt={user.name || "User"} />
                        <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                </div>
            </Link>

            <div className="mt-10 mb-4">
                <Link href={`/profile/${user.username}`}>
                    <h3 className="text-base font-semibold hover:underline cursor-pointer decoration-2 decoration-primary underline-offset-2 text-foreground">
                        {user.name}
                    </h3>
                </Link>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {/* Placeholder headline since it's not in session */}
                    Software Engineer | React & Node.js Enthusiast
                </p>
            </div>

            <Separator className="my-3"/>
            
            <div className="text-left w-full">
                <div className="flex justify-between items-center py-1 px-1 hover:bg-muted/50 cursor-pointer rounded">
                    <span className="text-xs text-muted-foreground font-medium">Profile viewers</span>
                    <span className="text-xs font-semibold text-primary">42</span>
                </div>
                 <div className="flex justify-between items-center py-1 px-1 hover:bg-muted/50 cursor-pointer rounded">
                    <span className="text-xs text-muted-foreground font-medium">Post impressions</span>
                    <span className="text-xs font-semibold text-primary">128</span>
                </div>
            </div>

             <Separator className="my-3"/>

             <div className="text-left px-1 hover:bg-muted/50 cursor-pointer rounded py-2">
                 <span className="text-xs text-foreground font-semibold block">My Items</span>
             </div>
        </div>
      </Card>
      
      {/* Groups / Recent Section Placeholder */}
      <Card className="border-none shadow-sm p-3">
         <div className="text-xs font-semibold mb-2">Recent</div>
         <div className="flex items-center gap-2 text-xs text-muted-foreground hover:bg-muted p-1 rounded cursor-pointer">
             <span className="font-bold">#</span>
             <span>javascript</span>
         </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground hover:bg-muted p-1 rounded cursor-pointer">
             <span className="font-bold">#</span>
             <span>webdevelopment</span>
         </div>
          <div className="py-2 text-xs font-semibold text-primary cursor-pointer hover:underline text-center">
            Discover more
          </div>
      </Card>
    </div>
  );
}
