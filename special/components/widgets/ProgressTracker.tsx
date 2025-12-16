
import React from 'react';
import { Check } from 'lucide-react';

// Configuration for the tracker slots
export interface TrackerSlot {
  id: string;
  defaultLabel: string;
  mappedStatuses: string[];
  defaultColor: string;
  defaultBorder: string;
  defaultText: string;
}

export const TRACKER_SLOTS: TrackerSlot[] = [
  { 
    id: 'slot_1',
    defaultLabel: 'New', 
    mappedStatuses: ['New'],
    defaultColor: 'bg-blue-500',
    defaultBorder: 'border-blue-500',
    defaultText: 'text-blue-600'
  },
  { 
    id: 'slot_2',
    defaultLabel: 'Assigned', 
    mappedStatuses: ['Assigned'],
    defaultColor: 'bg-purple-500', 
    defaultBorder: 'border-purple-500',
    defaultText: 'text-purple-600'
  },
  { 
    id: 'slot_3',
    defaultLabel: 'In Progress', 
    mappedStatuses: ['In Progress', 'On Hold'], 
    defaultColor: 'bg-brand-primary',
    defaultBorder: 'border-brand-primary',
    defaultText: 'text-brand-primary'
  },
  { 
    id: 'slot_4',
    defaultLabel: 'Closed', 
    mappedStatuses: ['Closed', 'Cancelled'],
    defaultColor: 'bg-emerald-500',
    defaultBorder: 'border-emerald-500',
    defaultText: 'text-emerald-600'
  }
];

// Exact color mappings
export const STATUS_COLORS: Record<string, { bg: string, border: string, text: string, ring: string }> = {
  'New':         { bg: 'bg-blue-500',      border: 'border-blue-500',      text: 'text-blue-600',      ring: 'ring-blue-500' },
  'Assigned':    { bg: 'bg-purple-500',    border: 'border-purple-500',    text: 'text-purple-600',    ring: 'ring-purple-500' },
  'In Progress': { bg: 'bg-indigo-500',    border: 'border-indigo-500',    text: 'text-indigo-600',    ring: 'ring-indigo-500' },
  'On Hold':     { bg: 'bg-amber-500',     border: 'border-amber-500',     text: 'text-amber-600',     ring: 'ring-amber-500' },
  'Closed':      { bg: 'bg-emerald-500',   border: 'border-emerald-500',   text: 'text-emerald-600',   ring: 'ring-emerald-500' },
  'Cancelled':   { bg: 'bg-slate-500',     border: 'border-slate-500',     text: 'text-slate-600',     ring: 'ring-slate-500' }
};

interface ProgressTrackerProps {
  currentStatus: string;
  className?: string;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ currentStatus, className = '' }) => {
  const currentSlotIndex = TRACKER_SLOTS.findIndex(slot => slot.mappedStatuses.includes(currentStatus));
  const activeSlotIndex = currentSlotIndex === -1 ? 0 : currentSlotIndex;
  const currentStatusColor = STATUS_COLORS[currentStatus]?.bg || 'bg-brand-primary';

  return (
    <div className={`relative z-10 mx-auto max-w-3xl px-4 ${className}`}>
        <div className="relative flex justify-between items-center">
            {/* The Line */}
            <div className="absolute left-0 right-0 top-4 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden -z-10">
                <div 
                    className={`h-full transition-all duration-700 ease-out rounded-full ${currentStatusColor}`}
                    style={{ width: `${(activeSlotIndex / (TRACKER_SLOTS.length - 1)) * 100}%` }}
                ></div>
            </div>

            {TRACKER_SLOTS.map((slot, idx) => {
                const isCompleted = idx <= activeSlotIndex;
                const isCurrentSlot = idx === activeSlotIndex;
                
                let label = slot.defaultLabel;
                let slotColors = { 
                    bg: slot.defaultColor, 
                    border: slot.defaultBorder, 
                    text: slot.defaultText,
                    ring: slot.defaultBorder.replace('border-', 'ring-')
                };

                if (isCurrentSlot) {
                    label = currentStatus;
                    if (STATUS_COLORS[currentStatus]) {
                        slotColors = STATUS_COLORS[currentStatus];
                    }
                }

                return (
                    <div key={idx} className="flex flex-col items-center gap-3 relative group cursor-default">
                        {/* Circle */}
                        <div 
                            className={`
                                w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10
                                ${isCompleted 
                                ? `${slotColors.bg} ${slotColors.border} text-white shadow-lg scale-110` 
                                : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-transparent'}
                                ${isCurrentSlot ? `ring-4 ${slotColors.ring}/20` : ''}
                            `}
                        >
                            {isCompleted && <Check size={14} strokeWidth={3} />}
                            {!isCompleted && <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"></div>}
                        </div>

                        {/* Label */}
                        <span 
                            className={`
                                text-[10px] font-bold uppercase tracking-wider transition-colors duration-300
                                ${isCurrentSlot ? slotColors.text : isCompleted ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400 dark:text-slate-600'}
                            `}
                        >
                            {label}
                        </span>
                    </div>
                )
            })}
        </div>
    </div>
  );
};
