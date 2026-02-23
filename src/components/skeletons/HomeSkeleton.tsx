import React from "react";
import PostsLoadingSkeleton from "../feed/feedEditor/PostsLoadingSkeleton";

export default function HomeSkeleton() {
  return (
    <div className="max-w-[1128px] mx-auto px-0 sm:px-4 md:px-0 flex justify-center gap-6 animate-pulse">
      {/* Main Feed Skeleton */}
      <main className="flex-1 w-full max-w-[555px] min-w-0 flex flex-col gap-2">
        {/* PostComposer Skeleton */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex gap-3">
             <div className="w-10 h-10 rounded-full bg-gray-200" />
             <div className="flex-1 h-10 bg-gray-100 rounded-full" />
          </div>
          <div className="flex justify-between mt-3 pt-3 border-t border-slate-100">
             <div className="w-20 h-8 bg-gray-100 rounded" />
             <div className="w-20 h-8 bg-gray-100 rounded" />
          </div>
        </div>

        {/* Separator */}
        <div className="w-full h-px bg-gray-200 my-2 md:hidden"></div>
        
        {/* Sort Dropdown Skeleton */}
        <div className="flex justify-end mb-2">
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Feed Skeleton */}
        <PostsLoadingSkeleton />
      </main>

      {/* Right Sidebar Skeleton - Hidden on tablet/mobile */}
      <aside className="hidden lg:block w-[300px] flex-shrink-0">
         <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-64">
            <div className="w-1/2 h-5 bg-gray-200 rounded mb-4" />
            <div className="space-y-3">
               <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div className="flex-1">
                      <div className="w-2/3 h-3 bg-gray-200 rounded mb-1" />
                      <div className="w-1/2 h-2 bg-gray-100 rounded" />
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div className="flex-1">
                      <div className="w-2/3 h-3 bg-gray-200 rounded mb-1" />
                      <div className="w-1/2 h-2 bg-gray-100 rounded" />
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div className="flex-1">
                      <div className="w-2/3 h-3 bg-gray-200 rounded mb-1" />
                      <div className="w-1/2 h-2 bg-gray-100 rounded" />
                  </div>
               </div>
            </div>
         </div>
      </aside>
    </div>
  );
}
