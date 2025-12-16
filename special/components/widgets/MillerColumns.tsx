
import React, { useState } from 'react';
import { Globe, Activity, Server, Briefcase, Check, ChevronRight, Search, Layers, Sparkles, XCircle } from 'lucide-react';

// --- DATA STRUCTURE (Movable to props or JSON config) ---
export const EXPERTISE_TREE: Record<string, { label: string, icon: any, specialties: Record<string, string[]> }> = {
  Mendix: {
    label: "Mendix Specialties",
    icon: Globe,
    specialties: {
      'Architecture': ['Cloud Architecture', 'On-Premise', 'Security Model', 'High Availability', 'Network Config'],
      'AI / GenAI': ['Copilot', 'Reasoning Engine', 'AI Gateway', 'Vector DB', 'Chatbots', 'Knowledge Base'],
      'Development': ['Studio Pro', 'React Widgets', 'Java Actions', 'Pluggable Widgets', 'Native Mobile'],
      'Governance': ['Control Center', 'Portfolio Manager', 'Pipelines', 'Quality Monitor'],
      'Integration': ['Connect', 'Data Hub', 'OData', 'REST/SOAP', 'Kafka', 'SAP Connector'],
      'Industrial': ['Edge', 'Industrial Connectors', 'Opcenter', 'Siemens Xcelerator'],
      'Infosec': ['Compliance Reports', 'Pen Testing Support', 'Security Architecture', 'SSO/SAML'],
      'Machine Learning': ['ML Kit', 'Python Integration', 'Model Hosting']
    }
  },
  RapidMiner: {
    label: "RapidMiner Specialties",
    icon: Activity,
    specialties: {
      'AI / GenAI': ['LLM Integration', 'Prompt Engineering', 'RAG Patterns', 'Fine Tuning'],
      'AI Studio Family': ['Visual Workflow', 'Auto Model', 'Turbo Prep', 'Distributed Exec'],
      'Data Science': ['Python/R Integration', 'Notebooks', 'Feature Engineering', 'Statistics'],
      'Graph Family': ['Graph Studio', 'Link Analysis', 'Network Viz'],
      'Knowledge Studio': ['Knowledge Seeker', 'Knowledge Studio', 'KS for Apache Spark', 'License Server'],
      'Panopticon': ['Real-time Dashboarding', 'Tick Data', 'Streaming Analytics', 'Alerting']
    }
  },
  Siemens: {
    label: "Siemens Specialties",
    icon: Server,
    specialties: {
      'Xcelerator': ['Industrial Edge', 'Insights Hub', 'Mindsphere', 'Mendix on Edge'],
      'Emerging Tech': ['Metaverse', 'Digital Twin', 'AR/VR'],
      'Other': ['Custom Integration', 'Legacy Systems', 'Migration']
    }
  }
};

interface MillerColumnsProps {
  selectedSpecialties: string[];
  selectedFocusAreas: string[];
  onToggleSpecialty: (specialty: string, platform: string) => void;
  onToggleFocusArea: (focusArea: string) => void;
  onRemoveSpecialty: (specialty: string, platform: string) => void; // Explicit remove for the pill
}

