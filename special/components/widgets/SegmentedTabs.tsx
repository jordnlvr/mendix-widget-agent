import React from 'react';
import { Check } from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  isComplete?: boolean;
  isCancelled?: boolean;
}

interface SegmentedTabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export const SegmentedTabs: React.FC<SegmentedTabsProps> = ({ items, activeId, onChange, className = "" }) => {
  return (
    <div 
        className={`flex items-center bg-slate-100 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/40 rounded-xl p-1 overflow-x-auto ${className}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
        <style>{`
            .no-scrollbar::-webkit-scrollbar { display: none; }
        `}</style>
        
        {items.map((item) => {
            const isActive = activeId === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onChange(item.id)}
                className={`
                  flex-shrink-0 px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap
                  ${isActive 
                    ? 'bg-white dark:bg-slate-800 text-brand-primary shadow-sm ring-1 ring-black/5 dark:ring-white/5' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                  }
                  ${item.isCancelled ? 'opacity-50 grayscale decoration-slate-400' : ''}
                `}
              >
                {item.isComplete && <Check size={12} className={isActive ? 'text-emerald-500' : 'text-emerald-500'} />}
                <span className={item.isCancelled ? 'line-through decoration-2 opacity-80' : ''}>
                  {item.label}
                </span>
              </button>
            );
        })}
    </div>
  );
};
