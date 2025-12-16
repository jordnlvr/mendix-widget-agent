import React, { useId } from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  // Configuration props
  tagline?: string;
  showTagline?: boolean;
  weightOne?: string;
  weightSource?: string;
  primaryColor?: string;
  secondaryColor?: string;
  gap?: string;
  font?: string;
}

export const OneSourceLogo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 48, 
  showText = true,
  tagline = "Solutions Portal",
  showTagline = true,
  weightOne = "font-bold", 
  weightSource = "font-extrabold",
  primaryColor, 
  secondaryColor,
  gap = "gap-1",
  font = "manrope"
}) => {
  const gradientIdMain = useId();
  const gradientIdNode1 = useId();
  const gradientIdNode2 = useId();

  const getFontClass = () => {
    switch(font) {
      case 'inter': return 'font-sans';
      case 'tech': return 'font-tech'; // Space Grotesk
      case 'modern': return 'font-modern'; // Outfit
      default: return 'font-display'; // Manrope
    }
  };

  return (
    <div className={`flex items-center ${gap} ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 512 512" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-500 hover:rotate-90 hover:scale-105 flex-shrink-0"
      >
        <defs>
          <linearGradient id={gradientIdMain} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" className="stop-brand-primary" stopColor={primaryColor || 'rgb(var(--color-primary))'} />
            <stop offset="100%" className="stop-brand-secondary" stopColor={secondaryColor || 'rgb(var(--color-secondary))'} />
          </linearGradient>
          <linearGradient id={gradientIdNode1} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#6366F1' }} />
            <stop offset="100%" className="stop-brand-primary" stopColor={primaryColor || 'rgb(var(--color-primary))'} />
          </linearGradient>
          <linearGradient id={gradientIdNode2} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#22D3EE' }} />
            <stop offset="100%" className="stop-brand-secondary" stopColor={secondaryColor || 'rgb(var(--color-secondary))'} />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="15" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g transform="translate(96, 96)">
          <g className="opacity-80">
            <line x1="160" y1="60" x2="160" y2="108" stroke={`url(#${gradientIdMain})`} strokeWidth="12" strokeLinecap="round"/>
            <line x1="248" y1="96" x2="200" y2="128" stroke={`url(#${gradientIdMain})`} strokeWidth="12" strokeLinecap="round"/>
            <line x1="268" y1="184" x2="208" y2="168" stroke={`url(#${gradientIdMain})`} strokeWidth="12" strokeLinecap="round"/>
            <line x1="224" y1="264" x2="192" y2="200" stroke={`url(#${gradientIdMain})`} strokeWidth="12" strokeLinecap="round"/>
            <line x1="96" y1="264" x2="128" y2="200" stroke={`url(#${gradientIdMain})`} strokeWidth="12" strokeLinecap="round"/>
            <line x1="52" y1="184" x2="112" y2="168" stroke={`url(#${gradientIdMain})`} strokeWidth="12" strokeLinecap="round"/>
            <line x1="72" y1="96" x2="120" y2="128" stroke={`url(#${gradientIdMain})`} strokeWidth="12" strokeLinecap="round"/>
          </g>

          <circle cx="160" cy="32" r="28" fill={`url(#${gradientIdNode1})`} className="animate-pulse" style={{ animationDuration: '3s' }}/>
          <circle cx="272" cy="80" r="28" fill={`url(#${gradientIdNode2})`} className="animate-pulse" style={{ animationDuration: '4s' }}/>
          <circle cx="296" cy="192" r="28" fill={`url(#${gradientIdNode1})`} className="animate-pulse" style={{ animationDuration: '3.5s' }}/>
          <circle cx="240" cy="288" r="28" fill={`url(#${gradientIdNode2})`} className="animate-pulse" style={{ animationDuration: '4.5s' }}/>
          <circle cx="80" cy="288" r="28" fill={`url(#${gradientIdNode1})`} className="animate-pulse" style={{ animationDuration: '3.2s' }}/>
          <circle cx="24" cy="192" r="28" fill={`url(#${gradientIdNode2})`} className="animate-pulse" style={{ animationDuration: '3.8s' }}/>
          <circle cx="48" cy="80" r="28" fill={`url(#${gradientIdNode1})`} className="animate-pulse" style={{ animationDuration: '4.2s' }}/>

          <circle cx="160" cy="160" r="56" fill={`url(#${gradientIdMain})`} filter="url(#glow)" />
          <circle cx="160" cy="160" r="24" className="fill-white dark:fill-slate-900 transition-colors duration-300" />
        </g>
      </svg>
      
      {showText && (
        <div className={`flex flex-col justify-center ${!showTagline && 'h-full justify-center'}`}>
          <h1 className={`${getFontClass()} tracking-tight leading-none text-slate-800 dark:text-white ${!showTagline ? 'text-3xl' : 'text-2xl'}`}>
            <span className={weightOne}>One</span>
            <span className={`${weightSource} text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary`}>Source</span>
          </h1>
          {showTagline && (
            <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 dark:text-slate-500 mt-0.5">
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
};