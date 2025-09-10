import { notFound } from 'next/navigation';
import PostComposer from '@/src/components/feed/feedEditor/PostComposer';
import FeedContainer from '@/src/components/feed/feedEditor/FeedContainer';
import Sidebar from '@/src/components/feed/feedEditor/SideBar';
import { FeedResponse, User } from '../types/feed';
import { useState } from 'react';
import { Providers } from '@/src/store/providers';


interface CommunityFeedProps {
  params: { userId: string };
}



export default async function CommunityFeed({ params }: CommunityFeedProps) {
  let { userId } = params;
  
  userId = "123455"
  // Mock data for now (replace with gRPC calls later)
  const user: User = {
    id: "1",
    name: 'Junaid Chm',
    avatar: 'https://i.pravatar.cc/150?img=3',
    title: 'Full Stack Developer',
  };


  // Validate userId (example: ensure it's a number or valid format)
  if (!userId || isNaN(Number(userId))) {
    notFound();
  }
  
  console.log('this is running .......... in server')

  return (
    <div className="max-w-6xl mx-auto my-8 px-[5%] flex gap-8 flex-wrap">
      <main className="flex-1 min-w-0">
       <Providers>
         <PostComposer userId={userId} user={user} />
       </Providers>
        <FeedContainer/>
      </main>
      <aside className="w-[300px] flex-shrink-0 hidden md:block">
        {/* <Sidebar user={user} contributors={initialFeed.contributors} /> */}
      </aside>

    </div>
  );

} 


