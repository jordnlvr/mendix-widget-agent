import React from 'react';
import { Bold, Italic, AlignLeft, List } from 'lucide-react';

interface RichTextEditorProps {
  label: string;
  value: string;
  className?: string;
  readOnly?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ label, value, className = "", readOnly = false }) => {
  return (
    <div className={`group ${className}`}>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
        {label}
        {!readOnly && (
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-brand-primary text-white px-1.5 rounded">Editable</span>
        )}
      </label>
      
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900 transition-shadow focus-within:ring-2 focus-within:ring-brand-primary/50 focus-within:border-brand-primary group-hover:border-slate-300 dark:group-hover:border-slate-600">
        {/* Toolbar Simulation */}
        <div className="flex items-center gap-1 p-1.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
           <button className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700"><Bold size={14}/></button>
           <button className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700"><Italic size={14}/></button>
           <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>
           <button className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700"><AlignLeft size={14}/></button>
           <button className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700"><List size={14}/></button>
           <div className="ml-auto text-[10px] font-mono text-slate-300 dark:text-slate-600">Markdown Supported</div>
        </div>
        <textarea 
          readOnly={readOnly}
          className="w-full p-4 text-sm text-slate-700 dark:text-slate-200 bg-transparent outline-none resize-none min-h-[140px] leading-relaxed"
          defaultValue={value}
        />
      </div>
    </div>
  );
};
