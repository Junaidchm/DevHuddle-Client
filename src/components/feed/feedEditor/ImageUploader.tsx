import { Image } from "lucide-react";
import { useEffect, useRef } from "react";


interface ImageUploaderProps {
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  disabled?: boolean;
  className?: string;
  triggerUpload: () => void;
  resetInput: () => void;
  fileInputRef:React.RefObject<HTMLInputElement | null>;
}

// ImageUploader component
export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUpload,
  disabled = false,
  className = '',
  triggerUpload,
  resetInput,
  fileInputRef,
}) => {
  
  // useEffect(() => {
  //   console.log('this is working fine without any problem')
  //   triggerUpload()  
  // }, []);

  return (
    <div
      onClick={() => {
        if (!disabled) {
          resetInput();
          triggerUpload();
        }
      }}
      className={`flex-1 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-all duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <div className="text-center">
        <Image size={64} className="text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600 font-medium text-lg">Click to upload images</p>
        <p className="text-slate-400 text-sm mt-2">JPG, PNG, GIF up to 10MB each</p>
        <p className="text-slate-400 text-xs mt-1">Drag and drop multiple files</p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e)=> {
          onUpload(e)  
        }}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};