import React from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  Briefcase, 
  Rocket, 
  DollarSign, 
  Award, 
  Users, 
  BookOpen, 
  User, 
  Sparkles, 
  ShieldCheck,
  Server,
  Cpu,
  Store,
  CreditCard,
  ShieldAlert,
  X
} from 'lucide-react';
import { TabType } from './BottomNav';
import { UserProfile, Language } from '../types';
import { getTranslation } from '../i18n/translations';

export type ExtendedNavView = TabType | 'community' | 'learning' | 'affiliates' | 'readiness' | 'integrations' | 'ai-agent' | 'ai-executive' | 'marketplace' | 'payments' | 'admin';

interface SidebarProps {
  activeTab: TabType;
  activeModalView: 'none' | 'community' | 'learning' | 'affiliates' | 'readiness' | 'integrations' | 'ai-agent' | 'ai-executive' | 'marketplace' | 'payments' | 'admin';
  onNavigate: (view: ExtendedNavView) => void;
  user: UserProfile | null;
  language: Language;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  activeModalView,
  onNavigate,
  user,
  language,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const isAr = language === 'ar';
  const currentView: ExtendedNavView = activeModalView !== 'none' ? activeModalView : activeTab;

  const navItems: {
    id: ExtendedNavView;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: string;
  }[] = [
    { id: 'dashboard', label: getTranslation(language, 'navDashboard'), icon: LayoutDashboard },
    { id: 'marketplace', label: getTranslation(language, 'navMarketplace'), icon: Store, badge: getTranslation(language, 'ecosystemsCount') },
    { id: 'ai-executive', label: getTranslation(language, 'navExecutive'), icon: Cpu, badge: getTranslation(language, 'workersCount') },
    { id: 'ai-agent', label: getTranslation(language, 'navAgent'), icon: Sparkles, badge: getTranslation(language, 'autopilotBadge') },
    { id: 'coach', label: getTranslation(language, 'navCoach'), icon: Bot, badge: 'AI OS' },
    { id: 'jobs', label: getTranslation(language, 'navJobs'), icon: Briefcase },
    { id: 'business', label: getTranslation(language, 'navBusiness'), icon: Rocket },
    { id: 'payments', label: getTranslation(language, 'navPayments'), icon: CreditCard, badge: 'PayPal' },
    { id: 'admin', label: getTranslation(language, 'navAdmin'), icon: ShieldAlert, badge: 'Analytics' },
    { id: 'affiliates', label: getTranslation(language, 'navAffiliates'), icon: DollarSign },
    { id: 'readiness', label: getTranslation(language, 'navReadiness'), icon: Award, badge: user?.readinessScore ? `${user.readinessScore}%` : 'AI' },
    { id: 'integrations', label: getTranslation(language, 'navIntegrations'), icon: Server },
    { id: 'community', label: getTranslation(language, 'navCommunity'), icon: Users, badge: '12.4k' },
    { id: 'learning', label: getTranslation(language, 'navLearning'), icon: BookOpen },
    { id: 'profile', label: getTranslation(language, 'navProfile'), icon: User },
  ];

  const handleItemClick = (id: ExtendedNavView) => {
    onNavigate(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const renderSidebarContent = (isMobileDrawer = false) => (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white">{getTranslation(language, 'brandName')}</span>
                <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-300">
                  AI OS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">{getTranslation(language, 'personalAiAccelerator')}</p>
            </div>
          </div>

          {isMobileDrawer && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* User Quick Profile Card */}
        {user && (
          <div className="my-5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white uppercase border border-white/20 shrink-0">
              {user.fullName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white truncate">{user.fullName}</h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-semibold text-slate-400 truncate">
                  {user.country || getTranslation(language, 'globalMember')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation List */}
        <div className="space-y-1 my-2">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {getTranslation(language, 'operatingSystem')}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600/30 via-indigo-600/20 to-blue-600/20 text-white font-bold border border-purple-500/40 shadow-lg shadow-purple-950/50'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-purple-400 scale-110' : 'text-slate-500 group-hover:text-slate-200'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      isActive
                        ? 'bg-purple-500 text-white border-purple-400'
                        : 'bg-white/5 text-slate-400 border-white/10 group-hover:border-white/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Income Goal Progress Box */}
      <div className="pt-4 mt-6 border-t border-white/10">
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-purple-950/30 to-blue-950/20 border border-purple-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-300">{getTranslation(language, 'monthlyTarget')}</span>
            <span className="text-[10px] font-extrabold text-emerald-400">
              ${user?.monthlyGoalUSD ? user.monthlyGoalUSD.toLocaleString() : '5,000'}
            </span>
          </div>

          {/* Animated Gradient Bar */}
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(15, user?.readinessScore || 45))}%` }}
            />
          </div>

          <p className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>{getTranslation(language, 'progress')}: {user?.readinessScore || 45}%</span>
            <span className="text-purple-300 font-semibold cursor-pointer hover:underline" onClick={() => handleItemClick('readiness')}>
              {getTranslation(language, 'viewDetails')} →
            </span>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside
        className={`hidden lg:flex flex-col w-64 xl:w-72 fixed top-0 bottom-0 z-30 bg-[#070712]/95 backdrop-blur-3xl p-5 overflow-y-auto scrollbar-none ${
          isAr ? 'right-0 border-l border-white/10' : 'left-0 border-r border-white/10'
        }`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Hidden Drawer Menu */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Slide Drawer Content */}
          <aside
            className={`relative w-80 max-w-[85vw] bg-[#070712] border-r border-white/15 p-5 overflow-y-auto scrollbar-none shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-left duration-300 ${
              isAr ? 'right-0 border-l border-r-0' : 'left-0 border-r'
            }`}
          >
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
