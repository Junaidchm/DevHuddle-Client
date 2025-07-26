'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AltTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  altText: string;
  setAltText: (value: string) => void;
}

export default function AltTextModal({ isOpen, onClose, altText, setAltText }: AltTextModalProps) {
  const [tempAltText, setTempAltText] = useState(altText);

  if (!isOpen) return null;

  const handleSave = () => {
    setAltText(tempAltText);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px]">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Add Alt Text</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            aria-label="Close alt text modal"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>
        <div className="p-6">
          <textarea
            value={tempAltText}
            onChange={(e) => setTempAltText(e.target.value)}
            placeholder="Describe the image for accessibility..."
            className="w-full h-32 p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            aria-label="Alt text input"
          />
          <p className="text-xs text-slate-500 mt-2">
            Alt text helps people with visual impairments understand the image content.
          </p>
        </div>
        <div className="flex justify-end p-6 border-t border-slate-200">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-full font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
            aria-label="Save alt text"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}