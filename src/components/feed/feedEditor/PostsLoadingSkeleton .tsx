import React from "react";

// Individual post skeleton
function PostSkeleton() {
  return (
    <article className="bg-white rounded-xl border border-slate-200 shadow-sm relative">
      {/* Three-dot menu skeleton */}
      <div className="absolute top-4 right-4 z-10">
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
      </div>

      {/* Header section */}
      <div className="p-4 flex items-center gap-3 border-b border-slate-100">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {/* Avatar skeleton */}
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {/* Name skeleton */}
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                {/* Username skeleton */}
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
              {/* Date skeleton */}
              <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="p-4">
        {/* Content lines skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-4/5 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-3/5 bg-gray-200 rounded animate-pulse" />
        </div>
        
        {/* PostIntract skeleton */}
        <div className="flex items-center gap-4">
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </article>
  );
}

// Multiple posts skeleton for loading state
export default function PostsLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto p-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <PostSkeleton key={index} />
      ))}
    </div>
  );
}