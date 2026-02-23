import React from "react";
import PostsLoadingSkeleton from "../feed/feedEditor/PostsLoadingSkeleton";

export function PostDetailSkeleton() {
  return (
    <div className="max-w-[1128px] mx-auto px-0 sm:px-4 md:px-0 flex justify-center gap-6 mt-4 animate-pulse">
      {/* Main Content Skeleton */}
      <main className="flex-1 w-full max-w-[700px] min-w-0 flex flex-col gap-2">
        
        {/* Main Post Skeleton */}
        <article className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4">
             <div className="flex gap-3 mb-4">
                 <div className="w-12 h-12 rounded-full bg-gray-200" />
                 <div className="flex-1 space-y-2">
                     <div className="w-40 h-4 bg-gray-200 rounded" />
                     <div className="w-24 h-3 bg-gray-200 rounded" />
                 </div>
             </div>
             <div className="space-y-3 mb-6">
                 <div className="w-full h-4 bg-gray-200 rounded" />
                 <div className="w-full h-4 bg-gray-200 rounded" />
                 <div className="w-3/4 h-4 bg-gray-200 rounded" />
             </div>
             <div className="w-full h-64 bg-gray-200 rounded-lg mb-4" />
        </article>

        {/* Comments Skeleton */}
        <div className="space-y-4">
            <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
            <PostsLoadingSkeleton /> 
        </div>
      </main>

      {/* Right Sidebar Skeleton - Hidden on tablet/mobile */}
      <aside className="hidden lg:block w-[300px] flex-shrink-0">
         <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-64">
            <div className="w-1/2 h-5 bg-gray-200 rounded mb-4" />
            <div className="space-y-3">
               {[...Array(3)].map((_, i) => (
                   <div key={i} className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200" />
                      <div className="flex-1">
                          <div className="w-2/3 h-3 bg-gray-200 rounded mb-1" />
                          <div className="w-1/2 h-2 bg-gray-100 rounded" />
                      </div>
                   </div>
               ))}
            </div>
         </div>
      </aside>
    </div>
  );
}
