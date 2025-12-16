import React from 'react';

interface EditableFieldProps {
  label: string;
  value: string;
  onChange?: (val: string) => void;
  className?: string;
  multiline?: boolean;
}

export const EditableField: React.FC<EditableFieldProps> = ({ 
  label, 
  value, 
  onChange,
  className = "", 
  multiline = false 
}) => {
  return (
    <div className={`group ${className}`}>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 group-hover:text-brand-primary transition-colors">
        {label}
      </label>
      <div className="relative">
        {multiline ? (
           <textarea 
             className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all font-medium resize-none min-h-[80px]"
             defaultValue={value}
             onChange={(e) => onChange && onChange(e.target.value)}
           />
        ) : (
          <input 
            type="text" 
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all font-medium"
            defaultValue={value}
            onChange={(e) => onChange && onChange(e.target.value)}
          />
        )}
        {/* Status Indicator Dot */}
        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
        </div>
      </div>
    </div>
  );
};
