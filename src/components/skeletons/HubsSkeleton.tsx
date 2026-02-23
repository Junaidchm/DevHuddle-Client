import { Skeleton } from "@/src/components/ui/skeleton";

export function HubsSkeleton() {
  return (
    <div className="container max-w-6xl mx-auto py-8 space-y-8">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <Skeleton className="h-9 w-48 mb-2" />
                <Skeleton className="h-5 w-96" />
            </div>
        </div>

        {/* Search and Filter Skeleton */}
        <div className="space-y-4">
            <Skeleton className="h-11 w-full" />
            <div className="flex flex-wrap gap-2">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-24 rounded-full" />
                ))}
            </div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col h-full border rounded-xl p-6 space-y-4">
                     <div className="flex gap-4">
                        <Skeleton className="w-12 h-12 rounded-lg" />
                        <div className="flex-1 space-y-2">
                             <Skeleton className="h-5 w-3/4" />
                             <Skeleton className="h-3 w-1/2" />
                        </div>
                     </div>
                     <Skeleton className="h-4 w-full" />
                     <Skeleton className="h-4 w-5/6" />
                     <div className="flex gap-2 pt-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-16" />
                     </div>
                     <Skeleton className="h-10 w-full mt-auto" />
                </div>
            ))}
        </div>
    </div>
  );
}
