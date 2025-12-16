import React, { useState, useRef, useEffect } from 'react';
import { NavItem, AppConfig } from '../types';
import { OneSourceLogo } from './Logo';
import { ChevronRight, Settings, LogOut, ChevronUp } from 'lucide-react';

interface SidebarProps {
  items: NavItem[];
  activeId: string;
  onNavigate: (id: string) => void;
  collapsed?: boolean;
  config: AppConfig;
  primaryColor?: string;
  secondaryColor?: string;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, activeId, onNavigate, collapsed = false, config, primaryColor, secondaryColor, onLogout }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <aside className={`
      sticky top-0 z-20 h-screen transition-all duration-300 ease-in-out
      ${collapsed ? 'w-20' : 'w-72'}
      bg-app-surface/80 backdrop-blur-md
      border-r border-slate-200 dark:border-slate-800/60
      flex flex-col shadow-xl shadow-slate-200/50 dark:shadow-none
    `}>
      {/* Brand Header */}
      <div className={`
        flex items-center h-20 px-6 border-b border-slate-100 dark:border-slate-800/50
        ${collapsed ? 'justify-center' : 'justify-start'}
      `}>
        <OneSourceLogo 
          size={collapsed ? 40 : 42} 
          showText={!collapsed}
          tagline={config.logo.tagline}
          showTagline={config.logo.showTagline}
          weightOne={config.logo.weightOne}
          weightSource={config.logo.weightSource}
          gap={config.logo.gap}
          font={config.logo.font}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {items.map((item) => {
          const isActive = activeId === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                group flex items-center w-full px-3 py-3 rounded-app transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 text-brand-primary shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                }
              `}
            >
              <div className={`
                p-2 rounded-lg transition-colors
                ${isActive ? 'bg-app-surface shadow-sm' : 'bg-transparent'}
              `}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              
              {!collapsed && (
                <>
                  <span className="ml-3 font-medium text-sm tracking-wide">{item.label}</span>
                  {isActive && <ChevronRight size={16} className="ml-auto opacity-50" />}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile Snippet */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/50" ref={menuRef}>
        
        {/* Profile Menu Popup */}
        {showProfileMenu && !collapsed && (
          <div className="absolute bottom-20 left-4 right-4 bg-app-surface rounded-app shadow-xl border border-slate-100 dark:border-slate-700 p-2 animate-in slide-in-from-bottom-2 fade-in duration-200 z-50">
             <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-app hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 transition-colors text-sm font-medium">
               <Settings size={18} className="text-slate-400" />
               Change Settings
             </button>
             <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-app hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors text-sm font-medium"
             >
               <LogOut size={18} />
               Log Out
             </button>
          </div>
        )}

        <button 
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className={`
          w-full flex items-center rounded-app p-2.5 transition-all
          bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50
          hover:border-brand-primary/30 dark:hover:border-brand-primary/30 hover:bg-app-surface
          ${showProfileMenu ? 'ring-2 ring-brand-primary/20 border-brand-primary/40' : ''}
        `}>
          
          {config.sidebar.profileStyle === 'image' ? (
            <img 
              src="https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=200&h=200&fit=crop&crop=faces" 
              alt="User" 
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-white dark:ring-slate-700"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white dark:ring-slate-700">
              KS
            </div>
          )}

          {!collapsed && (
            <div className="ml-3 flex flex-col items-start overflow-hidden flex-1">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">Kelly Seale</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">Pre-Sales Lead</span>
            </div>
          )}
          
          {!collapsed && (
            <ChevronUp size={16} className={`text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          )}
        </button>
      </div>
    </aside>
  );
};