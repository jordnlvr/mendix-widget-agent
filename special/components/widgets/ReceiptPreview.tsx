
import React from 'react';
import { Sparkles, AlertCircle, Calendar, Clock, MapPin } from 'lucide-react';

interface ReceiptData {
  title: string;
  requestType: string;
  specialties: string[];
  focusAreas: string[];
  description: string;
  customerName: string;
  opportunityId: string;
  technicalDiscovery: boolean;
  businessDiscovery: boolean;
  meetingDate: string;
  meetingTime: string;
  meetingLocation: string;
  meetingType: string;
}

interface ReceiptPreviewProps {
  data: ReceiptData;
  onEditStep: (step: number) => void;
}

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ data, onEditStep }) => {
   return (
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 shadow-2xl overflow-hidden relative" style={{ borderRadius: '1rem', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}>
            
            {/* Top Pattern */}
            <div className="h-3 bg-[repeating-linear-gradient(45deg,var(--color-primary)_0,var(--color-primary)_10px,var(--color-secondary)_10px,var(--color-secondary)_20px)] opacity-80"></div>
            
            <div className="p-8 md:p-12 space-y-8 relative">
               
               {/* Watermark */}
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                  <Sparkles size={400} />
               </div>

               {/* Header Section */}
               <div className="flex justify-between items-start border-b-2 border-dashed border-slate-200 dark:border-slate-700 pb-8">
                  <div>
                     <span className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-2 block flex items-center gap-2"><Sparkles size={12}/> New Request Draft</span>
                     <h2 className="text-3xl font-display font-black text-slate-900 dark:text-white">{data.title || "Untitled Request"}</h2>
                     <p className="text-slate-500 text-sm mt-2 font-medium">Requested by <span className="text-slate-800 dark:text-white">Kelly Seale</span></p>
                  </div>
                  <div className="text-right">
                     <div className="bg-slate-50 dark:bg-slate-800 px-5 py-3 rounded-xl border border-slate-100 dark:border-slate-700 inline-block shadow-sm">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Request Type</span>
                        <span className="font-black text-lg text-slate-800 dark:text-white">{data.requestType}</span>
                     </div>
                     <button onClick={() => onEditStep(1)} className="block mt-2 text-[10px] font-bold text-brand-primary hover:underline w-full uppercase tracking-wide">Change Type</button>
                  </div>
               </div>

               {/* Grid Content */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                  <div className="space-y-8">
                     {/* Scope Section */}
                     <div>
                        <div className="flex justify-between items-center mb-3">
                           <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Technical Scope</h4>
                           <button onClick={() => onEditStep(2)} className="text-[10px] font-bold text-brand-primary hover:underline bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">Edit</button>
                        </div>
                        <div className="space-y-3">
                           <div className="flex flex-wrap gap-2">
                              {data.specialties.length > 0 ? data.specialties.map(s => (
                                 <span key={s} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200">{s}</span>
                              )) : <span className="text-red-500 text-sm italic flex items-center gap-2"><AlertCircle size={14}/> No specialty selected</span>}
                           </div>
                           {data.focusAreas.length > 0 && (
                              <div className="pl-3 border-l-2 border-slate-200 dark:border-slate-700 pt-1">
                                 <span className="text-[10px] text-slate-400 block mb-1 font-bold uppercase">Focus Items</span>
                                 <div className="flex flex-wrap gap-2">
                                    {data.focusAreas.map(f => (
                                       <span key={f} className="text-xs font-medium text-brand-secondary">{f}</span>
                                    ))}
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>

                     {/* Narrative */}
                     <div>
                        <div className="flex justify-between items-center mb-3">
                           <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h4>
                           <button onClick={() => onEditStep(3)} className="text-[10px] font-bold text-brand-primary hover:underline bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">Edit</button>
                        </div>
                        <div className="p-5 bg-slate-50 dark:bg-slate-950/50 rounded-xl text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-h-40 overflow-y-auto custom-scrollbar border border-slate-100 dark:border-slate-800/50">
                           {data.description || <span className="text-slate-400 italic">No description provided.</span>}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-8">
                     {/* Sales Context */}
                     <div>
                        <div className="flex justify-between items-center mb-3">
                           <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sales Context</h4>
                           <button onClick={() => onEditStep(3)} className="text-[10px] font-bold text-brand-primary hover:underline bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">Edit</button>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-0 rounded-lg space-y-4 text-sm">
                           <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                              <span className="text-slate-500 font-medium">Customer</span>
                              <span className="font-bold text-slate-800 dark:text-white">{data.customerName || 'N/A'}</span>
                           </div>
                           <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                              <span className="text-slate-500 font-medium">Opp ID</span>
                              <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">{data.opportunityId || 'N/A'}</span>
                           </div>
                           <div className="grid grid-cols-2 gap-2">
                              <div className={`text-[10px] font-bold px-2 py-1.5 rounded text-center border ${data.technicalDiscovery ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400 grayscale'}`}>Tech Discovery</div>
                              <div className={`text-[10px] font-bold px-2 py-1.5 rounded text-center border ${data.businessDiscovery ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-400 grayscale'}`}>Biz Discovery</div>
                           </div>
                        </div>
                     </div>

                     {/* Logistics */}
                     <div>
                         <div className="flex justify-between items-center mb-3">
                             <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Logistics</h4>
                             <button onClick={() => onEditStep(3)} className="text-[10px] font-bold text-brand-primary hover:underline bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">Edit</button>
                         </div>
                         <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl space-y-3 text-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                               <Calendar size={14} className="text-brand-secondary"/>
                               <span className="font-bold">{data.meetingDate || 'TBD'}</span>
                               <span className="text-slate-300">|</span>
                               <Clock size={14} className="text-brand-secondary"/>
                               <span className="font-bold">{data.meetingTime || 'TBD'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                               <MapPin size={14} className="text-brand-secondary"/>
                               <span className="font-medium">{data.meetingLocation || 'Remote'}</span>
                               <span className="text-xs text-slate-400">({data.meetingType})</span>
                            </div>
                         </div>
                      </div>
                  </div>
               </div>
            </div>

            {/* Jagged Edge Effect (CSS Trick) */}
            <div className="h-4 w-full bg-slate-50 dark:bg-black/20" style={{ 
               backgroundImage: 'linear-gradient(45deg, transparent 50%, var(--color-bg-surface) 50%), linear-gradient(-45deg, transparent 50%, var(--color-bg-surface) 50%)',
               backgroundSize: '20px 20px',
               backgroundRepeat: 'repeat-x',
               backgroundPosition: '0 10px'
            }}></div>
            
            {/* Fake Barcode Section */}
            <div className="bg-slate-100 dark:bg-slate-950/80 p-6 flex justify-between items-center border-t border-slate-200 dark:border-slate-800">
               <div className="space-y-1">
                  <div className="h-8 w-48 bg-slate-800 dark:bg-slate-400 mask-image" style={{ maskImage: 'repeating-linear-gradient(90deg, black, black 2px, transparent 2px, transparent 4px)' }}></div>
                  <div className="text-[10px] font-mono text-slate-400 tracking-[0.2em]">{Math.random().toString(36).substring(7).toUpperCase()}-REQ</div>
               </div>
               <div className="text-right">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Routing To</div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Global Solution Engineering Lead</div>
               </div>
            </div>
         </div>
   );
};
