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
    <div className="max-w-6xl mx-auto my-8 px-[5%] flex gap-8 flex-wrap">
      <main className="flex-1 min-w-0">
        <PostComposer userId={userId} />
        <FeedContainer userid={session?.user.id as string}/> 
      </main>
      <aside className="w-[300px] flex-shrink-0 hidden md:block">
        <Sidebar />
      </aside>
    </div>
  );
}
