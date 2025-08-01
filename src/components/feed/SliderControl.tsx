interface SliderControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  displayValue?: string;
  className?: string;
}

// SliderControl component
export const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  displayValue,
  className = '',
}) => (
  <div className={className}>
    <div className="flex justify-between items-center mb-2">
      <h4 className="text-sm font-medium text-slate-700">{label}</h4>
      {displayValue && <span className="text-xs text-slate-500">{displayValue}</span>}
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      aria-label={`Adjust ${label.toLowerCase()}`}
    />
  </div>
);