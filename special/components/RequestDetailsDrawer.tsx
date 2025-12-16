import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Paperclip, Clock, User, Calendar, Tag, ChevronRight, Layout, MessageSquare, Briefcase, CheckCircle2, MoreHorizontal, FilePlus, Bold, Italic, List, Link as LinkIcon, AlertCircle, Check, AlignLeft, Type, ChevronDown, Plus, Info, Eye, Download, Trash2, File, Image as ImageIcon, FileText, MoreVertical } from 'lucide-react';
import { RequestItem, Assignment, Note, Attachment } from '../types';
import { ActionModal } from './ActionModal';
import { SmartDropdown } from './widgets/SmartDropdown';
import { RichTextEditor } from './widgets/RichTextEditor';
import { StatusBadge } from './widgets/StatusBadge';
import { TimeEntryWidget } from './widgets/TimeEntryWidget';
import { SegmentedTabs, TabItem } from './widgets/SegmentedTabs';
import { EditableField } from './widgets/EditableField';
import { FancyButton } from './widgets/FancyButton';
import { FileDropzone } from './widgets/FileDropzone';
import { RatingInput } from './widgets/RatingInput';

interface RequestDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  request: RequestItem | null;
}

// --- CONSTANTS ---
const TEAM_MEMBERS = [
  "Kelly Seale", 
  "Will Ma", 
  "Gautam Gautam", 
  "Peter De Moerloose", 
  "Yuanyuan Huang", 
  "Jonathan Lazzeri", 
  "Abhijeet Mukkawar", 
  "Ricardo Perdigao", 
  "Sharath Sahadevan", 
  "Faisal Shahid"
];

const STATUS_OPTIONS = [
  "New", 
  "Assigned", 
  "In Progress", 
  "On Hold", 
  "Closed", 
  "Cancelled"
];

// --- HELPERS ---
const parseTime = (str: string) => {
  if(!str) return 0;
  let total = 0;
  const h = str.match(/(\d+)h/);
  const m = str.match(/(\d+)m/);
  const plain = str.match(/^(\d+)$/);

  if(h) total += parseInt(h[1]) * 60;
  if(m) total += parseInt(m[1]);
  if(plain) total += parseInt(plain[1]);
  
  if(total === 0 && (str.includes('min'))) {
     const nums = str.match(/(\d+)/);
     if(nums) total += parseInt(nums[1]);
  }

  return total;
}

const formatTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

// --- SUB-COMPONENTS ---

const CustomCheckbox: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  colorClass?: 'brand' | 'emerald';
}> = ({ checked, onChange, label, colorClass = 'brand' }) => {
  const isEmerald = colorClass === 'emerald';
  const activeBg = isEmerald ? 'bg-emerald-500/10' : 'bg-brand-primary/5';
  const activeBorder = isEmerald ? 'border-emerald-500/50' : 'border-brand-primary/50';
  const boxBg = isEmerald ? 'bg-emerald-500' : 'bg-brand-primary';
  const boxBorder = isEmerald ? 'border-emerald-500' : 'border-brand-primary';
  const textColor = isEmerald ? 'text-emerald-700 dark:text-emerald-400' : 'text-brand-primary';
  
  return (
    <label className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer group select-none ${checked ? `${activeBg} ${activeBorder} shadow-sm` : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
      <input type="checkbox" className="hidden" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className={`w-5 h-5 rounded flex items-center justify-center transition-all border flex-shrink-0 ${checked ? `${boxBg} ${boxBorder} text-white shadow-sm scale-110` : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:border-brand-primary/50'}`}>
        {checked && <Check size={12} strokeWidth={3} />}
      </div>
      <span className={`text-sm font-medium transition-colors ${checked ? textColor : 'text-slate-700 dark:text-slate-300'}`}>{label}</span>
    </label>
  );
};

const TimelineItem: React.FC<{ note: Note; onClick: () => void }> = ({ note, onClick }) => {
  return (
    <div className="relative pl-8 pb-8 last:pb-2 group animate-in slide-in-from-right-4 duration-500">
      <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700 group-last:hidden"></div>
      <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 shadow-sm flex items-center justify-center text-[9px] font-bold text-slate-500 z-10 group-hover:scale-110 transition-transform">{note.authorInitials}</div>
      <div onClick={onClick} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:shadow-md hover:border-brand-primary/40 transition-all cursor-pointer relative group/card">
         <div className="absolute top-3 -left-[5px] w-2.5 h-2.5 bg-white dark:bg-slate-900 border-l border-b border-slate-200 dark:border-slate-700 transform rotate-45"></div>
         <div className="absolute top-3 right-3 opacity-0 group-hover/card:opacity-100 transition-opacity text-brand-primary"><Eye size={14} /></div>
        <div className="flex justify-between items-start mb-1 relative z-10 pr-6">
          <span className="text-xs font-bold text-slate-800 dark:text-white">{note.author}</span>
          <span className="text-[10px] text-slate-400">{note.date}</span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap relative z-10 line-clamp-3">{note.text}</p>
      </div>
    </div>
  );
};

const FileItem: React.FC<{ file: Attachment }> = ({ file }) => {
  const getIcon = (type: string) => {
    if (type === 'pdf') return <FileText size={18} />;
    if (type === 'image') return <ImageIcon size={18} />;
    return <File size={18} />;
  };
  return (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg group hover:border-brand-primary/50 transition-colors shadow-sm">
       <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-brand-primary flex-shrink-0">{getIcon(file.type)}</div>
          <div className="min-w-0">
             <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{file.name}</p>
             <p className="text-[10px] text-slate-400 truncate">{file.size} • Uploaded by {file.uploadedBy} on {file.date}</p>
          </div>
       </div>
       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 transition-colors" title="Download"><Download size={14}/></button>
          <button className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-500 transition-colors" title="Delete"><Trash2 size={14}/></button>
       </div>
    </div>
  );
};

const AssignmentActionMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-colors"><MoreHorizontal size={18} /></button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          <div className="py-1">
            <button className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"><User size={14} /> Reassign</button>
            <button className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"><FileText size={14} /> Edit Details</button>
            <button className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"><Clock size={14} /> View Audit Log</button>
            <div className="my-1 border-t border-slate-100 dark:border-slate-700/50"></div>
            <button className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"><Trash2 size={14} /> Delete Assignment</button>
          </div>
        </div>
      )}
    </div>
  );
};

