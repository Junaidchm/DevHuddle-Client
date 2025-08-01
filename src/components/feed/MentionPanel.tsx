import { User } from "@/src/app/types/feed";
import { IconButton } from "./IconButton";
import { X } from "lucide-react";
import { TaggedUsersList } from "./TaggedUsersList";

interface MentionPanelProps {
  users: User[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddTag: (user: User) => void;
  taggedUsers: User[];
  onRemoveTag: (userId: number) => void;
  onClose: () => void;
  className?: string;
}

// MentionPanel component
export const MentionPanel: React.FC<MentionPanelProps> = ({
  users,
  searchQuery,
  onSearchChange,
  onAddTag,
  taggedUsers,
  onRemoveTag,
  onClose,
  className = "",
}) => {
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-96 border-l border-slate-200 pl-6 flex flex-col h-full">
      {/* Top part: Title and Search */}
      <div>
        <div className="flex items-center gap-3 mb-6">
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

      {/* User Search Results (This part should grow and shrink) */}
      <div className="flex-grow overflow-y-auto pr-2">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
              onClick={() => onAddTag(user)}
              aria-label={`Tag ${user.name}`}
            >
              <img
                src={user.avatar}
                alt={`${user.name}'s avatar`}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="text-sm font-medium text-slate-700">
                  {user.name}
                </div>
                <div className="text-xs text-slate-500">{user.title}</div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">No users found</p>
        )}
      </div>

      {/* Tagged Users List (This part is fixed at the bottom and scrolls) */}
      {/* <div className="mt-auto pt-4 border-t border-slate-200">
        <h4 className="text-sm font-medium text-slate-700 mb-3">
          Tagged Users
        </h4>
     
        <div className="max-h-[160px] overflow-y-auto pr-2 space-y-2">
          {taggedUsers.length > 0 ? (
            taggedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg"
              >
                <img
                  src={user.avatar}
                  alt={`${user.name}'s avatar`}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-xs text-slate-700 flex-1 truncate">
                  {user.name}
                </span>
                <button
                  onClick={() => onRemoveTag(user.id)}
                  className="text-red-500 hover:text-red-700 text-xs"
                  aria-label={`Remove tag ${user.name}`}
                >
                  ×
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No users tagged</p>
          )}
        </div>
      </div> */}

      <TaggedUsersList onRemoveTag={onRemoveTag} taggedUsers={taggedUsers} />
    </div>
  );
};
