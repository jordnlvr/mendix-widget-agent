import React, { useState } from 'react';
import { Settings, Database, Box, Briefcase, CheckCircle2, AlertTriangle, Shield, Key, Server, FileSpreadsheet, Plus, Upload, Play, Edit, Trash2 } from 'lucide-react';
import { ActionModal } from './ActionModal';
import { SegmentedTabs, TabItem } from './widgets/SegmentedTabs';

interface AdministrationViewProps {
  initialTab?: string;
}

const SIDEBAR_ITEMS = [
  { id: 'general', label: 'Application Settings', icon: Settings, description: 'Deployment & Environment' },
  { id: 'modules', label: 'Module Settings', icon: Box, description: 'Feature Toggles & Config' },
  { id: 'business', label: 'RequestHub Settings', icon: Briefcase, description: 'Workflow Rules' },
  { id: 'data', label: 'Data Management', icon: Database, description: 'Imports & Backups' },
];

const DATA_TEMPLATES = [
  { id: 1, nr: 3, title: 'Import RequestHub Areas', description: 'Import the Area options for the RequestHub', status: 'active', lastRun: '2 days ago' },
  { id: 2, nr: 5, title: 'Import RequestHub Focus Items', description: 'Importing RequestHub Focus Items (like products)', status: 'active', lastRun: '5 days ago' },
  { id: 3, nr: 4, title: 'Import RequestHub Specialties', description: 'Import the specialty list for RequestHub along with the Area.', status: 'active', lastRun: '1 week ago' },
  { id: 4, nr: 2, title: 'Import RequestTypes', description: 'List of RequestTypes with order and description', status: 'active', lastRun: '1 week ago' },
  { id: 5, nr: 1, title: 'Import Siemens Accounts', description: 'Using exported xlsx file from Siemens Salesforce report', status: 'warning', lastRun: '1 month ago' },
];

const DEPLOYMENT_STEPS = [
  { 
    id: 1, 
    title: 'Reference Data Load', 
    desc: 'Runs AfterStartup microflow to load RequestTypes, Area, Specialty, and Focus Types.',
    status: 'complete',
    icon: Server
  },
  { 
    id: 2, 
    title: 'Encryption Configuration', 
    desc: 'Ensure the 32-character Encryption Key is set before Model Reflection runs.',
    status: 'pending',
    icon: Key
  },
  { 
    id: 3, 
    title: 'SSO Configuration', 
    desc: 'This app is 100% Siemens-based SSO. Mendix SSO fallback is available for local admins.',
    status: 'complete',
    icon: Shield
  },
  { 
    id: 4, 
    title: 'Admin Account Setup', 
    desc: 'Update demo accounts (MxAdmin) to real email addresses immediately.',
    status: 'warning',
    icon: Settings
  }
];

