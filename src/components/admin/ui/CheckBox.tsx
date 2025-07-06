type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  onChange,
  className = "",
  ...props
}) => (
  <div className={`relative inline-block ${className}`}>
    <input
      type="checkbox"
      id={id}
      className="peer sr-only"
      checked={checked}
      onChange={onChange}
      {...props}
    />
    <label
      htmlFor={id}
      className="w-[18px] h-[18px] border border-gray-300 rounded-sm flex items-center justify-center cursor-pointer transition-all duration-300 peer-checked:bg-indigo-600 peer-checked:border-indigo-600"
    >
      <i className="fas fa-check text-white text-[0.625rem] hidden peer-checked:inline-block"></i>
    </label>
  </div>
);
