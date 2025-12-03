"use client";

import { useState } from "react";

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
    <div className="flex flex-wrap gap-4 mb-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => onFilterChange("trending")}
          className={`px-4 py-2 font-medium ${
            filter === "trending"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Trending
        </button>
        <button
          onClick={() => onFilterChange("top")}
          className={`px-4 py-2 font-medium ${
            filter === "top"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Top Projects
        </button>
        <button
          onClick={() => onFilterChange("newest")}
          className={`px-4 py-2 font-medium ${
            filter === "newest"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Newest
        </button>
      </div>

      {/* Period Filter */}
      {(filter === "trending" || filter === "top") && (
        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="px-4 py-2 border rounded-lg"
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

