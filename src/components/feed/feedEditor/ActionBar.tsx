import { Copy, Edit3, Plus, Trash2, User } from "lucide-react";
import { IconButton } from "./IconButton";
import { ActionBarProps } from "@/src/app/types/feed";
import { GradientButton } from "../../ui/GradientButton";

export const ActionBar: React.FC<ActionBarProps> = ({
  onEdit,
  onTag,
  // onDuplicate,
  onDelete,
  onAddMore,
  disableActions,
  imageCount,
  onDone,
  className = '',
  isUploading,
  uploadProgress
}) => {
  return (
    <div
      className={`flex items-center justify-between mt-6 pt-4 border-t border-slate-200 ${className}`}
    >
      <div className="flex gap-3">
        <IconButton
          icon={<Edit3 size={20} />}
          onClick={onEdit}
          disabled={disableActions}
          ariaLabel="Edit image"
        />
        <IconButton
          icon={<User size={20} />}
          onClick={onTag}
          disabled={disableActions}
          ariaLabel="Tag people"
        />
        {/* <IconButton
          icon={<Copy size={20} />}
          onClick={onDuplicate}
          disabled={disableActions}
          ariaLabel="Duplicate image"
        /> */}
        <IconButton
          icon={<Trash2 size={20} className="text-red-500" />}
          onClick={onDelete}
          disabled={disableActions}
          className="hover:bg-red-100"
          ariaLabel="Delete image"
        />
        <IconButton
          icon={<Plus size={20} />}
          onClick={onAddMore}
          ariaLabel="Add more images"
        />
      </div>
      <GradientButton
        onClick={onDone}
        ariaLabel={`Done editing, ${imageCount} images`}
        label={` Done (${imageCount})`}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
      />
    </div>
  );
};
