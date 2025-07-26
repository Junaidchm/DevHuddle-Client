import { ClearButton } from "./ClearButton";

interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  onClearFilters: () => void;
  clearFilterText?: string;
  clearFilterIcon?: string;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  children,
  onClearFilters,
  clearFilterText = "Clear Filters",
  clearFilterIcon = "fas fa-times",
  className = "",
  ...props
}) => (
  <div
    className={`flex items-center gap-4 p-4 px-6 border-b border-gray-200 bg-gray-100 flex-wrap max-[768px]:flex-col max-[768px]:items-start ${className}`}
    {...props}
  >
    {children}
    <ClearButton onClick={onClearFilters} iconClass={clearFilterIcon}>
      {clearFilterText}
    </ClearButton>
  </div>
);
