import React from 'react';

interface BadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
  const getColors = (s: string) => {
    switch (s.toUpperCase()) {
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'PENDING_APPROVAL':
        return 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'DRAFT':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'DISTRIBUTING':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'SCHEDULED':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const formatText = (s: string) => {
    return s.replace(/_/g, ' ');
  };

  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${pad} ${getColors(
        status
      )}`}
    >
      {formatText(status)}
    </span>
  );
};

