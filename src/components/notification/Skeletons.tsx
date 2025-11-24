"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";


const NotificationRowSkeleton = () => (
  <div className="flex items-start gap-4 p-4">
    <Skeleton className="w-10 h-10 rounded-full" />
    <div className="flex-grow space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  </div>
);

export const NotificationListSkeleton = () => (
  <Card>
    {Array.from({ length: 5 }).map((_, i) => (
      <NotificationRowSkeleton key={i} />
    ))}
  </Card>
);