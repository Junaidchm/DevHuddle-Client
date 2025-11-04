"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
// import { useDebounce } from "@/src/customHooks/useDebounce";
import { useOnClickOutside } from "@/src/customHooks/useOnClickOutside";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
// import { searchUsers, SearchedUser } from "@/src/services/api/user.service";
import { PROFILE_DEFAULT_URL } from "@/src/constents";
import useDebounce from "../customHooks/useDebounce";
import { SearchedUser, searchUsers } from "../services/api/user.service";

const Spinner = () => (
  <div className="flex justify-center items-center p-4">
    <div className="w-6 h-6 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
  </div>
);

const UserSearchResultItem: React.FC<{ user: SearchedUser; onClick: () => void }> = ({ user, onClick }) => (
  <Link
    href={`/profile/${user.username}`}
    onClick={onClick}
    className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors"
  >
    <img
      src={user.profilePicture || PROFILE_DEFAULT_URL}
      alt={user.name}
      className="w-10 h-10 rounded-full object-cover"
    />
    <div>
      <p className="font-semibold text-sm text-gray-800">{user.name}</p>
      <p className="text-xs text-gray-500">@{user.username}</p>
    </div>
  </Link>
);

export default function UserSearch() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(query, 400);
  const authHeaders = useAuthHeaders();
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  useOnClickOutside(
    searchContainerRef as React.RefObject<HTMLElement>,
    () => setIsFocused(false)
  );

  const { data: users, isLoading, isError, error } = useQuery({
    queryKey: ["userSearch", debouncedQuery],
    queryFn: () => searchUsers(debouncedQuery, authHeaders),
    enabled: debouncedQuery.length >= 2 && authHeaders.Authorization !== undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403 errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2; // Retry up to 2 times
    },
  });

  const handleReset = () => {
    setQuery("");
    setIsFocused(false);
  };

  const showDropdown = isFocused && query.length >= 2;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFocused(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative w-full max-w-xs" ref={searchContainerRef}>
      <div className="relative">
        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input
          type="text"
          placeholder="Search for users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          aria-label="Search for users"
          autoComplete="off"
        />
      </div>

      {showDropdown && (
        <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-80 overflow-y-auto">
          <div className="p-2">
            {isLoading && <Spinner />}
            {isError && (
              <div className="p-4 text-center text-sm text-red-600">
                Error: {error.message}
              </div>
            )}
            {!isLoading && !isError && users?.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-500">
                No users found.
              </div>
            )}
            {!isLoading && !isError && users && users.length > 0 && (
              <ul className="flex flex-col">
                {users.map((user) => (
                  <li key={user.id}>
                    <UserSearchResultItem user={user} onClick={handleReset} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}