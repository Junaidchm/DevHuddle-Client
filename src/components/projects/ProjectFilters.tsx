"use client";

import { Button } from "../ui/button";

interface ProjectFiltersProps {
  filter: "trending" | "top" | "newest";
  period: string;
  onFilterChange: (filter: "trending" | "top" | "newest") => void;
  onPeriodChange: (period: string) => void;
}

export default function ProjectFilters({
  filter,
  period,
  onFilterChange,
  onPeriodChange,
}: ProjectFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        <Button
          variant={filter === "trending" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onFilterChange("trending")}
          className={filter === "trending" ? "bg-background shadow-xs text-primary font-semibold" : "text-muted-foreground"}
        >
          Trending
        </Button>
        <Button
           variant={filter === "top" ? "secondary" : "ghost"}
           size="sm"
           onClick={() => onFilterChange("top")}
           className={filter === "top" ? "bg-background shadow-xs text-primary font-semibold" : "text-muted-foreground"}
        >
          Top Projects
        </Button>
        <Button
           variant={filter === "newest" ? "secondary" : "ghost"}
           size="sm"
           onClick={() => onFilterChange("newest")}
           className={filter === "newest" ? "bg-background shadow-xs text-primary font-semibold" : "text-muted-foreground"}
        >
          Newest
        </Button>
      </div>

      {/* Period Filter */}
      {(filter === "trending" || filter === "top") && (
        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="px-3 py-1.5 text-sm border border-input rounded-md bg-background hover:bg-muted/50 focus:ring-2 focus:ring-ring focus:outline-none transition-colors"
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="all">All Time</option>
        </select>
      )}
    </div>
  );
}

