import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FancyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  icon?: LucideIcon;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const FancyButton: React.FC<FancyButtonProps> = ({ 
  children, 
  variant = 'primary', 
  icon: Icon, 
  fullWidth = false, 
  size = 'md',
  className = '',
  ...props 
}) => {
  
  const baseStyles = "rounded-lg font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.98]";
  
  const variants = {
    primary: "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-md hover:shadow-lg hover:opacity-90",
    secondary: "bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700 dark:hover:bg-slate-600",
    outline: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-secondary hover:text-brand-secondary",
    ghost: "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-xs",
    lg: "px-6 py-3 text-sm"
  };

  return (
    <button 
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon size={size === 'lg' ? 18 : 14} />}
      {children}
    </button>
  );
};
