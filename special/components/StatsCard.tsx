import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  colorClass?: string;
  index?: number; // Added to vary the sparkline
}

export const StatsCard: React.FC<StatsCardProps> = ({ label, value, subtext, icon: Icon, colorClass = 'bg-brand-primary', index = 0 }) => {
  
  // Simple SVG paths to simulate trend lines
  const sparklines = [
    "M0 25 Q 10 20, 20 22 T 40 15 T 60 20 T 80 5 T 100 10",
    "M0 20 Q 15 25, 30 15 T 60 10 T 100 25",
    "M0 10 L 10 15 L 20 10 L 30 20 L 40 10 L 100 5",
    "M0 25 C 20 25, 20 10, 40 10 S 60 20, 80 20 S 100 5, 100 5"
  ];

  const path = sparklines[index % sparklines.length];

  return (
    <div className="
      group relative overflow-hidden
      bg-app-surface
      rounded-app p-6 
      border border-slate-100 dark:border-slate-800/60
      shadow-sm hover:shadow-xl hover:shadow-slate-200 dark:hover:shadow-black/20
      transition-all duration-300 transform hover:-translate-y-1
    ">
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{label}</p>
          <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{value}</h3>
          {subtext && (
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{subtext}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10 dark:bg-opacity-20 text-white shadow-inner`}>
             <Icon 
               size={24} 
               className={colorClass === 'bg-brand-primary' ? 'text-brand-primary' : `text-${colorClass.replace('bg-', '')}`} 
             />
          </div>
        )}
      </div>
      
      {/* Decorative gradient blob */}
      <div className={`
        absolute -bottom-4 -right-4 w-32 h-32 
        ${colorClass} opacity-5 rounded-full blur-3xl 
        group-hover:scale-150 transition-transform duration-700
      `}></div>

      {/* Sparkline Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-12 opacity-10 dark:opacity-20 pointer-events-none overflow-hidden">
        <svg viewBox="0 0 100 30" preserveAspectRatio="none" className={`w-full h-full ${colorClass.replace('bg-', 'fill-none stroke-')}`} style={{ strokeWidth: 2 }}>
           <path d={path} vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </div>
  );
};