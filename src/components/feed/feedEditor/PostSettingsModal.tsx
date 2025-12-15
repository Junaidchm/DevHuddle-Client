'use client';

import React from 'react';
import { X } from 'lucide-react';
import { usePostForm } from '@/src/hooks/feed/usePostForm';

interface PostSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PostSettingsModal({
  isOpen,
  onClose,
}: PostSettingsModalProps) {
  // ✅ Use centralized settings from context
  const { settings, updateSettings } = usePostForm();
  
  // Mapping logic: Context uses uppercase ("PUBLIC", "CONNECTIONS"), UI inputs use lowercase ("anyone", "connections")
  // Or better yet, update the UI inputs to match the Context values.
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 bg-black/20">
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
                  value="PUBLIC"
                  checked={settings.visibility === 'PUBLIC'}
                  onChange={() => updateSettings({ visibility: 'PUBLIC' })}
                  className="text-violet-500 focus:ring-violet-500"
                  aria-label="Post visible to anyone"
                />
                <span className="text-sm text-slate-600">Anyone</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="audience"
                  value="CONNECTIONS"
                  checked={settings.visibility === 'CONNECTIONS'}
                  onChange={() => updateSettings({ visibility: 'CONNECTIONS' })}
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
                  value="ANYONE"
                  checked={settings.commentControl === 'ANYONE'}
                  onChange={() => updateSettings({ commentControl: 'ANYONE' })}
                  className="text-violet-500 focus:ring-violet-500"
                  aria-label="Anyone can comment"
                />
                <span className="text-sm text-slate-600">Anyone</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="comment"
                  value="CONNECTIONS"
                  checked={settings.commentControl === 'CONNECTIONS'}
                  onChange={() => updateSettings({ commentControl: 'CONNECTIONS' })}
                  className="text-violet-500 focus:ring-violet-500"
                  aria-label="Connections only can comment"
                />
                <span className="text-sm text-slate-600">Connections only</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="comment"
                  value="NOBODY"
                  checked={settings.commentControl === 'NOBODY'}
                  onChange={() => updateSettings({ commentControl: 'NOBODY' })}
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