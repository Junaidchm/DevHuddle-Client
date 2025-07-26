import { notFound } from 'next/navigation';
import PostComposer from '@/src/components/feed/PostComposer';
import FeedContainer from '@/src/components/feed/FeedContainer';
import Sidebar from '@/src/components/feed/SideBar';
import { FeedResponse, User } from '../types/feed';

interface CommunityFeedProps {
  params: { userId: string };
}

export default async function CommunityFeed({ params }: CommunityFeedProps) {
  let { userId } = params;
  
  userId = "123455"
  // Mock data for now (replace with gRPC calls later)
  const user: User = {
    id: 1,
    name: 'Junaid Chm',
    avatar: 'https://i.pravatar.cc/150?img=3',
    title: 'Full Stack Developer',
    points: 6500,
  };

  const initialFeed: FeedResponse = {
    posts: [
      {
        id: 1,
        content: "Just launched my new React component library! It's designed for maximum flexibility and performance.",
        mediaUrl: '',
        author: {
          id: 2,
          name: 'Sarah Dev',
          avatar: 'https://i.pravatar.cc/150?img=33',
          title: 'Frontend Developer',
        },
        likes: 42,
        comments: 18,
        tags: ['#react', '#frontend', '#opensource'],
        platform: 'Discord',
        timestamp: '2025-07-23T10:00:00Z',
      },
    ],
    contributors: [
      { id: 2, name: 'Sarah Dev', avatar: 'https://i.pravatar.cc/150?img=33', title: 'Frontend Developer', points: 14200 },
      { id: 3, name: 'Alex Coder', avatar: 'https://i.pravatar.cc/150?img=68', title: 'Data Scientist', points: 12800 },
      { id: 4, name: 'Jamie Backend', avatar: 'https://i.pravatar.cc/150?img=42', title: 'Backend Engineer', points: 11500 },
    ],
    nextCursor: 'cursor_1',
  };

  // Validate userId (example: ensure it's a number or valid format)
  if (!userId || isNaN(Number(userId))) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto my-8 px-[5%] flex gap-8 flex-wrap">
      <main className="flex-1 min-w-0">
        <PostComposer userId={userId} user={user} />
        <FeedContainer initialFeed={initialFeed} userId={userId} />
      </main>
      <aside className="w-[300px] flex-shrink-0 hidden md:block">
        <Sidebar user={user} contributors={initialFeed.contributors} />
      </aside>
    </div>
  );
}