import { Skeleton } from "@/src/components/ui/skeleton";

export function ProjectListSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
       {/* Header Skeleton */}
       <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
         <div>
           <Skeleton className="h-8 w-64 mb-2" />
           <Skeleton className="h-4 w-96" />
         </div>
         <Skeleton className="h-10 w-32" />
       </div>

       {/* Search Skeleton */}
       <Skeleton className="h-11 w-full max-w-2xl mb-8" />
       
       {/* Filters */}
       <div className="flex gap-4 mb-8">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
       </div>

       {/* Grid Skeleton */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-card rounded-lg border border-border p-0 overflow-hidden h-full flex flex-col"
            >
                <Skeleton className="h-48 w-full" />
                <div className="p-5 space-y-3 flex-1">
                   <Skeleton className="h-5 w-3/4" />
                   <Skeleton className="h-4 w-full" />
                   <Skeleton className="h-4 w-5/6" />
                </div>
            </div>
          ))}
       </div>
    </div>
  );
}
