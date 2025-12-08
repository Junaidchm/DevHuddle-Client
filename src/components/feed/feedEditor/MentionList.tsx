import { SearchedUser } from "@/src/services/api/user.service";

interface MentionListProps {
  users: SearchedUser[];
  onSelect: (user: SearchedUser) => void;
  position: { top: number; left: number };
}

export const MentionList = ({ users, onSelect, position }: MentionListProps) => {
  if (users.length === 0) return null;

  return (
    <div
      className="absolute z-50 bg-white shadow-xl rounded-lg border border-slate-200 w-64 max-h-60 overflow-y-auto"
      style={{ top: position.top, left: position.left }}
    >
      {users.map((user) => (
        <button
          key={user.id}
          className="flex items-center gap-3 w-full p-3 hover:bg-slate-50 transition-colors text-left"
          onClick={() => onSelect(user)}
        >
          <img
            src={user.profilePicture || "https://i.pravatar.cc/150?u=" + user.id}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <div className="text-sm font-medium text-slate-800">{user.name}</div>
            <div className="text-xs text-slate-500">@{user.username}</div>
          </div>
        </button>
      ))}
    </div>
  );
};
