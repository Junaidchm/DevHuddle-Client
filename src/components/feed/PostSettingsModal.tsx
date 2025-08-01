'use client';

import React from 'react';
import { X } from 'lucide-react';

interface PostSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  audienceType: string;
  setAudienceType: (value: string) => void;
  commentControl: string;
  setCommentControl: (value: string) => void;
}

export default function PostSettingsModal({
  isOpen,
  onClose,
  audienceType,
  setAudienceType,
  commentControl,
  setCommentControl,
}: PostSettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px]">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Post Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            aria-label="Close settings modal"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-700 mb-2">Who can see your post?</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="audience"
                  value="anyone"
                  checked={audienceType === 'anyone'}
                  onChange={() => setAudienceType('anyone')}
                  className="text-violet-500 focus:ring-violet-500"
                  aria-label="Post visible to anyone"
                />
                <span className="text-sm text-slate-600">Anyone</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="audience"
                  value="connections"
                  checked={audienceType === 'connections'}
                  onChange={() => setAudienceType('connections')}
                  className="text-violet-500 focus:ring-violet-500"
                  aria-label="Post visible to connections only"
                />
                <span className="text-sm text-slate-600">Connections only</span>
              </label>
            </div>
          </div>
          <div className="mb-6">
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

        </div>
        <div className="flex justify-end p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-full font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
            aria-label="Save settings"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}