import { EditingTab } from "../../../app/types/feed";
interface TabButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  className?: string;
  ariaLabel: string;
}
// TabButton component
export const TabButton: React.FC<TabButtonProps> = ({
  label,
  icon,
  isActive,
  onClick,
  className = '',
  ariaLabel,
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      isActive ? 'text-slate-800 border-blue-500' : 'text-slate-500 border-transparent hover:text-slate-700'
    } ${className}`}
    aria-label={ariaLabel}
  >
    {icon}
    {label}
  </button>
);