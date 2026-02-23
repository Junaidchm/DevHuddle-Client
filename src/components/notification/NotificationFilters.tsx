"use client";

import { useMemo } from "react";
import { MappedNotification, NotificationType } from "./types";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";

// LinkedIn-style filter tabs
const FILTERS: { id: NotificationType | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "comment", label: "Comments" },
  { id: "like", label: "Likes" },
  { id: "mention", label: "Mentions" },
  { id: "follow", label: "Follows" },
  { id: "share", label: "Shares" },
  { id: "report", label: "Reports" },
  { id: "system", label: "System" },
];

interface NotificationFiltersProps {
  notifications: MappedNotification[];
  activeFilter: NotificationType | "all";
  setActiveFilter: (filter: NotificationType | "all") => void;
}

export const NotificationFilters = ({
  notifications,
  activeFilter,
  setActiveFilter,
}: NotificationFiltersProps) => {
  const unreadCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    for (const n of notifications) {
      if (!n.isRead) {
        counts.all = (counts.all || 0) + 1;
        counts[n.type] = (counts[n.type] || 0) + 1;
      }
    }
    return counts;
  }, [notifications]);

  return (
    <div className="border-b border-border mb-4">
      <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {FILTERS.map((filter) => {
          const count = unreadCounts[filter.id] || 0;
          const isActive = activeFilter === filter.id;
          
          return (
            <Button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "rounded-full h-9 px-4 text-sm font-medium transition-all whitespace-nowrap",
                isActive
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {filter.label}
              {count > 0 && (
                <span className={cn(
                    "ml-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold",
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {count}
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};