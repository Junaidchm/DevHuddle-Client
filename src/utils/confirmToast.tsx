import toast from 'react-hot-toast';
import React from 'react';

export const confirmToast = (message: string, onConfirm: () => void) => {
  toast((t) => (
    <div className="flex flex-col gap-2">
      <span className="font-medium text-sm text-gray-800">{message}</span>
      <div className="flex gap-2 justify-end">
        <button
          className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-xs hover:bg-gray-300 transition-colors font-medium"
          onClick={() => toast.dismiss(t.id)}
        >
          Cancel
        </button>
        <button
          className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition-colors font-medium"
          onClick={() => {
            toast.dismiss(t.id);
            onConfirm();
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  ), {
    duration: 5000,
    style: {
      minWidth: '250px',
      padding: '16px',
    },
  });
};
