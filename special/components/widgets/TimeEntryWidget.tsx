import React from 'react';
import { Clock, Plus } from 'lucide-react';

interface TimeEntryWidgetProps {
  label?: string;
  value: string;
  onAddClick: () => void;
  className?: string;
}

export const TimeEntryWidget: React.FC<TimeEntryWidgetProps> = ({ 
  label = "Time Spent", 
  value, 
  onAddClick, 
  className = "" 
}) => {
  return (
    <div onClick={onAddClick} className={`cursor-pointer group ${className}`}>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 group-hover:text-brand-primary transition-colors">
        {label}
      </label>
      <div className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/50 rounded-lg group-hover:border-brand-primary/50 group-hover:bg-brand-primary/5 transition-all shadow-sm">
         <div className="flex items-center gap-2">
           <Clock size={14} className="text-slate-400 group-hover:text-brand-primary transition-colors" /> 
           <span className="font-mono font-bold">{value}</span>
         </div>
         <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 group-hover:text-brand-primary transition-colors">
            <Plus size={12} /> Add
         </div>
      </div>
    </div>
  );
};
