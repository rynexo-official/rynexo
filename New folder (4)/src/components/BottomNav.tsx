import React from 'react';
import { LayoutDashboard, Briefcase, Rocket, Store, User } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../i18n/translations';

export type TabType = 'dashboard' | 'coach' | 'jobs' | 'business' | 'profile';
export type NavItemType = TabType | 'marketplace';

interface BottomNavProps {
  activeTab: TabType;
  activeModalView?: string;
  onTabChange: (tab: TabType) => void;
  onOpenMarketplace?: () => void;
  language: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({ 
  activeTab, 
  activeModalView = 'none',
  onTabChange, 
  onOpenMarketplace,
  language 
}) => {
  const currentNav: NavItemType = activeModalView === 'marketplace' ? 'marketplace' : activeTab;

  const navItems: { id: NavItemType; labelKey: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', labelKey: 'navDashboard', icon: LayoutDashboard },
    { id: 'jobs', labelKey: 'navJobs', icon: Briefcase },
    { id: 'business', labelKey: 'navBusiness', icon: Rocket },
    { id: 'marketplace', labelKey: 'navMarketplace', icon: Store },
    { id: 'profile', labelKey: 'navProfile', icon: User },
  ];

  const handleNavClick = (id: NavItemType) => {
    if (id === 'marketplace') {
      if (onOpenMarketplace) {
        onOpenMarketplace();
      }
    } else {
      onTabChange(id as TabType);
    }
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-2 py-2.5 pointer-events-none bg-gradient-to-t from-[#050508] via-[#050508]/95 to-transparent">
      <div className="max-w-lg mx-auto pointer-events-auto bg-[#090a14]/95 border border-white/15 backdrop-blur-2xl rounded-2xl sm:rounded-full px-2 py-1.5 flex items-center justify-between shadow-2xl shadow-black">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`relative flex-1 flex flex-col items-center justify-center min-h-[48px] py-1.5 px-1 rounded-xl sm:rounded-full transition-all duration-200 ${
                isActive
                  ? 'text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-xl sm:rounded-full border border-purple-500/40 shadow-lg shadow-purple-950/50 -z-10 animate-fade-in" />
              )}
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-purple-400' : ''}`} />
              <span className={`text-[9px] sm:text-[10px] mt-1 tracking-tight truncate max-w-[64px] ${isActive ? 'font-black text-white' : 'font-medium'}`}>
                {getTranslation(language, item.labelKey)}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-purple-400 mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
