'use client';

import React from 'react';
import { X } from 'lucide-react';

interface CommentControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  commentControl: string;
  setCommentControl: (value: string) => void;
}

export default function CommentControlModal({
  isOpen,
  onClose,
  commentControl,
  setCommentControl,
}: CommentControlModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px]">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Comment Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            aria-label="Close comment control modal"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>
        <div className="p-6">
          <h3 className="text-sm font-medium text-slate-700 mb-2">Who can comment?</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="comment"
                value="anyone"
                checked={commentControl === 'anyone'}
                onChange={() => setCommentControl('anyone')}
                className="text-violet-500 focus:ring-violet-500"
                aria-label="Anyone can comment"
              />
              <span className="text-sm text-slate-600">Anyone</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="comment"
                value="connections"
                checked={commentControl === 'connections'}
                onChange={() => setCommentControl('connections')}
                className="text-violet-500 focus:ring-violet-500"
                aria-label="Connections only can comment"
              />
              <span className="text-sm text-slate-600">Connections only</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="comment"
                value="nobody"
                checked={commentControl === 'nobody'}
                onChange={() => setCommentControl('nobody')}
                className="text-violet-500 focus:ring-violet-500"
                aria-label="Nobody can comment"
              />
              <span className="text-sm text-slate-600">Nobody</span>
            </label>
          </div>
        </div>
        <div className="flex justify-end p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-full font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
            aria-label="Save comment settings"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}