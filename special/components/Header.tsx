import React, { useState, useRef, useEffect } from 'react';
import { Bell, Sun, Moon, Menu, MessageSquare, FileText, CheckCircle2 } from 'lucide-react';
import { ThemeMode } from '../types';
import { AISearchBar } from './widgets/AISearchBar';

interface HeaderProps {
  title: string;
  theme: ThemeMode;
  toggleTheme: () => void;
  onMenuClick: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  theme, 
  toggleTheme, 
  onMenuClick,
  searchTerm,
  onSearchChange
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const MOCK_NOTIFICATIONS = [
    { id: 1, text: "Kelly S. updated REQ-50019", time: "2m ago", icon: FileText, color: "text-blue-500", read: false },
    { id: 2, text: "New comment from Will", time: "15m ago", icon: MessageSquare, color: "text-brand-primary", read: false },
    { id: 3, text: "System maintenance complete", time: "1h ago", icon: CheckCircle2, color: "text-emerald-500", read: true },
  ];

  return (
    <header className="
      h-20 px-8 flex items-center justify-between
      sticky top-0 z-30
      bg-app-surface/80 backdrop-blur-lg
      border-b border-slate-200/60 dark:border-slate-800/60
      transition-all duration-300
    ">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
          <Menu size={24} />
        </button>
        <h2 className="text-2xl font-display font-bold text-slate-800 dark:text-white tracking-tight hidden md:block animate-in fade-in duration-500">
          {title}
        </h2>
      </div>

      {/* AI Command Center / Search */}
      <div className="flex-1 max-w-xl px-6">
        <AISearchBar 
          value={searchTerm} 
          onChange={onSearchChange} 
        />
      </div>

      <div className="flex items-center gap-4">
        {/* Actions */}
        <div className="flex items-center gap-2" ref={notifRef}>
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-full text-slate-500 hover:text-brand-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2.5 rounded-full transition-all active:scale-95 ${showNotifications ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-500 hover:text-brand-primary hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-bounce"></span>
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-4 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200 origin-top-right">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white">Notifications</h3>
                  <button className="text-[10px] font-bold text-brand-primary hover:underline">Mark all read</button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {MOCK_NOTIFICATIONS.map((notif) => (
                    <div key={notif.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border-b border-slate-50 dark:border-slate-800/50 last:border-0 group">
                      <div className="flex gap-3">
                        <div className={`mt-1 ${notif.color}`}>
                          <notif.icon size={16} />
                        </div>
                        <div>
                          <p className={`text-sm ${notif.read ? 'text-slate-500' : 'text-slate-800 dark:text-slate-200 font-medium'}`}>
                            {notif.text}
                          </p>
                          <span className="text-xs text-slate-400 group-hover:text-brand-secondary transition-colors">{notif.time}</span>
                        </div>
                        {!notif.read && (
                          <div className="ml-auto mt-2 w-1.5 h-1.5 bg-brand-primary rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-800/30 text-center">
                  <button className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">View all history</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
