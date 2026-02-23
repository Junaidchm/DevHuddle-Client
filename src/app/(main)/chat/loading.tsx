import { ChatWindowSkeleton } from "@/src/components/skeletons/ChatWindowSkeleton";

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] max-w-7xl mx-auto bg-background shadow-sm rounded-lg overflow-hidden border border-border my-2 md:my-4">
        {/* Sidebar Skeleton (Hidden on mobile) */}
      <div className="hidden md:flex w-80 lg:w-96 flex-col border-r border-border h-full bg-card">
          <div className="h-14 border-b border-border flex items-center px-4">
              <div className="h-5 w-24 bg-muted rounded animate-pulse" />
          </div>
          <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted animate-pulse" />
                      <div className="flex-1 space-y-2">
                          <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                          <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* Chat Window Skeleton */}
      <ChatWindowSkeleton />
    </div>
  );
}