export const MillerColumns: React.FC<MillerColumnsProps> = ({ 
  selectedSpecialties, 
  selectedFocusAreas, 
  onToggleSpecialty, 
  onToggleFocusArea,
  onRemoveSpecialty
}) => {
  const [activePlatform, setActivePlatform] = useState<string>('Mendix');
  const [activeSpecialty, setActiveSpecialty] = useState<string>('Architecture');

  const platforms = Object.keys(EXPERTISE_TREE);
  
  // Safe access to data based on current view state
  const platformData = EXPERTISE_TREE[activePlatform];
  const specialties = platformData ? Object.keys(platformData.specialties) : [];
  const focusAreas = (platformData && platformData.specialties[activeSpecialty]) || [];

  return (
    <div className="flex flex-col h-full">
       {/* THE MILLER COLUMNS CONTAINER */}
       <div className="flex-1 min-h-[500px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg flex overflow-hidden ring-1 ring-slate-950/5 dark:ring-white/5 mb-6">
          
          {/* COL 1: PLATFORM (Navigation Only) */}
          <div className="w-1/3 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/80 dark:bg-slate-950/50 backdrop-blur-sm">
             <div className="p-4 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Globe size={12}/> Platform
             </div>
             <div className="p-2 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
                {platforms.map(platform => {
                   const isActive = activePlatform === platform;
                   const Icon = EXPERTISE_TREE[platform].icon;
                   
                   // Count selections within this platform for the badge
                   const platformSpecs = Object.keys(EXPERTISE_TREE[platform].specialties);
                   const selectedCount = platformSpecs.filter(s => selectedSpecialties.includes(s)).length;

                   return (
                      <button
                        key={platform}
                        onClick={() => { setActivePlatform(platform); setActiveSpecialty(Object.keys(EXPERTISE_TREE[platform].specialties)[0]); }}
                        className={`
                           w-full flex items-center justify-between p-3 rounded-lg text-sm font-bold transition-all group relative overflow-hidden
                           ${isActive 
                            ? 'bg-white dark:bg-slate-800 shadow-sm text-brand-primary ring-1 ring-slate-200 dark:ring-slate-700' 
                            : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/30'
                           }
                        `}
                      >
                         {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary"></div>}
                         <div className="flex items-center gap-3">
                            <Icon size={18} className={isActive ? 'text-brand-primary' : 'opacity-70'} />
                            <span>{platform}</span>
                            {selectedCount > 0 && (
                                <span className="bg-brand-primary text-white text-[10px] h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full ml-1 shadow-sm">
                                    {selectedCount}
                                </span>
                            )}
                         </div>
                         <ChevronRight size={14} className={`transition-transform duration-300 ${isActive ? 'text-brand-primary translate-x-1' : 'opacity-0 group-hover:opacity-50'}`} />
                      </button>
                   )
                })}
             </div>
          </div>

          {/* COL 2: SPECIALTY (Selection & Navigation) */}
          <div className="w-1/3 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900">
             <div className="p-4 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Briefcase size={12}/> Specialty
             </div>
             <div className="p-2 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
                {specialties.map(spec => {
                   const isViewActive = activeSpecialty === spec;
                   const isSelected = selectedSpecialties.includes(spec);
                   
                   return (
                      <div 
                        key={spec}
                        onClick={() => setActiveSpecialty(spec)}
                        className={`
                           group flex items-center justify-between p-3 rounded-lg cursor-pointer border border-transparent transition-all relative
                           ${isViewActive ? 'bg-brand-primary/5 dark:bg-slate-800/80 shadow-inner' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}
                        `}
                      >
                         {/* Active Indicator Line */}
                         {isViewActive && <div className="absolute left-0 top-2 bottom-2 w-1 bg-brand-primary rounded-full"></div>}

                         {/* Selection Logic Wrapper */}
                         <div 
                            className="flex items-center gap-3 flex-1 pl-2" 
                            onClick={(e) => { 
                                // SMART INTERACTION: Clicking the row both Selects AND Activates view
                                onToggleSpecialty(spec, activePlatform); 
                            }}
                         >
                            <div className={`
                                w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 shadow-sm
                                ${isSelected 
                                    ? 'bg-brand-primary border-brand-primary text-white scale-110' 
                                    : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-600 group-hover:border-brand-primary/50'}
                            `}>
                               {isSelected && <Check size={10} strokeWidth={4} />}
                            </div>
                            <span className={`text-sm font-medium ${isSelected ? 'text-brand-primary font-bold' : 'text-slate-700 dark:text-slate-200'}`}>
                                {spec}
                            </span>
                         </div>

                         {/* Focus Indicator */}
                         {isViewActive && <ChevronRight size={14} className="text-brand-primary" />}
                      </div>
                   )
                })}
             </div>
          </div>

          {/* COL 3: FOCUS ITEMS (Selection Only) */}
          <div className="w-1/3 flex flex-col bg-slate-50/30 dark:bg-black/20">
             <div className="p-4 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Search size={12}/> Focus Areas ({activeSpecialty})
             </div>
             <div className="p-2 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
                {focusAreas.length > 0 ? focusAreas.map(item => {
                   const isSelected = selectedFocusAreas.includes(item);
                   return (
                      <button
                        key={item}
                        onClick={() => onToggleFocusArea(item)}
                        className={`
                            w-full text-left flex items-center gap-3 p-3 rounded-lg transition-all border border-transparent
                            ${isSelected 
                                ? 'bg-white dark:bg-slate-800 text-brand-primary border-brand-primary/20 shadow-md ring-1 ring-brand-primary/5' 
                                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}
                        `}
                      >
                         <div className={`
                            w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 
                            ${isSelected 
                                ? 'bg-brand-primary border-brand-primary text-white' 
                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'}
                         `}>
                            {isSelected && <Check size={10} strokeWidth={4} />}
                         </div>
                         <span className="text-sm font-medium leading-tight">{item}</span>
                      </button>
                   )
                }) : (
                   <div className="p-8 text-center flex flex-col items-center">
                      <Layers size={24} className="text-slate-300 mb-2" />
                      <p className="text-slate-400 text-xs italic">No specific focus items available for {activeSpecialty}.</p>
                   </div>
                )}
             </div>
          </div>
       </div>

       {/* Sticky Summary Pill */}
       <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 text-xs shadow-lg sticky bottom-0 z-10">
          <div className="flex items-center gap-2 text-brand-primary font-bold uppercase tracking-wider flex-shrink-0">
             <Sparkles size={14}/> Your Scope:
          </div>
          
          <div className="flex-1 flex flex-wrap gap-2 items-center">
             {selectedSpecialties.length === 0 && <span className="text-slate-400 italic">Select specialties from the list above.</span>}
             
             {selectedSpecialties.map(s => {
                // Find platform for this spec to pass to toggle
                const plat = Object.keys(EXPERTISE_TREE).find(p => Object.keys(EXPERTISE_TREE[p].specialties).includes(s)) || 'Mendix';
                return (
                   <div key={s} className="group flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-bold shadow-sm">
                       <span>{s}</span>
                       <button onClick={() => onRemoveSpecialty(s, plat)} className="text-slate-400 hover:text-red-500 transition-colors ml-1"><XCircle size={12}/></button>
                   </div>
                );
             })}
             
             {selectedFocusAreas.length > 0 && <span className="text-slate-300 mx-1 hidden md:inline">|</span>}
             
             {selectedFocusAreas.map(f => (
                <button key={f} onClick={() => onToggleFocusArea(f)} className="px-2.5 py-1 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-lg font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors" title="Click to remove">
                   {f}
                </button>
             ))}
          </div>
       </div>
    </div>
  );
};
