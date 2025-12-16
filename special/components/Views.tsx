import React from 'react';
import { DollarSign, Layers, ArrowUpRight, Cloud, Server, AlertCircle } from 'lucide-react';
import { DonutChart } from './widgets/DonutChart';
import { StepWizard } from './widgets/StepWizard';

// --- VIEW: COST COMPARE ---
export const CostCompareView = () => {
   return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
         <div className="flex justify-between items-end">
            <div>
               <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">TCO Analysis</h2>
               <p className="text-slate-500 dark:text-slate-400">Total Cost of Ownership Comparison (3 Year Projection)</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
               <ArrowUpRight size={16} /> Export Report
            </button>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Visual Card */}
            <div className="lg:col-span-2 bg-app-surface border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
               <div className="flex flex-col md:flex-row items-center gap-12">
                  <div className="flex-shrink-0">
                     <DonutChart 
                        value="$1.2M" 
                        label="Total Savings"
                        segments={[
                           { color: '#6366F1', percentage: 55 },
                           { color: '#06B6D4', percentage: 30 },
                           { color: '#e2e8f0', percentage: 15 }
                        ]}
                     />
                  </div>
                  <div className="flex-1 w-full space-y-6">
                     <div className="space-y-2">
                        <div className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-200">
                           <span>Legacy Development</span>
                           <span>$4.2M</span>
                        </div>
                        <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-slate-400 w-full rounded-full"></div>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <div className="flex justify-between text-sm font-bold text-brand-primary">
                           <span className="flex items-center gap-2"><SparklesIcon size={14}/> Mendix Solution</span>
                           <span>$2.4M</span>
                        </div>
                        <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary w-[55%] rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                           <span className="block text-xs text-slate-400 uppercase font-bold">Dev Time</span>
                           <span className="text-lg font-bold text-slate-800 dark:text-white">-60%</span>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                           <span className="block text-xs text-slate-400 uppercase font-bold">Maintainability</span>
                           <span className="text-lg font-bold text-slate-800 dark:text-white">+40%</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Breakdown List */}
            <div className="bg-app-surface border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
               <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <DollarSign size={18} className="text-brand-secondary" /> Cost Drivers
               </h3>
               <div className="space-y-3">
                  {[
                     { label: 'Infrastructure', val: '$400k', color: 'bg-blue-500' },
                     { label: 'Developer FTEs', val: '$1.2M', color: 'bg-indigo-500' },
                     { label: 'Licensing', val: '$600k', color: 'bg-cyan-500' },
                     { label: 'Maintenance', val: '$200k', color: 'bg-emerald-500' },
                  ].map((item, i) => (
                     <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                           <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                           <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.label}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-brand-primary">{item.val}</span>
                     </div>
                  ))}
               </div>
               
               <div className="mt-6 p-4 bg-brand-primary/10 rounded-xl border border-brand-primary/20">
                  <p className="text-xs text-brand-primary font-medium leading-relaxed">
                     <strong className="block mb-1 flex items-center gap-1"><AlertCircle size={12}/> AI Insight</strong>
                     Switching to Mendix for the "Customer Portal" project is projected to break even within 8 months based on current velocity.
                  </p>
               </div>
            </div>
         </div>
      </div>
   );
};

// --- VIEW: APP SIZER ---
export const AppSizerView = () => {
   
   const wizardSteps = [
      {
         id: 1,
         title: "Basic Info",
         description: "Initial application metadata",
         content: <div>Basic Info Form Placeholder</div>
      },
      {
         id: 2,
         title: "Complexity Analysis",
         description: "Define the technical requirements to estimate T-Shirt size.",
         content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <button className="p-4 rounded-lg border-2 border-brand-primary bg-brand-primary/5 text-left transition-all">
                    <span className="block text-sm font-bold text-brand-primary mb-1">High Integration</span>
                    <span className="text-xs text-slate-600 dark:text-slate-300">5+ External Systems (SAP, Salesforce)</span>
                 </button>
                 <button className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800 text-left transition-all opacity-60">
                    <span className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Low Integration</span>
                    <span className="text-xs text-slate-500">Standalone or Single API</span>
                 </button>
              </div>
              
              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">User Base Estimate</label>
                 <input type="range" className="w-full accent-brand-primary h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700" />
                 <div className="flex justify-between text-xs text-slate-400 mt-2 font-mono">
                    <span>100</span>
                    <span>1,000</span>
                    <span>10,000+</span>
                 </div>
              </div>
           </div>
         )
      },
      { id: 3, title: "Resource Plan", description: "Team allocation", content: <div>Resource Plan Placeholder</div> },
      { id: 4, title: "Review", description: "Finalize sizing", content: <div>Review Placeholder</div> }
   ];

   return (
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Application Sizer</h2>
            <p className="text-slate-500 dark:text-slate-400">Estimate project complexity and required resources.</p>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2 bg-app-surface border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-8">
               <StepWizard steps={wizardSteps} />
            </div>

            {/* Helper Card */}
            <div className="space-y-6">
               <div className="bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl p-6 text-white shadow-lg">
                  <Layers size={32} className="mb-4 opacity-80" />
                  <h3 className="font-bold text-lg mb-2">T-Shirt Sizing</h3>
                  <p className="text-sm opacity-90 leading-relaxed mb-4">
                     Based on your inputs, this app is currently trending towards a <strong className="text-white border-b-2 border-white/50">Medium</strong> size project.
                  </p>
                  <div className="flex gap-2">
                     <span className="px-2 py-1 bg-white/20 rounded text-xs font-bold">2 Devs</span>
                     <span className="px-2 py-1 bg-white/20 rounded text-xs font-bold">6 Weeks</span>
                  </div>
               </div>

               <div className="bg-app-surface border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                  <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200 mb-4">Reference Apps</h4>
                  <ul className="space-y-3">
                     <li className="flex items-center gap-3 text-sm text-slate-500">
                        <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-400"><Cloud size={14}/></div>
                        Field Service Portal
                     </li>
                     <li className="flex items-center gap-3 text-sm text-slate-500">
                        <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-400"><Server size={14}/></div>
                        Inventory Tracker
                     </li>
                  </ul>
               </div>
            </div>
         </div>
      </div>
   );
};

const SparklesIcon = ({size}: {size:number}) => (
   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
);
