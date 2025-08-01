interface TextButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  ariaLabel: string;
}

// TextButton component
export const TextButton: React.FC<TextButtonProps> = ({
  label,
  onClick,
  disabled = false,
  className = "",
  ariaLabel,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 text-sm font-medium text-red-500 border border-red-500 rounded-full hover:bg-red-50 transition-colors ${
      disabled ? "opacity-50 cursor-not-allowed" : ""
    } ${className}`}
    aria-label={ariaLabel}
  >
    {label}
  </button>
);
