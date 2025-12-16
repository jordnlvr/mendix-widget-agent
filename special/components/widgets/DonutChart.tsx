import React from 'react';

interface DonutChartProps {
  value: string;
  label: string;
  segments: { color: string; percentage: number }[];
  size?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({ value, label, segments, size = 192 }) => { // 192px = w-48
  
  // Construct the conic gradient string dynamically
  let gradientString = '';
  let currentPercentage = 0;
  
  segments.forEach((seg, index) => {
    const start = currentPercentage;
    const end = currentPercentage + seg.percentage;
    gradientString += `${seg.color} ${start}% ${end}%${index < segments.length - 1 ? ', ' : ''}`;
    currentPercentage = end;
  });

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
       {/* Chart Ring */}
       <div 
         className="absolute inset-0 rounded-full"
         style={{
            background: `conic-gradient(${gradientString})`
         }}
       ></div>
       {/* Inner Cutout */}
       <div className="absolute inset-4 bg-app-surface rounded-full flex flex-col items-center justify-center z-10">
          <span className="text-3xl font-display font-bold text-slate-800 dark:text-white">{value}</span>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{label}</span>
       </div>
    </div>
  );
};
