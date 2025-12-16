import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
  content: React.ReactNode;
}

interface StepWizardProps {
  steps: Step[];
  onComplete?: () => void;
}

export const StepWizard: React.FC<StepWizardProps> = ({ steps, onComplete }) => {
   const [currentStep, setCurrentStep] = useState(1);
   
   const handleNext = () => {
      if (currentStep < steps.length) {
         setCurrentStep(prev => prev + 1);
      } else if (onComplete) {
         onComplete();
      }
   };

   const activeStepContent = steps.find(s => s.id === currentStep)?.content;

   return (
     <div className="w-full">
        {/* Steps Header */}
        <div className="flex items-center justify-between mb-8 relative">
           <div className="absolute left-0 top-1/2 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -z-0"></div>
           {steps.map((step) => (
              <div 
                key={step.id} 
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step.id <= currentStep 
                  ? 'bg-brand-primary text-white scale-110 shadow-lg shadow-brand-primary/30' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                 {step.id < currentStep ? <Check size={14} /> : step.id}
              </div>
           ))}
        </div>
        
        {/* Step Content */}
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-6 min-h-[250px]">
           <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Step {currentStep}: {steps[currentStep-1].title}</h3>
           <p className="text-sm text-slate-500 mb-6">{steps[currentStep-1].description}</p>
           
           <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              {activeStepContent}
           </div>
        </div>

        <div className="flex justify-between">
           <button 
             onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} 
             disabled={currentStep === 1}
             className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50"
           >
             Back
           </button>
           <button 
             onClick={handleNext} 
             className="px-6 py-2 bg-brand-primary text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all"
           >
             {currentStep === steps.length ? 'Finish' : 'Next Step'}
           </button>
        </div>
     </div>
   );
};
