import { NotificationListSkeleton } from "@/src/components/notification";

export default function Loading() {
  return (
    <main className="container mx-auto max-w-3xl py-6 px-4 sm:px-6 lg:px-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Filters Skeleton */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
           <div key={i} className="h-8 w-20 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
        ))}
      </div>

      <div className="mt-6">
        <NotificationListSkeleton />
      </div>
    </main>
  );
}
