type ClearButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  iconClass?: string;
};

export const ClearButton: React.FC<ClearButtonProps> = ({
  onClick,
  className = "",
  disabled = false,
  iconClass = "",
  children,
  ...props
}) => {
  return (
    <button
      {...props}
      onClick={onClick}
      className={`px-4 py-2 mt-3.5 rounded-lg font-medium text-sm text-gray-800 bg-transparent flex items-center justify-center gap-2 transition-all duration-300 hover:bg-gray-100 ${className}`}
    >
      {iconClass && <i className={iconClass}></i>}
      {children}
    </button>
  );
};
