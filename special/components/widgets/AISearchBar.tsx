import React from 'react';
import { Search, Sparkles, X } from 'lucide-react';

interface AISearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const AISearchBar: React.FC<AISearchBarProps> = ({ 
  value, 
  onChange, 
  placeholder = "Ask OneSource AI or search...", 
  className = "" 
}) => {
  return (
    <div className={`group relative flex items-center w-full transition-all duration-300 focus-within:scale-[1.01] ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        {value ? (
          <Search size={18} className="text-brand-primary" />
        ) : (
          <Sparkles size={18} className="text-brand-primary animate-pulse" />
        )}
      </div>
      <input 
        type="text" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full py-2.5 pl-11 pr-10
          bg-white dark:bg-slate-950 
          border-2 border-slate-200 dark:border-slate-800 focus:border-brand-primary/50 
          rounded-full text-sm font-medium
          text-slate-700 dark:text-slate-200 
          placeholder-slate-400 dark:placeholder-slate-500
          shadow-sm focus:shadow-lg focus:shadow-brand-primary/10
          transition-all duration-300 outline-none
        "
      />
      {value ? (
        <button 
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X size={14} />
        </button>
      ) : (
        <div className="absolute inset-y-0 right-2 flex items-center">
          <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm">
            ⌘ K
          </kbd>
        </div>
      )}
    </div>
  );
};
