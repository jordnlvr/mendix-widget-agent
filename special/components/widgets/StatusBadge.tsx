
import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm', className = '' }) => {
  const getColor = (s: string) => {
    switch(s.toLowerCase()) {
       case 'critical': return 'bg-red-500 text-white border-red-600';
       case 'assigned': return 'bg-purple-500 text-white border-purple-600'; // Changed to Purple
       case 'on hold': return 'bg-amber-500 text-white border-amber-600';
       case 'completed': return 'bg-emerald-500 text-white border-emerald-600';
       case 'closed': return 'bg-emerald-600 text-white border-emerald-700';
       case 'cancelled': return 'bg-slate-500 text-white border-slate-600';
       case 'in progress': return 'bg-brand-primary text-white border-brand-primary';
       case 'new': return 'bg-blue-500 text-white border-blue-600';
       default: return 'bg-slate-500 text-white border-slate-600';
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span className={`
      ${sizeClasses} rounded-full font-bold uppercase tracking-wide shadow-sm border 
      ${getColor(status)} 
      ${className}
    `}>
      {status}
    </span>
  );
};

// Also export a helper for table row backgrounds if needed, though mostly we use the badge now
export const getStatusRowStyle = (status: string) => {
   // Kept for backward compatibility or row highlighting
   return ''; 
};
