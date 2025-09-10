// app/components/FollowersHeader.tsx
"use client";
import React, { useState } from "react";

const FollowersHeader = ({
  onSearch,
  view,
  setView,
}: {
  onSearch: (query: string) => void;
  view: "followers" | "following";
  setView: React.Dispatch<React.SetStateAction<"followers" | "following">>;
}) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-8">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h2 className="m-0 text-xl font-semibold text-slate-800">Network</h2>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">View:</span>
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                className={`bg-${
                  view === "followers" ? "blue-500" : "transparent"
                } text-${
                  view === "followers" ? "white" : "slate-500"
                } border-none py-1.5 px-3 rounded-md text-sm font-medium cursor-pointer transition-all duration-200`}
                onClick={() => setView("followers")}
              >
                Followers
              </button>
              <button
                className={`bg-${
                  view === "following" ? "blue-500" : "transparent"
                } text-${
                  view === "following" ? "white" : "slate-500"
                } border-none py-1.5 px-3 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-slate-200`}
                onClick={() => setView("following")}
              >
                Following
              </button>
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search network..."
              className="bg-white border border-slate-200 rounded-lg py-2 px-4 pl-10 text-sm text-slate-800 w-[200px] outline-none focus:border-blue-500"
              onChange={(e) => onSearch(e.target.value)}
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
              className="absolute left-3 top-1/2 -translate-y-1/2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowersHeader;
