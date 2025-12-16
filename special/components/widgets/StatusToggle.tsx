
import React from 'react';
import { Check } from 'lucide-react';

interface StatusToggleProps { 
  checked: boolean; 
  onChange: (val: boolean) => void; 
  label: string; 
  icon?: any;
  colorClass?: string;
}

export const StatusToggle: React.FC<StatusToggleProps> = ({ 
  checked, 
  onChange, 
  label, 
  icon: Icon, 
  colorClass = "bg-emerald-500" 
}) => (
  <button
    onClick={() => onChange(!checked)}
    className={`
      relative overflow-hidden w-full text-left p-4 rounded-xl border transition-all duration-300 group
      ${checked 
        ? 'bg-white dark:bg-slate-900 border-brand-primary shadow-md ring-1 ring-brand-primary/20' 
        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }
    `}
  >
    {/* Active Corner Indicator */}
    <div className={`absolute top-0 right-0 w-12 h-12 transition-transform duration-300 ${checked ? 'translate-x-6 -translate-y-6' : 'translate-x-12 -translate-y-12'}`}>
       <div className={`w-full h-full transform rotate-45 ${colorClass}`}></div>
    </div>
    {checked && (
      <Check size={12} className="absolute top-1.5 right-1.5 text-white z-10" strokeWidth={4} />
    )}

    <div className="flex items-center gap-3 relative z-10">
      <div className={`
        w-8 h-8 rounded-lg flex items-center justify-center transition-colors
        ${checked ? 'bg-brand-primary text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}
      `}>
        {Icon ? <Icon size={16} /> : <Check size={16} />}
      </div>
      <div>
         <span className={`block text-xs font-bold uppercase tracking-wider mb-0.5 ${checked ? 'text-brand-primary' : 'text-slate-500'}`}>Status</span>
         <span className={`block text-sm font-bold ${checked ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
            {label}
         </span>
      </div>
    </div>
  </button>
);
