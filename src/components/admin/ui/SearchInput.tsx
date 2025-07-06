type SearchInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  iconClass?: string;
  inputClassName?: string;
  containerClassName?: string;
};

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  iconClass = "fa-search",
  inputClassName,
  containerClassName = "",
  ...props
}) => {
  return (
    <div className={`relative w-full ${containerClassName}`}>
      <button className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
        <i className={`fas ${iconClass}`}></i>
      </button>
      <input
        type="text"
        className={`w-full p-2 pl-8 bg-gray-100 border border-gray-200 rounded-full text-sm text-gray-800 outline-none focus:border-indigo-600 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.2)] transition-all duration-300 ${inputClassName}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  );
};
