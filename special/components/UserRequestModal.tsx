
import React, { useState, useEffect } from 'react';
import { X, Edit2, Save, Calendar, User, FileText, Paperclip, Clock } from 'lucide-react';
import { RequestItem } from '../types';
import { StatusBadge } from './widgets/StatusBadge';
import { FancyButton } from './widgets/FancyButton';
import { ProgressTracker } from './widgets/ProgressTracker';
import { ConversationWidget } from './widgets/ConversationWidget';

interface UserRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: RequestItem | null;
  onUpdate: (id: string, field: string, value: any) => void;
}

export const UserRequestModal: React.FC<UserRequestModalProps> = ({ isOpen, onClose, request, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  useEffect(() => {
    if (request) {
      setEditTitle(request.title);
      setEditDesc(request.description);
      setIsEditing(false); // Reset editing state on open
    }
  }, [request, isOpen]);

  if (!isOpen || !request) return null;

  const handleSave = () => {
    onUpdate(request.id, 'title', editTitle);
    onUpdate(request.id, 'description', editDesc);
    setIsEditing(false);
  };

  const handleSendMessage = (message: string) => {
    onUpdate(request.id, 'add_note', message);
  };

  // Flatten notes for the widget
  const allNotes = request.assignments.flatMap(a => a.notes).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* 1. DARKER BACKDROP & BLUR */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      {/* 1. DISTINCT BORDER (ring-1 ring-white/10) */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/10 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-6 md:p-8 pb-10 relative overflow-hidden">
           {/* Background Decoration */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

           <div className="relative z-10 flex justify-between items-start mb-10">
              <div className="flex-1 pr-4">
                 <div className="flex items-center gap-3 mb-3">
                    <span className="font-mono text-xs font-bold text-slate-400">#{request.id}</span>
                    <StatusBadge status={request.status} />
                 </div>
                 {isEditing ? (
                    <input 
                      type="text" 
                      value={editTitle} 
                      onChange={(e) => setEditTitle(e.target.value)} 
                      className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-brand-primary rounded-lg px-2 py-1 outline-none w-full shadow-sm"
                    />
                 ) : (
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white leading-tight">{request.title}</h2>
                 )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                 {isEditing ? (
                    <>
                      <FancyButton variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</FancyButton>
                      <FancyButton variant="primary" size="sm" icon={Save} onClick={handleSave}>Save</FancyButton>
                    </>
                 ) : (
                    <>
                      {request.status !== 'Closed' && request.status !== 'Cancelled' && (
                          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-brand-primary hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors">
                             <Edit2 size={14} /> Edit
                          </button>
                      )}
                      <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                         <X size={20} />
                      </button>
                    </>
                 )}
              </div>
           </div>

           {/* WIDGET: PROGRESS TRACKER */}
           <ProgressTracker currentStatus={request.status} />

        </div>

        {/* BODY CONTENT */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
           <div className="grid grid-cols-1 lg:grid-cols-3 min-h-full">
              
              {/* LEFT COLUMN: DESCRIPTION & CHAT */}
              <div className="lg:col-span-2 p-6 md:p-8 border-r border-slate-100 dark:border-slate-800 space-y-8">
                 
                 {/* Description Section */}
                 <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                       <FileText size={14} /> Description
                    </h3>
                    <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
                       {isEditing ? (
                          <textarea 
                             value={editDesc} 
                             onChange={(e) => setEditDesc(e.target.value)}
                             className="w-full h-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-primary/50 outline-none"
                          />
                       ) : (
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{request.description}</p>
                       )}
                    </div>
                 </div>

                 {/* WIDGET: CONVERSATION (Chat) */}
                 <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <ConversationWidget 
                       messages={allNotes} 
                       onSendMessage={handleSendMessage}
                       currentUserId={request.requestedBy} // Align "Me" messages to right if they match requestor
                    />
                 </div>

              </div>

              {/* RIGHT COLUMN: METADATA (Read Only) */}
              <div className="bg-slate-50/50 dark:bg-slate-950/30 p-6 md:p-8 space-y-8 h-full border-l border-slate-100 dark:border-slate-800">
                 
                 {/* Assignee Card */}
                 <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Your Specialist</h3>
                    <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                          {request.assignee.charAt(0)}
                       </div>
                       <div>
                          <p className="font-bold text-sm text-slate-800 dark:text-white">{request.assignee}</p>
                          <p className="text-xs text-slate-500">Solution Architect</p>
                       </div>
                    </div>
                 </div>

                 {/* Key Details */}
                 <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Request Details</h3>
                    <div className="space-y-4">
                       <div className="flex items-center gap-3 text-sm">
                          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500"><Calendar size={16}/></div>
                          <div>
                             <p className="text-xs font-bold text-slate-400">Due Date</p>
                             <p className="font-medium text-slate-700 dark:text-slate-200">{request.date}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3 text-sm">
                          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500"><User size={16}/></div>
                          <div>
                             <p className="text-xs font-bold text-slate-400">Requested By</p>
                             <p className="font-medium text-slate-700 dark:text-slate-200">{request.requestedBy}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3 text-sm">
                          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500"><Clock size={16}/></div>
                          <div>
                             <p className="text-xs font-bold text-slate-400">Last Updated</p>
                             <p className="font-medium text-slate-700 dark:text-slate-200">{request.lastUpdated}</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Attachments (View/Download Only) */}
                 <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Files & Assets</h3>
                    <div className="space-y-2">
                       {request.assignments.flatMap(a => a.attachments || []).slice(0, 3).map((file, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg group cursor-pointer hover:border-brand-primary/50 transition-colors">
                             <div className="flex items-center gap-2 truncate">
                                <Paperclip size={14} className="text-brand-primary" />
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{file.name}</span>
                             </div>
                          </div>
                       ))}
                       <button className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-500 hover:text-brand-primary hover:border-brand-primary transition-colors flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <Paperclip size={14} /> Upload New File
                       </button>
                    </div>
                 </div>

              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
