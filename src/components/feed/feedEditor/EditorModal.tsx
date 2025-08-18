"use client";

import { IconButton } from "./IconButton";
import { X } from "lucide-react";

interface EditorModalProps {
  title: string;
  ariaLabel: string;
  children: React.ReactNode;
  IconButtonAction: () => void;
}

export default function EditorModal({
  title,
  children,
  ariaLabel,
  IconButtonAction,
}: EditorModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[900px] max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
          <IconButton
            icon={<X size={20} className="text-slate-600" />}
            ariaLabel={ariaLabel}
            onClick={IconButtonAction}
          />
        </div>
        <div className="p-6 flex gap-6 h-[calc(85vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  );
}