export const RequestDetailsDrawer: React.FC<RequestDetailsDrawerProps> = ({ isOpen, onClose, request }) => {
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [activeModal, setActiveModal] = useState<'note' | 'attachment' | 'time' | 'close' | 'viewNote' | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [addTimeValue, setAddTimeValue] = useState('');
  const [closeFormData, setCloseFormData] = useState({
    notes: '', timeSpent: 0, effort: 5, impactOpportunity: false, impactDetails: '', rndWork: false, rndTime: 0, productized: false, postSales: false, outsideRegion: false, unrelated: false, dealWon: false
  });

  useEffect(() => {
    if (request && request.assignments) {
      setAssignments(request.assignments);
      if (request.assignments.length > 0) setActiveTabId(request.assignments[0].id);
    }
  }, [request]);

  const handleAddSpecialty = () => {
    const specialties = ['Development', 'AI/Gen AI', 'Architecture', 'Graph Studio', 'Integration', 'Security'];
    const randomSpecialty = specialties[Math.floor(Math.random() * specialties.length)];
    const newId = `new-${Date.now()}`;
    const newAssignment: Assignment = { id: newId, specialty: randomSpecialty, assignedTo: 'Unassigned', status: 'New', dateAssigned: new Date().toLocaleDateString(), timeSpent: '0h', initialNotes: '', notes: [] };
    setAssignments([...assignments, newAssignment]);
    setActiveTabId(newId);
  };

  const updateAssignmentField = (id: string, field: keyof Assignment, value: any) => {
    if (field === 'status' && value === 'Closed') { setActiveModal('close'); return; }
    setAssignments(prev => prev.map(a => { if (a.id === id) { return { ...a, [field]: value }; } return a; }));
  };

  const handleAddNotes = (text: string) => {
    const now = new Date();
    const newNote: Note = { id: `n-${Date.now()}`, text: text, author: 'Kelly Seale', authorInitials: 'KS', date: `${now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}, ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` };
    setAssignments(prev => prev.map(a => { if (a.id === activeTabId) { return { ...a, notes: [newNote, ...a.notes] }; } return a; }));
  };

  const handleSaveNote = () => { if (!newNoteText.trim()) return; handleAddNotes(newNoteText); setNewNoteText(''); setActiveModal(null); };
  const handleViewNote = (note: Note) => { setViewingNote(note); setActiveModal('viewNote'); };
  const handleSaveTime = () => {
    const addedMinutes = parseInt(addTimeValue);
    if (isNaN(addedMinutes) || addedMinutes <= 0) { setActiveModal(null); return; }
    setAssignments(prev => prev.map(a => { if (a.id === activeTabId) { const currentMins = parseTime(a.timeSpent); return { ...a, timeSpent: formatTime(currentMins + addedMinutes) }; } return a; }));
    setAddTimeValue(''); setActiveModal(null);
  };

  const handleCloseSpecialty = () => {
    setAssignments(prev => prev.map(a => {
      if (a.id === activeTabId) {
        let timeStr = a.timeSpent;
        if (closeFormData.timeSpent > 0) { const current = parseTime(a.timeSpent); timeStr = formatTime(current + closeFormData.timeSpent); }
        let closureNoteText = `**SPECIALTY CLOSED**\n\n**Closing Notes:** ${closeFormData.notes}\n**Effort:** ${closeFormData.effort}/10\n`;
        if (closeFormData.impactOpportunity) closureNoteText += `**Impact:** ${closeFormData.impactDetails}\n`;
        if (closeFormData.rndWork) closureNoteText += `**R&D Time:** ${closeFormData.rndTime} mins\n**Productized:** ${closeFormData.productized ? 'Yes' : 'No'}\n`;
        closureNoteText += `**Deal Won:** ${closeFormData.dealWon ? 'Yes' : 'No'}`;
        const now = new Date();
        const closureNote: Note = { id: `c-${Date.now()}`, text: closureNoteText, author: 'Kelly Seale', authorInitials: 'KS', date: `${now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}, ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` };
        return { ...a, status: 'Closed', timeSpent: timeStr, notes: [closureNote, ...a.notes] };
      }
      return a;
    }));
    setActiveModal(null);
    setCloseFormData({ notes: '', timeSpent: 0, effort: 5, impactOpportunity: false, impactDetails: '', rndWork: false, rndTime: 0, productized: false, postSales: false, outsideRegion: false, unrelated: false, dealWon: false });
  };

  if (!isOpen || !request) return null;
  const currentAssignment = assignments.find(a => a.id === activeTabId) || assignments[0];
  const sortedAssignments = [...assignments].sort((a, b) => { if (a.status === 'Cancelled') return 1; if (b.status === 'Cancelled') return -1; return 0; });

  // Map assignments to TabItems for the widget
  const tabItems: TabItem[] = sortedAssignments.map(a => ({
      id: a.id,
      label: a.specialty,
      isComplete: a.status === 'Closed',
      isCancelled: a.status === 'Cancelled'
  }));

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/30 dark:bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-[960px] bg-app-surface shadow-2xl z-50 transform transition-transform duration-300 ease-out border-l border-slate-200 dark:border-slate-700 flex flex-col">
        
        {/* MODALS */}
        <ActionModal isOpen={activeModal === 'note'} title="Add Note to Request" onClose={() => setActiveModal(null)} onSave={handleSaveNote} maxWidth="max-w-2xl">
          <div className="space-y-3">
             <textarea value={newNoteText} onChange={(e) => setNewNoteText(e.target.value)} placeholder="Type your note here..." className="w-full h-48 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/50 resize-none leading-relaxed" />
          </div>
        </ActionModal>

        <ActionModal isOpen={activeModal === 'viewNote'} title="Note Details" onClose={() => setActiveModal(null)} maxWidth="max-w-2xl">
          {viewingNote && (
            <div className="space-y-4">
               <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div><h4 className="text-sm font-bold text-slate-800 dark:text-white">{viewingNote.author}</h4><p className="text-xs text-slate-400">{viewingNote.date}</p></div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><MessageSquare size={16} className="text-slate-500" /></div>
               </div>
               <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50"><p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">{viewingNote.text}</p></div>
            </div>
          )}
        </ActionModal>

        <ActionModal isOpen={activeModal === 'time'} title="Add Time Spent" onClose={() => setActiveModal(null)} onSave={handleSaveTime} maxWidth="max-w-sm">
          <div className="space-y-4">
             <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start gap-3"><Info size={16} className="text-blue-500 mt-0.5" /><p className="text-xs text-blue-700 dark:text-blue-200 leading-relaxed">Enter the time in minutes you want to <strong>add</strong> to the current total.</p></div>
             <div><label className="block text-xs font-bold uppercase text-slate-400 mb-1">Add Minutes</label><div className="relative"><input type="number" value={addTimeValue} onChange={(e) => setAddTimeValue(e.target.value)} placeholder="e.g. 30" autoFocus className="w-full p-3 pl-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-lg font-bold outline-none focus:ring-2 focus:ring-brand-primary/50" /><Clock className="absolute left-3 top-4 text-slate-400" size={18} /></div></div>
          </div>
        </ActionModal>

        <ActionModal isOpen={activeModal === 'close'} title={`Close ${currentAssignment?.specialty} Specialty`} onClose={() => setActiveModal(null)} onSave={handleCloseSpecialty} maxWidth="max-w-6xl">
          <div className="space-y-6">
             <div className="bg-brand-primary/5 border-l-4 border-brand-primary p-4 rounded-r-lg flex items-start gap-4 mb-6"><div className="p-2 bg-brand-primary/10 rounded-full flex-shrink-0"><Info size={18} className="text-brand-primary" /></div><div><h4 className="text-sm font-bold text-slate-800 dark:text-white">Closure Requirements</h4><p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">Please complete the details below to finalize this specialty.</p></div></div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <div className="group"><label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Closing Notes *</label><textarea value={closeFormData.notes} onChange={(e) => setCloseFormData({...closeFormData, notes: e.target.value})} placeholder="Summary..." className="w-full h-40 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/50 resize-none" /></div>
                   <CustomCheckbox checked={closeFormData.impactOpportunity} onChange={(val) => setCloseFormData({...closeFormData, impactOpportunity: val})} label="Did this work impact the opportunity?" />
                   {closeFormData.impactOpportunity && <textarea value={closeFormData.impactDetails} onChange={(e) => setCloseFormData({...closeFormData, impactDetails: e.target.value})} className="w-full h-20 p-3 mt-2 bg-white dark:bg-slate-900 border border-slate-200 rounded-lg text-sm" placeholder="Explain..." />}
                </div>
                <div className="space-y-6">
                   <TimeEntryWidget label="Time Spent (+)" value={closeFormData.timeSpent.toString()} onAddClick={() => { /* Simplified for modal */ }} />
                   <RatingInput label="Effort Level" value={closeFormData.effort} onChange={(val) => setCloseFormData({...closeFormData, effort: val})} />
                   <CustomCheckbox checked={closeFormData.dealWon} onChange={(val) => setCloseFormData({...closeFormData, dealWon: val})} label="Deal Won?" colorClass="emerald" />
                </div>
             </div>
          </div>
        </ActionModal>

        <ActionModal isOpen={activeModal === 'attachment'} title="Upload Attachment" onClose={() => setActiveModal(null)} onSave={() => setActiveModal(null)}>
           <div className="space-y-4">
             <select className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-lg text-sm"><option>Architecture Diagram</option><option>Other</option></select>
             <FileDropzone />
          </div>
        </ActionModal>

        {/* HEADER */}
        <div className="grid grid-cols-12 border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
           <div className="col-span-12 lg:col-span-8 p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3"><span className="font-mono text-xs font-bold text-slate-500 px-2 py-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 shadow-sm">{request.id}</span><StatusBadge status={request.status} /></div>
              </div>
              <div className="space-y-6">
                 <div><input type="text" defaultValue={request.title} className="w-full text-2xl font-display font-bold text-slate-800 dark:text-white bg-transparent border-none outline-none placeholder-slate-400 focus:ring-0 p-0" /></div>
                 <RichTextEditor label="Details / Explanation" value={request.description} />
              </div>
           </div>
           <div className="col-span-12 lg:col-span-4 p-6 lg:p-8 bg-white dark:bg-slate-800/20">
              <div className="flex justify-between items-start mb-6"><h4 className="text-xs font-bold text-brand-secondary uppercase tracking-wider flex items-center gap-2"><Tag size={12} /> Request Info</h4><button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors"><X size={20} /></button></div>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                 <div className="col-span-2"><span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Customer</span><p className="text-base font-bold text-slate-800 dark:text-white">{request.customerName}</p></div>
                 <div><span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Type</span><p className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded w-fit">{request.requestType}</p></div>
                 <div><span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Requested By</span><p className="text-sm font-medium text-slate-700 dark:text-slate-200">{request.requestedBy}</p></div>
              </div>
           </div>
        </div>

        {/* BODY */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-black/20">
           <div className="sticky top-0 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur z-20 px-6 lg:px-8 pt-6 pb-4 border-b border-transparent transition-all">
              <div className="flex items-center gap-2 mb-3"><Briefcase size={16} className="text-brand-primary" /><span className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wide">Assignments</span></div>
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 min-w-0 mr-4 w-full flex items-center">
                    <SegmentedTabs items={tabItems} activeId={activeTabId} onChange={setActiveTabId} />
                    <button onClick={handleAddSpecialty} className="flex-shrink-0 w-8 h-8 ml-2 rounded-lg text-slate-400 hover:text-brand-primary hover:bg-white dark:hover:bg-slate-800 transition-colors flex items-center justify-center"><FilePlus size={14} /></button>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-auto md:ml-0">
                  <FancyButton variant="primary" icon={MessageSquare} onClick={() => setActiveModal('note')}>Add Note</FancyButton>
                  <FancyButton variant="outline" icon={Paperclip} onClick={() => setActiveModal('attachment')}>Attach</FancyButton>
                  <AssignmentActionMenu />
                </div>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-white dark:bg-slate-900 relative">
              {currentAssignment && (
                 <div key={currentAssignment.id} className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300 relative items-start">
                    <div className="lg:col-span-7 space-y-6">
                       <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Details</h3>
                          <div className="grid grid-cols-2 gap-6 mb-6">
                             <SmartDropdown label="Assigned To" value={currentAssignment.assignedTo} options={TEAM_MEMBERS} onChange={(val) => updateAssignmentField(currentAssignment.id, 'assignedTo', val)} />
                             <SmartDropdown label="Status" value={currentAssignment.status} options={STATUS_OPTIONS} onChange={(val) => updateAssignmentField(currentAssignment.id, 'status', val)} renderOption={(opt) => (<div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${opt === 'Closed' ? 'bg-emerald-500' : opt === 'Cancelled' ? 'bg-slate-400' : 'bg-brand-primary'}`}></div>{opt}</div>)} />
                             <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Date Assigned</label><div className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/50 rounded-lg"><Calendar size={14} className="text-slate-400" /> {currentAssignment.dateAssigned}</div></div>
                             <TimeEntryWidget value={currentAssignment.timeSpent} onAddClick={() => setActiveModal('time')} />
                          </div>
                          <EditableField label="Initial Instructions / Notes" value={currentAssignment.initialNotes} multiline />
                       </div>
                       <div className="space-y-3">
                         {currentAssignment.attachments && currentAssignment.attachments.length > 0 && (<><h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1 flex items-center gap-2"><Paperclip size={12} /> Attachments ({currentAssignment.attachments.length})</h4><div className="space-y-2">{currentAssignment.attachments.map(file => (<FileItem key={file.id} file={file} />))}</div></>)}
                         <FileDropzone label="Quick Attach" sublabel="Drag & drop files here" />
                       </div>
                    </div>
                    <div className="lg:col-span-5 flex flex-col h-full lg:sticky lg:top-6">
                       <div className="bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden">
                          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center flex-shrink-0"><h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2"><List size={14} /> Activity Stream</h4><span className="text-[10px] font-bold px-1.5 py-0.5 bg-brand-primary/20 text-brand-primary rounded-full">{currentAssignment.notes?.length || 0}</span></div>
                          <div className="flex-1 p-4 overflow-y-auto lg:max-h-[calc(100vh-300px)] custom-scrollbar">
                             <div onClick={() => setActiveModal('note')} className="mb-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-400 text-sm cursor-text hover:border-brand-primary/50 transition-colors shadow-sm flex items-center gap-2"><div className="w-1.5 h-4 bg-brand-primary/50 rounded-full"></div>Click to add a note...</div>
                             {currentAssignment.notes && currentAssignment.notes.length > 0 ? (<div className="space-y-1">{currentAssignment.notes.map((note) => (<TimelineItem key={note.id} note={note} onClick={() => handleViewNote(note)} />))}</div>) : (<div className="text-center py-10 opacity-50 flex flex-col items-center"><MessageSquare size={32} className="mb-2 text-slate-300" /><p className="text-xs text-slate-400 font-medium">No activity yet.</p></div>)}
                          </div>
                       </div>
                    </div>
                 </div>
              )}
           </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 z-30">
            <div className="text-xs text-slate-400 font-medium"><span className="hidden md:inline">Edits saved locally. </span><span className="text-brand-primary cursor-pointer hover:underline">View History</span></div>
            <div className="flex gap-3">
              <FancyButton variant="outline" onClick={onClose}>Cancel</FancyButton>
              <FancyButton variant="primary" icon={Save} onClick={onClose}>Save Changes</FancyButton>
            </div>
        </div>
      </div>
    </>
  );
};
