import React, { useState } from 'react';
import { Card } from './Card';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'warning' | 'primary';
  reasonRequired?: boolean;
  reasonOptions?: { label: string; value: string }[];
  isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
  reasonRequired = false,
  reasonOptions = [],
  isLoading = false,
}) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (reasonRequired && !reason.trim()) return;
    onConfirm(reasonRequired ? reason : undefined);
  };

  const variantClasses = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
      <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>

          {reasonRequired && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for action <span className="text-red-500">*</span>
              </label>
              
              {reasonOptions.length > 0 ? (
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  autoFocus
                >
                  <option value="">Select a reason...</option>
                  {reasonOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  rows={3}
                  placeholder="Enter reason here..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  autoFocus
                />
              )}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || (reasonRequired && !reason.trim())}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 ${variantClasses[confirmVariant]}`}
            >
              {isLoading && <i className="fas fa-spinner fa-spin"></i>}
              {confirmLabel}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ConfirmModal;
