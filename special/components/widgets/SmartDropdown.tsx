import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SmartDropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  className?: string;
  renderOption?: (opt: string) => React.ReactNode;
}

export const SmartDropdown: React.FC<SmartDropdownProps> = ({ label, value, options, onChange, className = "", renderOption }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`group relative ${className}`} ref={containerRef}>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 group-hover:text-brand-primary transition-colors">
        {label}
      </label>
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left bg-white dark:bg-slate-900 border ${isOpen ? 'border-brand-primary ring-1 ring-brand-primary/20' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none transition-all font-medium flex justify-between items-center group-hover:border-brand-primary/50`}
      >
        <span className="truncate">{value}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-primary' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setIsOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between ${opt === value ? 'text-brand-primary font-bold bg-brand-primary/5' : 'text-slate-700 dark:text-slate-300'}`}
            >
              {renderOption ? renderOption(opt) : opt}
              {opt === value && <Check size={12} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
