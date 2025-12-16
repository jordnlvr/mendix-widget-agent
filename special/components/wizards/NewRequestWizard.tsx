
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Check, ChevronRight, ChevronLeft, Layout, Briefcase, 
  Code2, Users, FileText, Calendar, Zap, Brain, Laptop, ArrowRight,
  Layers, Globe, Shield, Activity, Server, Clock, MapPin, 
  AlignLeft, AlertCircle, Sparkles, XCircle, MousePointer2
} from 'lucide-react';
import { EditableField } from '../widgets/EditableField';
import { RichTextEditor } from '../widgets/RichTextEditor';
import { SmartDropdown } from '../widgets/SmartDropdown';
import { FancyButton } from '../widgets/FancyButton';
import { MillerColumns, EXPERTISE_TREE } from '../widgets/MillerColumns';
import { StatusToggle } from '../widgets/StatusToggle';
import { ReceiptPreview } from '../widgets/ReceiptPreview';

// --- TYPES ---

export interface WizardData {
  requestType: string;
  specialties: string[];
  focusAreas: string[];
  title: string;
  description: string;
  customerName: string;
  opportunityId: string;
  valueProp: string;
  technicalDiscovery: boolean;
  businessDiscovery: boolean;
  platformOverview: boolean;
  mendixDeepDive: boolean;
  meetingDate: string;
  meetingTime: string;
  meetingLength: string;
  meetingLocation: string;
  meetingType: string;
  meetingAgenda: string;
  attendees: string;
}

interface StepProps {
  data: WizardData;
  updateData: (fields: Partial<WizardData>) => void;
  onNext?: () => void;
  isValid?: boolean;
}

// --- CONSTANTS ---

const REQUEST_GROUPS = [
  {
    title: "Customer Engagement",
    items: [
      { id: 'Meeting', label: 'Meeting / RFI', icon: Users, desc: 'Prep for a customer meeting, presentation, or RFI response.' },
      { id: 'Demo', label: 'Demo Build', icon: Laptop, desc: 'Standard or custom demo preparation for a prospect.' },
      { id: 'POC', label: 'POC Execution', icon: Code2, desc: 'Build or edit a proof of concept for a customer.' },
      { id: 'Event', label: 'Event Support', icon: Calendar, desc: 'Booth staff, presentation, or prep for an event.' },
    ]
  },
  {
    title: "Internal & Enablement",
    items: [
      { id: 'SME Help', label: 'SME Advising', icon: Brain, desc: 'Expert advice on architecture, solutioning, or generic help.' },
      { id: 'Development', label: 'Internal Dev', icon: Layers, desc: 'Custom app, module, or widget development for internal use.' },
      { id: 'Asset', label: 'Asset / Docs', icon: FileText, desc: 'Access to existing assets or creation of new documentation.' },
      { id: 'Training', label: 'Training', icon: Zap, desc: 'Internal or customer enablement session.' },
    ]
  }
];

// --- STEP 1: REQUEST TYPE ---