export const AdministrationView: React.FC<AdministrationViewProps> = ({ initialTab = 'general' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return <DeploymentChecklist />;
      case 'data':
        return <DataManagementConsole />;
      default:
        return <PlaceholderContent title={SIDEBAR_ITEMS.find(i => i.id === activeTab)?.label || 'Settings'} />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden animate-in fade-in duration-500">
      {/* Internal Sidebar */}
      <div className="w-full lg:w-72 bg-app-surface border-r border-slate-200 dark:border-slate-800 flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/50">
          <h2 className="font-display font-bold text-lg text-slate-800 dark:text-white">Administration</h2>
          <p className="text-xs text-slate-500 mt-1">System Configuration Console</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/25' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700'}`}>
                   <Icon size={18} />
                </div>
                <div>
                  <span className={`block text-sm font-bold ${isActive ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                    {item.label}
                  </span>
                  <span className={`block text-[10px] ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                    {item.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        
        {/* System Health Widget (Mock) */}
        <div className="p-4 m-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
           <h4 className="text-xs font-bold uppercase text-slate-400 mb-3">System Health</h4>
           <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-600 dark:text-slate-300">Database</span>
                 <span className="flex items-center gap-1.5 text-emerald-500 font-bold text-xs"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Connected</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-600 dark:text-slate-300">Last Backup</span>
                 <span className="text-slate-500 text-xs">2h ago</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-600 dark:text-slate-300">Mendix Ver.</span>
                 <span className="text-slate-500 text-xs font-mono">10.6.2</span>
              </div>
           </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-black/20 p-6 lg:p-10">
        {renderContent()}
      </div>
    </div>
  );
};

// --- SUB-VIEWS ---

const DeploymentChecklist = () => {
  return (
    <div className="max-w-4xl space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div>
        <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-2">Application Configuration</h3>
        <p className="text-slate-500 dark:text-slate-400">Essential steps for deploying to a new environment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
         <div className="bg-gradient-to-br from-brand-primary to-brand-secondary p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <div className="text-sm font-bold opacity-80 mb-1">Deployment Status</div>
              <div className="text-3xl font-display font-bold mb-4">Ready</div>
              <div className="w-full bg-black/20 rounded-full h-1.5 mb-2">
                 <div className="bg-white w-[75%] h-full rounded-full"></div>
              </div>
              <div className="text-xs font-bold opacity-70">3 of 4 Critical Checks Passed</div>
            </div>
            <Server className="absolute -bottom-4 -right-4 opacity-20" size={120} />
         </div>
         
         <div className="bg-app-surface border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex items-center gap-4">
             <div className="p-4 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full">
                <AlertTriangle size={32} />
             </div>
             <div>
                <h4 className="font-bold text-slate-800 dark:text-white text-lg">Action Needed</h4>
                <p className="text-sm text-slate-500 mb-2">Encryption key validation is pending.</p>
                <button className="text-xs font-bold text-amber-600 hover:underline">View Security Settings</button>
             </div>
         </div>
      </div>

      <div className="space-y-4">
        {DEPLOYMENT_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isComplete = step.status === 'complete';
          const isWarning = step.status === 'warning';

          return (
            <div key={step.id} className="group bg-app-surface border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex gap-6 items-start">
               <div className="flex-shrink-0 mt-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                     isComplete ? 'bg-emerald-50 border-emerald-500 text-emerald-600' :
                     isWarning ? 'bg-amber-50 border-amber-500 text-amber-600' :
                     'bg-slate-50 border-slate-300 text-slate-400'
                  }`}>
                    {isComplete ? <CheckCircle2 size={20} /> : <span className="font-bold">{index + 1}</span>}
                  </div>
               </div>
               
               <div className="flex-1">
                  <div className="flex justify-between items-start">
                     <h4 className={`font-bold text-lg mb-1 ${isComplete ? 'text-slate-800 dark:text-white' : 'text-slate-600'}`}>{step.title}</h4>
                     <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                        isComplete ? 'bg-emerald-100 text-emerald-700' :
                        isWarning ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                     }`}>
                        {step.status}
                     </span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">{step.desc}</p>
                  
                  {/* Step Actions */}
                  <div className="flex gap-2">
                     <button className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                        Configure
                     </button>
                     <button className="px-3 py-1.5 text-xs font-bold text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors">
                        Read Documentation
                     </button>
                  </div>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DataManagementConsole = () => {
  const [isNewTemplateOpen, setIsNewTemplateOpen] = useState(false);
  const [activeDataTab, setActiveDataTab] = useState('Excel Importer');

  const tabs: TabItem[] = [
      { id: 'Excel Importer', label: 'Excel Importer' },
      { id: 'Siemens Accounts', label: 'Siemens Accounts' },
      { id: 'Siemens PL Types', label: 'Siemens PL Types' },
      { id: 'RequestTypes', label: 'RequestTypes' },
      { id: 'RH Areas', label: 'RH Areas' }
  ];

  return (
    <div className="max-w-6xl space-y-6 animate-in slide-in-from-bottom-4 duration-500">
       
       <ActionModal 
          isOpen={isNewTemplateOpen}
          onClose={() => setIsNewTemplateOpen(false)}
          title="Create New Import Template"
          onSave={() => setIsNewTemplateOpen(false)}
          maxWidth="max-w-lg"
       >
          <div className="space-y-4">
             <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Template Name</label>
                <input type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium" placeholder="e.g. Employee Data Import" />
             </div>
             <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Target Entity</label>
                <select className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium">
                   <option>Select entity...</option>
                   <option>RequestHub.Request</option>
                   <option>System.User</option>
                   <option>Reference.Specialty</option>
                </select>
             </div>
             <div className="p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <Upload className="mx-auto mb-2 text-slate-400" size={24} />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Upload Example Excel File</span>
                <p className="text-xs text-slate-400 mt-1">To automatically map columns</p>
             </div>
          </div>
       </ActionModal>

       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-2">Data Management</h3>
            <p className="text-slate-500 dark:text-slate-400">Manage templates and file import jobs.</p>
          </div>
          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors">
                <FileSpreadsheet size={16} /> Import from Excel
             </button>
             <button 
                onClick={() => setIsNewTemplateOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-bold shadow-md hover:bg-brand-primary/90 transition-colors"
             >
                <Plus size={16} /> New Template
             </button>
          </div>
       </div>

       {/* Widgetized Tabs */}
       <SegmentedTabs 
          items={tabs} 
          activeId={activeDataTab} 
          onChange={setActiveDataTab}
          className="mb-2" 
       />

       {/* Templates Grid/List */}
       <div className="bg-app-surface border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
             <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">Active Templates ({DATA_TEMPLATES.length})</h4>
             <button className="text-xs font-bold text-brand-primary hover:underline">View Archived</button>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
             {DATA_TEMPLATES.map((template) => (
                <div key={template.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group flex items-center gap-4">
                   
                   {/* Status Icon */}
                   <div className="flex-shrink-0">
                      {template.status === 'active' ? (
                         <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                            <CheckCircle2 size={16} />
                         </div>
                      ) : (
                         <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                            <AlertTriangle size={16} />
                         </div>
                      )}
                   </div>

                   {/* Content */}
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 rounded">#{template.nr}</span>
                         <h5 className="font-bold text-slate-800 dark:text-white truncate">{template.title}</h5>
                      </div>
                      <p className="text-sm text-slate-500 truncate">{template.description}</p>
                   </div>

                   {/* Metadata */}
                   <div className="hidden md:block text-right">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Last Run</span>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{template.lastRun}</span>
                   </div>

                   {/* Actions */}
                   <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors" title="Execute Import">
                         <Play size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Edit Template">
                         <Edit size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete">
                         <Trash2 size={16} />
                      </button>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};

const PlaceholderContent = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-12 opacity-50">
     <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
        <Settings size={32} />
     </div>
     <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
     <p className="text-slate-500 max-w-sm">This configuration module is currently under development. Check back later for updates.</p>
  </div>
);
