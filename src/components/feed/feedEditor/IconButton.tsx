import { LucideProps } from "lucide-react";


interface IconButtonProps {
  icon:  React.ReactNode
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  ariaLabel: string;
}

// IconButton component
export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  disabled = false,
  className = "",
  ariaLabel
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-3 rounded-full transition-colors duration-200 hover:bg-gray-100 text-slate-600 ${
      disabled ? "opacity-50 cursor-not-allowed" : ""
    } ${className}`}
    aria-label={ariaLabel}
  >
    {icon}
  </button>
);
