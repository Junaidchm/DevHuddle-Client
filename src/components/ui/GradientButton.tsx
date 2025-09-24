import { GradientButtonProps } from "@/src/app/types/feed";
import { Loader2 } from "lucide-react";

// GradientButton component
export const GradientButton: React.FC<GradientButtonProps> = ({
  label,
  onClick,
  disabled = false,
  className = '',
  ariaLabel,
  isUploading,
  uploadProgress
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`bg-gradient-to-br from-violet-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    aria-label={ariaLabel}
  >
    {isUploading ? (
      <>
       <span className="text-sm">{uploadProgress ?? 0}%</span>
       <Loader2 />
      </>
    ): 
      (label)
    } 
    
  </button>
);