const StepType: React.FC<StepProps> = ({ data, updateData }) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="text-center mb-4">
        <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">What kind of help do you need?</h3>
        <p className="text-slate-500 dark:text-slate-400 text-lg">Choose the request type that best matches the support you're seeking.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-10">
        {REQUEST_GROUPS.map((group, idx) => (
          <div key={idx} className="space-y-5">
             <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-secondary whitespace-nowrap px-2 py-1 bg-brand-secondary/10 rounded">{group.title}</span>
                <div className="h-px flex-1 bg-gradient-to-r from-slate-200 dark:from-slate-800 to-transparent"></div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {group.items.map((type) => {
                  const isSelected = data.requestType === type.id;
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => updateData({ requestType: type.id })}
                      className={`
                        group relative p-5 rounded-2xl border text-left transition-all duration-300 h-full flex flex-col
                        ${isSelected 
                          ? 'bg-white dark:bg-slate-900 border-brand-primary ring-2 ring-brand-primary/20 shadow-xl scale-[1.02] z-10' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-primary/50 hover:shadow-lg hover:scale-[1.01]'
                        }
                      `}
                    >
                      <div className={`
                         p-3 rounded-xl w-fit mb-4 transition-all duration-300
                         ${isSelected 
                           ? 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-lg shadow-brand-primary/30' 
                           : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-brand-primary group-hover:bg-brand-primary/10'}
                      `}>
                        <Icon size={24} />
                      </div>
                      <h4 className={`font-bold text-lg mb-2 transition-colors ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>{type.label}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-1">{type.desc}</p>
                      
                      {isSelected && (
                        <div className="absolute top-3 right-3 animate-in zoom-in duration-300">
                           <div className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-md">
                             <Check size={14} strokeWidth={4} />
                           </div>
                        </div>
                      )}
                    </button>
                  );
                })}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- STEP 2: SCOPE & EXPERTISE (Using Modular Miller Columns) ---

const StepExpertise: React.FC<StepProps> = ({ data, updateData }) => {
  
  const toggleSelection = (list: string[], item: string) => {
    return list.includes(item) ? list.filter(i => i !== item) : [...list, item];
  };

  const handleToggleSpecialty = (spec: string, currentPlatform: string) => {
    const isCurrentlySelected = data.specialties.includes(spec);
    
    if (isCurrentlySelected) {
      // Removing: Filter out specialty AND its children focus areas (Auto-Cleanup)
      const childrenFocusAreas = EXPERTISE_TREE[currentPlatform].specialties[spec] || [];
      const newFocusAreas = data.focusAreas.filter(f => !childrenFocusAreas.includes(f));
      
      updateData({ 
        specialties: data.specialties.filter(s => s !== spec),
        focusAreas: newFocusAreas
      });
    } else {
      // Adding: Just add specialty
      updateData({ specialties: [...data.specialties, spec] });
    }
  };

  // Explicit remove function for the pills (behaves same as toggle off)
  const handleRemoveSpecialty = (spec: string, currentPlatform: string) => {
      const childrenFocusAreas = EXPERTISE_TREE[currentPlatform].specialties[spec] || [];
      const newFocusAreas = data.focusAreas.filter(f => !childrenFocusAreas.includes(f));
      updateData({ 
        specialties: data.specialties.filter(s => s !== spec),
        focusAreas: newFocusAreas
      });
  };

  const handleToggleFocus = (focusItem: string) => {
     updateData({ focusAreas: toggleSelection(data.focusAreas, focusItem) });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 h-full flex flex-col">
       <div className="text-center md:text-left flex-shrink-0">
          <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Scope & Expertise</h3>
          <p className="text-slate-500 dark:text-slate-400">Drill down to select the specific capabilities needed.</p>
       </div>

       {/* Modular Miller Columns Widget */}
       <MillerColumns 
          selectedSpecialties={data.specialties}
          selectedFocusAreas={data.focusAreas}
          onToggleSpecialty={handleToggleSpecialty}
          onToggleFocusArea={handleToggleFocus}
          onRemoveSpecialty={handleRemoveSpecialty}
       />
    </div>
  );
};

// --- STEP 3: DETAILS (Using Modular StatusToggle) ---

const StepDetails: React.FC<StepProps> = ({ data, updateData }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
       <div className="text-center md:text-left">
        <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Context & Discovery</h3>
        <p className="text-slate-500 dark:text-slate-400">Tell the story behind the request.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         {/* LEFT COLUMN: Narrative & Status */}
         <div className="xl:col-span-2 space-y-8">
            
            {/* 1. Core Narrative */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
               <div className="flex items-center gap-2 mb-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary"><FileText size={18} /></div>
                  <div>
                     <h4 className="font-bold text-sm text-slate-800 dark:text-white">The Narrative</h4>
                     <p className="text-[10px] text-slate-400">What do we need to know?</p>
                  </div>
               </div>
               
               <EditableField 
                  label="Request Title *" 
                  value={data.title} 
                  onChange={(val) => updateData({ title: val })} 
                  className="text-lg"
               />
               <RichTextEditor 
                  label="Details / Full Explanation" 
                  value={data.description} 
                  className="min-h-[160px]"
               />
               <RichTextEditor 
                  label="Business Value / Why Now?" 
                  value={data.valueProp} 
                  onChange={(val) => updateData({ valueProp: val })}
                  className="min-h-[100px]"
               />
            </div>

            {/* 2. Customer & Discovery Tiles */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
               <div className="flex items-center gap-2 mb-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-2 bg-brand-secondary/10 rounded-lg text-brand-secondary"><Briefcase size={18} /></div>
                  <div>
                     <h4 className="font-bold text-sm text-slate-800 dark:text-white">Customer & Discovery</h4>
                     <p className="text-[10px] text-slate-400">Sales context and readiness</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EditableField label="Customer Account" value={data.customerName} onChange={(val) => updateData({ customerName: val })} />
                  <EditableField label="Opportunity ID" value={data.opportunityId} onChange={(val) => updateData({ opportunityId: val })} />
               </div>
               
               <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2"><MousePointer2 size={12}/> Discovery Status</label>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                     <StatusToggle label="Tech Disc." checked={data.technicalDiscovery} onChange={(v) => updateData({ technicalDiscovery: v })} icon={Code2} />
                     <StatusToggle label="Biz Disc." checked={data.businessDiscovery} onChange={(v) => updateData({ businessDiscovery: v })} icon={Briefcase} colorClass="bg-blue-500" />
                     <StatusToggle label="Overview" checked={data.platformOverview} onChange={(v) => updateData({ platformOverview: v })} icon={Layout} colorClass="bg-purple-500" />
                     <StatusToggle label="Deep Dive" checked={data.mendixDeepDive} onChange={(v) => updateData({ mendixDeepDive: v })} icon={Layers} colorClass="bg-orange-500" />
                  </div>
               </div>
            </div>
         </div>

         {/* RIGHT COLUMN: Logistics Card */}
         <div className="xl:col-span-1 space-y-6">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg h-full flex flex-col">
               {/* Calendar Header Effect */}
               <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                        <span className="text-[8px] font-bold text-red-500 uppercase tracking-wide">DEC</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-white">12</span>
                     </div>
                     <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white">Logistics</h4>
                        <p className="text-[10px] text-slate-400">Meeting Details</p>
                     </div>
                  </div>
                  <Calendar size={20} className="text-slate-300" />
               </div>

               <div className="p-6 space-y-6 flex-1">
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold uppercase text-slate-400">Date & Start Time</label>
                     <div className="flex gap-2">
                        <input type="date" value={data.meetingDate} onChange={(e) => updateData({ meetingDate: e.target.value })} className="w-2/3 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-brand-primary/20 outline-none" />
                        <input type="time" value={data.meetingTime} onChange={(e) => updateData({ meetingTime: e.target.value })} className="w-1/3 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-brand-primary/20 outline-none" />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Duration (min)</label>
                        <input type="number" value={data.meetingLength} onChange={(e) => updateData({ meetingLength: e.target.value })} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-brand-primary/20 outline-none" />
                     </div>
                     <div className="space-y-1">
                        <SmartDropdown 
                           label="Format" 
                           value={data.meetingType || 'In Person'} 
                           options={['In Person', 'Remote', 'Hybrid']} 
                           onChange={(val) => updateData({ meetingType: val })}
                           className="mb-0"
                        />
                     </div>
                  </div>

                  <EditableField label="Location / Link" value={data.meetingLocation} onChange={(val) => updateData({ meetingLocation: val })} />

                  <div className="space-y-1 pt-2">
                     <label className="text-[10px] font-bold uppercase text-slate-400">Attendees</label>
                     <textarea value={data.attendees} onChange={(e) => updateData({ attendees: e.target.value })} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm h-24 resize-none focus:ring-2 focus:ring-brand-primary/20 outline-none" placeholder="List names..." />
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

// --- STEP 4: REVIEW (Using Modular ReceiptPreview) ---

const StepReview: React.FC<StepProps & { onEditStep: (step: number) => void }> = ({ data, onEditStep }) => {
   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 pb-12">
         <div className="text-center mb-4">
            <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Final Review</h3>
            <p className="text-slate-500 dark:text-slate-400">Please verify the details below before submitting.</p>
         </div>

         {/* The "Ticket" Receipt */}
         <ReceiptPreview data={data} onEditStep={onEditStep} />
      </div>
   );
};

// --- MAIN WIZARD COMPONENT ---

export const NewRequestWizard: React.FC<{ onClose: () => void, onComplete: (data: WizardData) => void }> = ({ onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    requestType: 'Meeting',
    specialties: [],
    focusAreas: [],
    title: '',
    description: '',
    customerName: '',
    opportunityId: '',
    valueProp: '',
    technicalDiscovery: false,
    businessDiscovery: false,
    platformOverview: false,
    mendixDeepDive: false,
    meetingDate: '',
    meetingTime: '',
    meetingLength: '60',
    meetingLocation: '',
    meetingType: 'In Person',
    meetingAgenda: '',
    attendees: ''
  });

  const totalSteps = 4;

  const updateData = (fields: Partial<WizardData>) => {
    setWizardData(prev => ({ ...prev, ...fields }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(prev => prev + 1);
    else onComplete(wizardData);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  // Basic Validation Logic
  const isStepValid = useMemo(() => {
     if (currentStep === 1) return !!wizardData.requestType;
     if (currentStep === 2) return wizardData.specialties.length > 0;
     if (currentStep === 3) return !!wizardData.title;
     return true;
  }, [currentStep, wizardData]);

  const steps = [
    { id: 1, label: 'Type', short: 'Intent' },
    { id: 2, label: 'Expertise', short: 'Scope' },
    { id: 3, label: 'Context', short: 'Details' },
    { id: 4, label: 'Review', short: 'Review' },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[600px] bg-slate-50 dark:bg-black/20">
       
       {/* SIDEBAR STEPPER */}
       <div className="w-full lg:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-8 flex flex-col justify-between shrink-0 z-10">
          <div>
             <div className="mb-10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">New Request</h4>
                <p className="text-sm font-bold text-slate-800 dark:text-white">by Kelly Seale</p>
             </div>
             
             <div className="space-y-0 relative">
                {/* Vertical Line */}
                <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800 -z-0"></div>

                {steps.map((step) => {
                   const isActive = step.id === currentStep;
                   const isCompleted = step.id < currentStep;

                   return (
                      <div key={step.id} className="relative z-10 flex items-center gap-5 py-5 group cursor-default">
                         <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500
                            ${isActive ? 'bg-brand-primary border-brand-primary text-white scale-125 shadow-lg shadow-brand-primary/30 ring-4 ring-brand-primary/10' : 
                              isCompleted ? 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-500' : 
                              'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400'}
                         `}>
                            {isCompleted ? <Check size={14} /> : step.id}
                         </div>
                         <div>
                            <p className={`text-sm font-bold transition-all duration-300 ${isActive ? 'text-brand-primary text-base translate-x-1' : isCompleted ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400 dark:text-slate-600'}`}>
                               {step.label}
                            </p>
                            {isActive && <span className="text-[10px] text-slate-400 animate-in fade-in duration-700 block mt-0.5">In Progress...</span>}
                         </div>
                      </div>
                   )
                })}
             </div>
          </div>
          
          {/* Helper Text */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 text-xs text-slate-500 leading-relaxed">
             <strong className="block text-slate-700 dark:text-slate-300 mb-1">Need Help?</strong>
             If you're unsure which specialty to pick, select "General SME" in Step 1 and we'll route it for you.
          </div>
       </div>

       {/* MAIN CONTENT AREA */}
       <div className="flex-1 flex flex-col min-w-0">
          
          {/* Header (Mobile Only) */}
          <div className="lg:hidden p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
             <span className="font-bold text-slate-800 dark:text-white">Step {currentStep}: {steps[currentStep-1].short}</span>
             <button onClick={onClose} className="text-slate-400"><Layout size={20}/></button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-12 relative custom-scrollbar">
             <div className="max-w-6xl mx-auto h-full pb-20">
                {currentStep === 1 && <StepType data={wizardData} updateData={updateData} />}
                {currentStep === 2 && <StepExpertise data={wizardData} updateData={updateData} />}
                {currentStep === 3 && <StepDetails data={wizardData} updateData={updateData} />}
                {currentStep === 4 && <StepReview data={wizardData} updateData={updateData} onEditStep={setCurrentStep} />}
             </div>
          </div>

          {/* Footer Actions (Sticky) */}
          <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center z-50 sticky bottom-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
             <button 
                onClick={currentStep === 1 ? onClose : handleBack}
                className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
             >
                {currentStep === 1 ? 'Cancel' : <><ChevronLeft size={16} /> Back</>}
             </button>

             <div className="flex items-center gap-4">
                {!isStepValid && <span className="text-xs text-red-500 font-bold animate-pulse hidden md:inline">Please complete required fields *</span>}
                <FancyButton 
                    onClick={handleNext} 
                    variant="primary" 
                    size="lg"
                    disabled={!isStepValid}
                    className={`shadow-xl shadow-brand-primary/20 transition-all ${!isStepValid ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:scale-105'}`}
                >
                    {currentStep === totalSteps ? 'Submit Request' : <>Continue <ArrowRight size={16} /></>}
                </FancyButton>
             </div>
          </div>
       </div>
    </div>
  );
};
