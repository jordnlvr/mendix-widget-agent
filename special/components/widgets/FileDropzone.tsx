import React from 'react';
import { Paperclip, FilePlus } from 'lucide-react';
import { FancyButton } from './FancyButton';

interface FileDropzoneProps {
  onDrop?: (files: FileList) => void;
  label?: string;
  sublabel?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({ 
  onDrop, 
  label = "Quick Attach", 
  sublabel = "Drag & drop files here" 
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-4 flex items-center justify-between gap-4 group cursor-pointer hover:border-brand-primary transition-colors">
      <div className="flex items-center gap-3">
         <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 group-hover:text-brand-primary transition-colors">
            <FilePlus size={18} />
         </div>
         <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-brand-primary transition-colors">
              {label}
            </span>
            <span className="text-[10px] text-slate-400">
              {sublabel}
            </span>
          </div>
      </div>
      <div onClick={(e) => e.stopPropagation()}>
        <FancyButton variant="outline" size="sm">Browse</FancyButton>
      </div>
    </div>
  );
};
