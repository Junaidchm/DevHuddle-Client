import React from "react";

export function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Banner Skeleton */}
      <div className="h-48 md:h-64 bg-gray-200 w-full" />
      
      {/* Header Info Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative">
          <div className="bg-white rounded-xl shadow-sm p-6 pb-0">
             <div className="flex flex-col md:flex-row gap-6 items-start">
                 {/* Avatar */}
                 <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-300 border-4 border-white -mt-12 flex-shrink-0" />
                 
                 <div className="flex-1 w-full pt-2 md:pt-0">
                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                         <div className="space-y-2 w-full">
                             <div className="h-8 w-48 bg-gray-200 rounded" />
                             <div className="h-4 w-full max-w-md bg-gray-100 rounded" />
                             <div className="flex gap-2 mt-2">
                                 <div className="h-4 w-24 bg-gray-100 rounded" />
                                 <div className="h-4 w-24 bg-gray-100 rounded" />
                             </div>
                         </div>
                         <div className="flex gap-2 w-full md:w-auto">
                             <div className="h-10 w-28 bg-gray-200 rounded" />
                             <div className="h-10 w-28 bg-gray-200 rounded" />
                         </div>
                     </div>
                 </div>
             </div>
             
             {/* Tabs Skeleton */}
             <div className="flex gap-8 mt-8 border-t border-gray-100 pt-4">
                 <div className="h-6 w-20 bg-gray-200 rounded" />
                 <div className="h-6 w-20 bg-gray-200 rounded" />
                 <div className="h-6 w-20 bg-gray-200 rounded" />
                 <div className="h-6 w-20 bg-gray-200 rounded" />
             </div>
          </div>
      </div>

      {/* Content Skeleton */}
      <main className="max-w-7xl mx-auto my-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                  <div className="bg-white rounded-xl p-6 h-40 border border-gray-100" />
                  <div className="bg-white rounded-xl p-6 h-64 border border-gray-100" />
              </div>
              {/* Right Column */}
              <div className="hidden lg:block space-y-4">
                  <div className="bg-white rounded-xl p-6 h-64 border border-gray-100" />
              </div>
          </div>
      </main>
    </div>
  );
}
