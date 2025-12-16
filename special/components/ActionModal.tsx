import React from 'react';
import { X } from 'lucide-react';

interface ActionModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  onSave?: () => void;
  maxWidth?: string;
  hideFooter?: boolean;
}

export const ActionModal: React.FC<ActionModalProps> = ({ 
  isOpen, 
  title, 
  onClose, 
  children, 
  onSave, 
  maxWidth = 'max-w-md', 
  hideFooter = false 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/10 dark:bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-200" 
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className={`relative w-full ${maxWidth} bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <ModalHeader title={title} onClose={onClose} />
        
        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1">
          {children}
        </div>
        
        {/* Footer */}
        {!hideFooter && (
          <ModalFooter onClose={onClose} onSave={onSave} />
        )}
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS (Exported for reuse) ---

export const ModalHeader: React.FC<{ title: string; onClose: () => void }> = ({ title, onClose }) => (
  <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex-shrink-0 bg-slate-50/50 dark:bg-slate-800/20 rounded-t-xl">
    <h3 className="font-bold text-sm text-slate-800 dark:text-white">{title}</h3>
    <button onClick={onClose} className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full">
      <X size={16}/>
    </button>
  </div>
);

export const ModalFooter: React.FC<{ onClose: () => void; onSave?: () => void; saveLabel?: string }> = ({ onClose, onSave, saveLabel = "Save & Close" }) => (
  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex justify-end gap-2 flex-shrink-0 border-t border-slate-100 dark:border-slate-800/50">
    <button 
      onClick={onClose} 
      className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200/50 rounded-md transition-colors"
    >
        {onSave ? 'Cancel' : 'Close'}
    </button>
    {onSave && (
      <button 
        onClick={onSave} 
        className="px-3 py-1.5 text-xs font-bold text-white bg-brand-primary rounded-md shadow-sm hover:opacity-90 transition-opacity"
      >
        {saveLabel}
      </button>
    )}
  </div>
);
