"use client";

import { Button } from "../ui/button";

interface ProjectFiltersProps {
  filter: "trending" | "top" | "newest" | "my-projects";
  period: string;
  onFilterChange: (filter: "trending" | "top" | "newest" | "my-projects") => void;
  onPeriodChange: (period: string) => void;
}

export default function ProjectFilters({
  filter,
  period,
  onFilterChange,
  onPeriodChange,
}: ProjectFiltersProps) {
  const filters = [
    { id: "trending", label: "Trending" },
    { id: "top", label: "Top Rated" },
    { id: "newest", label: "Newest" },
    { id: "my-projects", label: "My Projects" },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      {/* Category Tabs */}
      <div className="flex flex-col gap-1">
        {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 text-left ${
                filter === f.id 
                ? "bg-primary/10 text-primary border-l-2 border-primary shadow-sm" 
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border-l-2 border-transparent"
              }`}
            >
              {f.label}
            </button>
        ))}
      </div>

      {/* Period Selector - Integrated with professional feel */}
      {(filter === "trending" || filter === "top") && (
        <div className="space-y-3 pt-6 border-t border-border/60">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] px-1">Engagement Period</label>
            <div className="relative group">
                <select
                  value={period}
                  onChange={(e) => onPeriodChange(e.target.value)}
                  className="w-full h-10 pl-3 pr-8 text-xs font-semibold border border-border rounded-md bg-transparent hover:border-primary/30 focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer appearance-none shadow-xs"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="all">All Time</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/40 group-hover:text-primary transition-colors">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
