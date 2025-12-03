// app/components/FollowersHeader.tsx
"use client";
import React from "react";

interface FollowersHeaderProps {
  onSearch: (query: string) => void;
  view: "followers" | "following";
  setView: React.Dispatch<React.SetStateAction<"followers" | "following">>;
  searchQuery: string;
}

const FollowersHeader = ({
  onSearch,
  view,
  setView,
  searchQuery,
}: FollowersHeaderProps) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-8">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center flex-wrap gap-4">
        <h2 className="m-0 text-xl font-semibold text-slate-800">Network</h2>
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">View:</span>
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                className={`py-1.5 px-3 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 ${
                  view === "followers"
                    ? "bg-blue-500 text-white"
                    : "bg-transparent text-slate-500 hover:bg-slate-200"
                }`}
                onClick={() => setView("followers")}
                aria-pressed={view === "followers"}
                aria-label="View followers"
              >
                Followers
              </button>
              <button
                className={`py-1.5 px-3 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 ${
                  view === "following"
                    ? "bg-blue-500 text-white"
                    : "bg-transparent text-slate-500 hover:bg-slate-200"
                }`}
                onClick={() => setView("following")}
                aria-pressed={view === "following"}
                aria-label="View following"
              >
                Following
              </button>
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search network..."
              value={searchQuery}
              className="bg-white border border-slate-200 rounded-lg py-2 px-4 pl-10 text-sm text-slate-800 w-full min-w-[200px] max-w-[300px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-colors"
              onChange={(e) => onSearch(e.target.value)}
              aria-label="Search network"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            {searchQuery && (
              <button
                onClick={() => onSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Clear search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowersHeader;
