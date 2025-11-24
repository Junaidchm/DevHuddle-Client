"use client";

import { useMemo } from "react";
import { MappedNotification, NotificationType } from "./types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FILTERS: { id: NotificationType | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "mention", label: "Mentions" },
  { id: "comment", label: "Comments" },
  { id: "like", label: "Likes" },
  { id: "follow", label: "Follows" },
  { id: "collab", label: "Collaboration" },
  { id: "message", label: "Messages" },
  { id: "event", label: "Events" },
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
    <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as any)} className="w-full">
      <TabsList className="grid w-full grid-cols-4 md:grid-cols-8">
        {FILTERS.map((filter) => {
          const count = unreadCounts[filter.id] || 0;
          return (
            <TabsTrigger key={filter.id} value={filter.id} className="relative">
              {filter.label}
              {count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-xs">
                  {count}
                </span>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
};