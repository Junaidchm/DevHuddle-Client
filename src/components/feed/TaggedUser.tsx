
interface TaggedUserProps {
  user: User;
  onRemove: (userId: number) => void;
  className?: string;
}

import { User } from "@/src/app/types/feed";
import { IconButton } from "./IconButton";

// TaggedUser component
const TaggedUser: React.FC<TaggedUserProps> = ({
  user,
  onRemove,
  className = '',
}) => (
  <div className={`flex items-center gap-2 p-2 bg-blue-50 rounded-lg ${className}`}>
    <img src={user.avatar} alt={`${user.name}'s avatar`} className="w-6 h-6 rounded-full" />
    <span className="text-xs text-slate-700 flex-1 truncate">{user.name}</span>
    <IconButton
      icon={<span>×</span>}
      onClick={() => onRemove(user.id)}
      className="text-red-500 hover:text-red-700 text-xs"
      ariaLabel={`Remove tag ${user.name}`}
    />
  </div>
);
