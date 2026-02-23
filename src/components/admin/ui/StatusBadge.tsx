import React from 'react';

interface StatusBadgeProps {
  status: 'active' | 'blocked' | 'suspended' | 'pending' | 'reported' | 'removed' | 'deleted' | 'hidden' | string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const getStatusConfig = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'active':
        return {
          bg: 'bg-[rgba(34,197,94,0.1)]',
          text: 'text-green-500',
          dot: 'bg-green-500',
          label: 'Active'
        };
      case 'blocked':
      case 'suspended':
        return {
          bg: 'bg-[rgba(239,68,68,0.1)]',
          text: 'text-red-500',
          dot: 'bg-red-500',
          label: s.charAt(0).toUpperCase() + s.slice(1)
        };
      case 'pending':
        return {
          bg: 'bg-[rgba(245,158,11,0.1)]',
          text: 'text-yellow-500',
          dot: 'bg-yellow-500',
          label: 'Pending'
        };
      case 'reported':
        return {
          bg: 'bg-[rgba(249,115,22,0.1)]',
          text: 'text-orange-500',
          dot: 'bg-orange-500',
          label: 'Reported'
        };
      case 'removed':
      case 'deleted':
      case 'hidden':
        return {
          bg: 'bg-[rgba(107,114,128,0.1)]',
          text: 'text-gray-500',
          dot: 'bg-gray-500',
          label: s.charAt(0).toUpperCase() + s.slice(1)
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-600',
          dot: 'bg-gray-400',
          label: status
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} ${className} before:content-[''] before:inline-block before:w-2 before:h-2 before:rounded-full ${config.dot}`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
