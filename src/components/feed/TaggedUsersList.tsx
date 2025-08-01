import { User } from "@/src/app/types/feed";

interface TaggedUsersListProps {
  taggedUsers: User[];
  onRemoveTag: (userId: number) => void;
  className?: string;
}

// TaggedUsersList component
export const TaggedUsersList: React.FC<TaggedUsersListProps> = ({
  taggedUsers,
  onRemoveTag,
  className = "",
}) => (
  <div className="mt-auto pt-4 border-t border-slate-200">
    <h4 className="text-sm font-medium text-slate-700 mb-3">Tagged Users</h4>
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
  </div>
);
