import { User } from "@/src/app/types/feed";
import { X, Loader2 } from "lucide-react";
import { TaggedUsersList } from "./TaggedUsersList";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { searchUsers, getConnections } from "@/src/services/api/user.service";
import { queryKeys } from "@/src/lib/queryKeys";
import { PROFILE_DEFAULT_URL } from "@/src/constants";

interface MentionPanelProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentImageId?: string;
  onClose: () => void;
  className?: string;
  taggedUsers?: User[];
  onToggleTag: (user: User) => void;
}

// MentionPanel component with Infinite Scroll
export const MentionPanel: React.FC<MentionPanelProps> = ({
  searchQuery,
  onSearchChange,
  currentImageId,
  onClose,
  className = "",
  taggedUsers = [],
  onToggleTag,
}) => {
  const { data: session } = useSession();
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: searchQuery ? queryKeys.users.search(searchQuery) : queryKeys.users.connections,
    queryFn: async ({ pageParam = 0 }) => {
      const token = session?.user?.accessToken;
      if (!token) return [];
      const headers = { Authorization: `Bearer ${token}` };
      const limit = 20;

      if (!searchQuery) {
        // Fetch connections (Direct from Auth Service)
        return getConnections("me", headers, limit, pageParam as number);
      } else {
        // Search users
        return searchUsers(searchQuery, headers, limit, pageParam as number);
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 20) return undefined;
      return allPages.length * 20;
    },
    enabled: !!session?.user?.accessToken,
  });

  // Load more when reaching end of list
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const allUsers = data?.pages.flat() || [];
  
  return (
    <div className={`w-96 border-l border-slate-200 pl-6 flex flex-col h-full bg-white ${className}`}>
      {/* Top part: Title and Search */}
      <div>
        <div className="flex items-center gap-3 mb-6 pt-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"  
            aria-label="Close mention panel"
          >
            <X size={20} className="text-slate-600" />
          </button>
          <h3 className="text-lg font-semibold text-slate-800">Tag People</h3>
        </div>
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search for people..."
            className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            aria-label="Search users to tag"
          />
        </div>
      </div>

      {/* User Search Results */}
      <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
        {allUsers.length > 0 ? (
          <>
            {allUsers.map((user: any) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                onClick={() => {
                 onToggleTag({
                    id: user.id,
                    name: user.name,
                    avatar: user.profilePicture || user.avatar || "",
                    title: user.headline || user.jobTitle || ""
                 })
                }}
                aria-label={`Tag ${user.name}`}
              >
                <img
                  src={(user.profilePicture || user.avatar) ? user.profilePicture || user.avatar : PROFILE_DEFAULT_URL}
                  alt={`${user.name}'s avatar`}
                  className="w-10 h-10 rounded-full object-cover border border-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-700 truncate">
                    {user.name}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{user.headline || user.jobTitle || user.username}</div>
                </div>
                {taggedUsers.some(u => u.id === user.id) && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full shadow-sm"></div>
                )}
              </div>
            ))}
            
            {/* Load more trigger */}
            <div ref={ref} className="h-10 flex items-center justify-center p-4">
              {isFetchingNextPage ? (
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              ) : hasNextPage ? (
                <span className="text-xs text-gray-400">Scroll for more</span>
              ) : (
                <span className="text-xs text-gray-400">No more connections</span>
              )}
            </div>
          </>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-400">Loading connections...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <p className="text-sm text-slate-500 font-medium">No users found</p>
            <p className="text-xs text-slate-400 mt-1">Try a different search or check your internet connection.</p>
          </div>
        )}
      </div>

      <TaggedUsersList
        taggedUsers={taggedUsers}
        onRemoveTag={(userId) => {
          const userToRemove = taggedUsers.find((u) => u.id === userId);
          if (userToRemove) {
            onToggleTag(userToRemove);
          }
        }}
      />
    </div>
  );
};
