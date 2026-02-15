import React from "react";
import { auth } from "@/auth";
import Sidebar from "@/src/components/feed/feedEditor/SideBar";
import PostDetailClient from "./PostDetailClient";

interface PostDetailPageProps {
  params: { id: string };
  searchParams: { commentId?: string };
}

export default async function PostDetailPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>, 
  searchParams: Promise<{ commentId?: string }> 
}) {
  const { id } = await params;
  const { commentId } = await searchParams;
  const session = await auth();

  return (
    <div className="max-w-[1128px] mx-auto px-0 sm:px-4 md:px-0 flex justify-center gap-6 mt-4">
      <PostDetailClient 
        id={id} 
        commentId={commentId || null} 
        userId={session?.user?.id} 
      />

      <aside className="hidden lg:block w-[300px] flex-shrink-0">
        <Sidebar />
      </aside>
    </div>
  );
}
