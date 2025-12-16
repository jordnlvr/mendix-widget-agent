import React from 'react';

interface RatingInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  minLabel?: string;
  midLabel?: string;
  maxLabel?: string;
}

export const RatingInput: React.FC<RatingInputProps> = ({ 
  label, 
  value, 
  onChange, 
  min = 1, 
  max = 10,
  minLabel = "Very Low",
  midLabel = "Moderate",
  maxLabel = "Extreme"
}) => {
  const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div>
       <div className="flex justify-between items-end mb-2">
         <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
         <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">{value}/{max}</span>
       </div>
       <div className="flex gap-1">
         {range.map((num) => (
            <button
              key={num}
              onClick={() => onChange(num)}
              className={`flex-1 h-9 rounded-md text-xs font-bold transition-all border ${
                 value === num 
                 ? 'bg-brand-primary text-white border-brand-primary shadow-md transform scale-105 z-10' 
                 : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-brand-primary/50 hover:text-brand-primary'
              }`}
            >
              {num}
            </button>
         ))}
       </div>
       <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 px-1">
          <span>{minLabel}</span>
          <span>{midLabel}</span>
          <span>{maxLabel}</span>
       </div>
    </div>
  );
};
