
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal, Eye, Edit, Archive, ArrowRightCircle, Check, MessageSquare, RefreshCw, X } from 'lucide-react';
import { RequestViewMode, RequestItem } from '../types';
import { StatusBadge } from './widgets/StatusBadge';
import { UniversalDataGrid, ColumnDef } from './widgets/UniversalDataGrid';

const STATUS_OPTIONS = ["New", "Assigned", "In Progress", "On Hold", "Closed", "Cancelled"];

interface RequestWidgetProps {
  viewMode: RequestViewMode;
  title?: string;
  data: RequestItem[];
  onRequestClick?: (request: RequestItem) => void;
  onAction?: (action: string, requestId: string, payload?: any) => void;
  headerAction?: React.ReactNode;
  count?: number;
}

export const RequestWidget: React.FC<RequestWidgetProps> = ({ 
  viewMode, 
  title = "Active Requests", 
  data, 
  onRequestClick, 
  onAction,
  headerAction,
  count
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number, alignBottom: boolean } | null>(null);
  const [activeModal, setActiveModal] = useState<{ type: 'archive' | 'reassign' | 'note' | 'status', requestId: string } | null>(null);
  const [reassignUser, setReassignUser] = useState('Kelly Seale');
  const [noteText, setNoteText] = useState('');
  const [statusValue, setStatusValue] = useState('');

  // Close menu on scroll
  useEffect(() => {
    const handleScroll = () => setActiveMenuId(null);
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.action-menu-trigger') || (e.target as HTMLElement).closest('.action-menu-content')) return;
      setActiveMenuId(null);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const toggleAction = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (activeMenuId === id) {
      setActiveMenuId(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - rect.bottom;
      const alignBottom = spaceBelow < 250; 
      setMenuPosition({ top: alignBottom ? rect.top : rect.bottom, left: rect.right, alignBottom });
      setActiveMenuId(id);
    }
  };

  const handleMenuAction = (action: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(null); 
    setNoteText('');
    setReassignUser('Kelly Seale');
    if (action === 'view' || action === 'edit') {
       const req = data.find(r => r.id === id);
       if (req && onRequestClick) onRequestClick(req);
    } else if (action === 'archive') { setActiveModal({ type: 'archive', requestId: id });
    } else if (action === 'reassign') { setActiveModal({ type: 'reassign', requestId: id });
    } else if (action === 'note') { setActiveModal({ type: 'note', requestId: id });
    } else if (action === 'status') {
       const req = data.find(r => r.id === id);
       setStatusValue(req?.status || 'New');
       setActiveModal({ type: 'status', requestId: id });
    }
  };

  const confirmModalAction = () => {
    if (!activeModal || !onAction) return;
    if (activeModal.type === 'archive') onAction('archive', activeModal.requestId);
    else if (activeModal.type === 'reassign') onAction('reassign', activeModal.requestId, reassignUser);
    else if (activeModal.type === 'note') { if(noteText.trim()) onAction('add_note', activeModal.requestId, noteText); }
    else if (activeModal.type === 'status') onAction('status', activeModal.requestId, statusValue);
    setActiveModal(null);
  };

  // --- COLUMN DEFINITIONS ---
  const columns: ColumnDef<RequestItem>[] = [
    { header: 'ID', accessorKey: 'id', className: 'font-medium text-brand-primary' },
    { header: 'Request Title', accessorKey: 'title', className: 'font-medium text-slate-800 dark:text-slate-200' },
    { 
      header: 'Assignee', 
      accessorKey: 'assignee', 
      cell: (req) => (
        <div className="flex items-center gap-2">
           <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-300 flex items-center justify-center text-xs font-bold">
             {req.assignee.charAt(0)}
           </div>
           <span className="text-slate-600 dark:text-slate-400">{req.assignee}</span>
        </div>
      )
    },
    { 
      header: 'Status', 
      accessorKey: 'status', 
      cell: (req) => <StatusBadge status={req.status} size="sm" /> 
    },
    { header: 'Date', accessorKey: 'date', className: 'text-slate-500 dark:text-slate-400' }
  ];

  // --- GRID CARD RENDERER ---
  const renderCard = (req: RequestItem) => (
    <div 
      onClick={() => onRequestClick && onRequestClick(req)}
      className="group bg-app-surface rounded-app p-6 border border-slate-100 dark:border-slate-800/60 shadow-sm hover:shadow-xl hover:border-brand-primary/30 transition-all duration-300 flex flex-col h-full cursor-pointer relative"
    >
      <div className="flex justify-between items-start mb-4">
        <StatusBadge status={req.status} />
        <div className="relative">
          <button 
            onClick={(e) => toggleAction(req.id, e)} 
            className={`action-menu-trigger text-slate-400 hover:text-brand-primary p-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${activeMenuId === req.id ? 'text-brand-primary bg-slate-50 dark:bg-slate-800' : ''}`}
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>
      <h4 className="font-display font-bold text-slate-800 dark:text-white text-lg mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors">{req.title}</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-3">{req.description}</p>
      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center text-xs font-bold text-brand-primary">{req.assignee.charAt(0)}</div>
           <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase">Assignee</span><span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{req.assignee}</span></div>
        </div>
        <div className="text-right"><span className="text-[10px] font-bold text-slate-400 uppercase block">Due Date</span><span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{req.date}</span></div>
      </div>
    </div>
  );

  // --- ACTION MENU ---
  const ActionMenu = () => {
    if (!activeMenuId || !menuPosition) return null;
    return createPortal(
      <div className="action-menu-content fixed z-[9999] w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200" style={{ top: menuPosition.alignBottom ? 'auto' : menuPosition.top + 8, bottom: menuPosition.alignBottom ? (window.innerHeight - menuPosition.top) + 8 : 'auto', left: menuPosition.left - 200 }} onClick={(e) => e.stopPropagation()}>
        <div className="py-1">
          <button onClick={(e) => handleMenuAction('view', activeMenuId, e)} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"><Eye size={14} /> View Details</button>
          <button onClick={(e) => handleMenuAction('edit', activeMenuId, e)} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"><Edit size={14} /> Edit Request</button>
          <div className="my-1 border-t border-slate-100 dark:border-slate-700/50"></div>
          <button onClick={(e) => handleMenuAction('note', activeMenuId, e)} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"><MessageSquare size={14} /> Add Quick Note</button>
          <button onClick={(e) => handleMenuAction('status', activeMenuId, e)} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"><RefreshCw size={14} /> Update Status</button>
          <button onClick={(e) => handleMenuAction('reassign', activeMenuId, e)} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"><ArrowRightCircle size={14} /> Reassign</button>
          <div className="my-1 border-t border-slate-100 dark:border-slate-700/50"></div>
          <button onClick={(e) => handleMenuAction('archive', activeMenuId, e)} className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"><Archive size={14} /> Archive</button>
        </div>
      </div>, document.body
    );
  };

  const ConfirmationModals = () => {
    if (!activeModal) return null;
    let title = activeModal.type === 'archive' ? 'Archive Request' : activeModal.type === 'reassign' ? 'Reassign Request' : activeModal.type === 'note' ? 'Add Quick Note' : 'Update Status';
    return createPortal(
       <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm overflow-hidden animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
             <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50"><h3 className="font-bold text-sm text-slate-800 dark:text-white">{title}</h3><button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-800 dark:hover:text-white"><X size={16}/></button></div>
             <div className="p-6">
                {activeModal.type === 'archive' && <p className="text-sm text-slate-600 dark:text-slate-300">Are you sure you want to archive <strong>{activeModal.requestId}</strong>?</p>}
                {activeModal.type === 'reassign' && (<div className="space-y-4"><p className="text-sm text-slate-600 dark:text-slate-300">Select a new owner:</p><div className="space-y-2">{['Kelly Seale', 'Gautam Gautam', 'Tim R.', 'Sarah M.'].map(user => (<label key={user} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${reassignUser === user ? 'bg-brand-primary/5 border-brand-primary' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}><input type="radio" name="reassign" className="hidden" checked={reassignUser === user} onChange={() => setReassignUser(user)} /><div className={`w-5 h-5 rounded-full border flex items-center justify-center ${reassignUser === user ? 'bg-brand-primary border-brand-primary text-white' : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600'}`}>{reassignUser === user && <Check size={12} />}</div><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-200">{user.charAt(0)}</div><span className={`text-sm font-medium ${reassignUser === user ? 'text-brand-primary' : 'text-slate-700 dark:text-slate-300'}`}>{user}</span></div></label>))}</div></div>)}
                {activeModal.type === 'note' && (<div className="space-y-3"><p className="text-xs font-bold uppercase text-slate-400">Note Content</p><textarea autoFocus value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Type a quick note..." className="w-full h-32 p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/50 outline-none resize-none" /></div>)}
                {activeModal.type === 'status' && (<div className="space-y-3"><p className="text-xs font-bold uppercase text-slate-400">Select Status</p><div className="grid grid-cols-1 gap-2">{STATUS_OPTIONS.map(status => (<button key={status} onClick={() => setStatusValue(status)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${statusValue === status ? 'bg-brand-primary/5 border-brand-primary text-brand-primary' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'}`}><div className="flex items-center gap-2"><StatusBadge status={status} size="sm" /></div>{statusValue === status && <Check size={14} />}</button>))}</div></div>)}
             </div>
             <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3"><button onClick={() => setActiveModal(null)} className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all">Cancel</button><button onClick={confirmModalAction} className={`px-4 py-2 text-xs font-bold text-white rounded-lg shadow-md transition-all ${activeModal.type === 'archive' ? 'bg-red-500 hover:bg-red-600' : 'bg-brand-primary hover:bg-brand-primary/90'}`}>Confirm Action</button></div>
          </div>
       </div>, document.body
    );
  };

  return (
    <div className="space-y-6">
      <ActionMenu />
      <ConfirmationModals />
      
      {/* 
         THE BOX CONTAINER 
         This wraps both the header and the data grid to create a cohesive dashboard panel.
      */}
      {viewMode === 'table' ? (
        <div className="bg-app-surface rounded-app border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden animate-in fade-in duration-500">
           {/* HEADER (Inside the box) */}
           <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
               <div className="flex gap-4 items-center">
                   <h3 className="font-display font-bold text-lg text-slate-800 dark:text-white">{title}</h3>
                   {count !== undefined && (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold border border-slate-200 dark:border-slate-700">
                        {count} Items
                      </span>
                   )}
               </div>
               {headerAction && (
                 <div>{headerAction}</div>
               )}
           </div>

           {/* CONTENT (The Table) */}
           <div className="p-0">
               <UniversalDataGrid 
                 data={data}
                 columns={columns}
                 viewMode="table"
                 variant="clean" // Removes double border/shadow
                 onRowClick={(item) => onRequestClick && onRequestClick(item)}
                 renderGridCard={renderCard}
                 actionRenderer={(item) => (
                    <button 
                       onClick={(e) => toggleAction(item.id, e)} 
                       className={`action-menu-trigger text-slate-400 hover:text-brand-primary p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${activeMenuId === item.id ? 'text-brand-primary bg-slate-100 dark:bg-slate-800' : ''}`}
                    >
                       <MoreHorizontal size={18} />
                    </button>
                 )}
               />
           </div>
        </div>
      ) : (
         /* GRID VIEW (Standard card layout, header separate) */
         <>
             <div className="flex justify-between items-center px-2">
                <div className="flex gap-3 items-center">
                  <h3 className="font-display font-bold text-lg text-slate-800 dark:text-white">{title}</h3>
                  {count !== undefined && <span className="text-slate-400 text-sm font-medium">({count})</span>}
                </div>
                {headerAction}
             </div>
             
             <UniversalDataGrid 
                data={data}
                columns={columns}
                viewMode="grid"
                onRowClick={(item) => onRequestClick && onRequestClick(item)}
                renderGridCard={renderCard}
                // No actionRenderer needed for grid cards usually, as cards have their own internal menu
             />
         </>
      )}
    </div>
  );
};
