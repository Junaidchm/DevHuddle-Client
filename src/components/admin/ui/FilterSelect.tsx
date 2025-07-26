import { Options } from "../../types";

type FilterSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options?: Options[];
  labelClassName?: string;
  selectClassName?: string;
  containerClassName?: string;
};

export const FilterSelect: React.FC<FilterSelectProps> = ({
  label,
  id,
  value,
  onChange,
  options = [],
  labelClassName = "",
  selectClassName = "",
  containerClassName = "",
  ...props
}) => {
  return (
    <div
      className={`flex flex-col gap-1 max-[768px]:w-full ${containerClassName}`}
    >
      <label
        htmlFor={id}
        className={`text-xs text-gray-500 font-medium ${labelClassName}`}
      >
        {label}
      </label>
      <select
        onChange={onChange}
        value={value}
        id={label}
        className={`p-1 px-2 border border-gray-200 rounded-lg font-['Inter'] text-sm text-gray-800 bg-white min-w-[140px] max-[768px]:w-full focus:outline-none focus:border-indigo-600 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.2)] ${selectClassName}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        
      </select>
    </div>
  );
};
