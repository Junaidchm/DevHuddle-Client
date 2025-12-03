"use client";

import { useMemo } from "react";
import { MappedNotification, NotificationType } from "./types";
import { cn } from "@/src/lib/utils";

// LinkedIn-style filter tabs
const FILTERS: { id: NotificationType | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "comment", label: "Comments" },
  { id: "like", label: "Likes" },
  { id: "mention", label: "Mentions" },
  { id: "follow", label: "Follows" },
  { id: "share", label: "Shares" },
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
    <div className="border-b border-gray-200 mb-4">
      <div className="flex gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {FILTERS.map((filter) => {
          const count = unreadCounts[filter.id] || 0;
          const isActive = activeFilter === filter.id;
          
          return (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
                "border-b-2 border-transparent",
                isActive
                  ? "text-blue-600 border-blue-600 bg-transparent"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-t-md"
              )}
            >
              {filter.label}
              {count > 0 && (
                <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};