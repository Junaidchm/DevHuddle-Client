import { User } from "@/src/app/types/feed";
import { IconButton } from "./IconButton";
import { X } from "lucide-react";
import { TaggedUsersList } from "./TaggedUsersList";
import { useState } from "react";
import { useMedia } from "@/src/contexts/MediaContext";

interface MentionPanelProps {
  users: User[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentImageId:string;
  onClose: () => void;
  className?: string;
}

// MentionPanel component
export const MentionPanel: React.FC<MentionPanelProps> = ({
  users,
  searchQuery,
  onSearchChange,
  currentImageId,
  onClose,
  className = "",
}) => {
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const {setTaggedUsers,media} = useMedia()
  const currentImageTaggedUser = media.filter(media=> media.id === currentImageId)[0]?.taggedUsers;

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
              onClick={() => {
               setTaggedUsers(user,currentImageId)
              }}
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

      <TaggedUsersList taggedUsers={currentImageTaggedUser} />
    </div>
  );
};
