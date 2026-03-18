import PostComposer from "@/src/components/feed/feedEditor/PostComposer";
import FeedContainer from "@/src/components/feed/feedEditor/FeedContainer";
import Sidebar from "@/src/components/feed/feedEditor/SideBar"
import { auth } from "@/auth";

interface CommunityFeedProps {
  params: { userId: string };
} 

export default async function CommunityFeed({ params }: CommunityFeedProps) {
  let { userId } = params;

  const session = await auth();

  return (
    <div className="max-w-[1128px] mx-auto px-4 md:px-0 flex justify-center gap-6">
      {/* Main Feed */}
      <main className="flex-1 w-full max-w-[555px] min-w-0 flex flex-col gap-2">
        <PostComposer userId={userId} />
        {/* Separator or just spacing */}
        <div className="w-full h-px bg-border my-2 md:hidden"></div>
        <FeedContainer userid={session?.user.id as string}/> 
      </main>

      {/* Right Sidebar - Hidden on tablet/mobile */}
      <aside className="hidden lg:block w-[300px] flex-shrink-0">
        <Sidebar />
      </aside>
    </div>
  );
}
