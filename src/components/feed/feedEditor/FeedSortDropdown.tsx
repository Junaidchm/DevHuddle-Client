
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface FeedSortDropdownProps {
  sortBy: "RECENT" | "TOP";
  onSortChange: (sort: "RECENT" | "TOP") => void;
}

export default function FeedSortDropdown({
  sortBy,
  onSortChange,
}: FeedSortDropdownProps) {
  return (
    <div className="flex justify-end mb-2 px-1">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <span className="font-medium text-xs">Sort by:</span>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 font-semibold text-foreground hover:underline focus:outline-none">
            {sortBy === "RECENT" ? "Recent" : "Top"}
            <ChevronDown className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[120px]">
            <DropdownMenuItem
              onClick={() => onSortChange("TOP")}
              className={`font-medium ${sortBy === "TOP" ? "bg-accent" : ""}`}
            >
              Top
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange("RECENT")}
              className={`font-medium ${sortBy === "RECENT" ? "bg-accent" : ""}`}
            >
              Recent
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
