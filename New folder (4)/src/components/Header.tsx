import React, { useState } from 'react';
import { Sparkles, Globe, Bell, Crown, User as UserIcon, LogOut, ShieldCheck, Menu } from 'lucide-react';
import { Language, UserProfile } from '../types';
import { getTranslation } from '../i18n/translations';

interface HeaderProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  user: UserProfile | null;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenBrainDrawer?: () => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  user,
  onOpenProfile,
  onOpenAuth,
  onSignOut,
  onOpenBrainDrawer,
  onToggleMobileMenu,
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'ar', label: 'العربية' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#050508]/85 border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Left Side: Mobile Hamburger Menu & Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden min-w-[44px] min-h-[44px] p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition flex items-center justify-center"
              aria-label="Toggle Mobile Navigation Drawer"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-base sm:text-xl font-black tracking-tight text-white">
                RYNEXO
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-300">
                PRO
              </span>
              {user && (
                <button
                  onClick={onOpenBrainDrawer}
                  className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 transition cursor-pointer"
                  title="View Unified AI Memory Matrix"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>{getTranslation(currentLanguage, 'aiOsBrainActive')}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side Actions: Language, Notifications, Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Language Switcher Pill Bar (Desktop & Tablet) */}
          <div className="hidden sm:flex items-center bg-white/5 rounded-full p-1 border border-white/10 text-xs">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => onLanguageChange(lang.code)}
                className={`px-2.5 py-0.5 rounded-full text-xs transition font-semibold ${
                  currentLanguage === lang.code
                    ? 'bg-white/15 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang.code.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Mobile Language Dropdown Button */}
          <div className="relative sm:hidden">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200 text-xs font-bold"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span className="uppercase">{currentLanguage}</span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-36 bg-[#090a10] border border-white/15 rounded-2xl shadow-2xl py-1 z-50 backdrop-blur-2xl">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs transition flex items-center justify-between ${
                      currentLanguage === lang.code
                        ? 'bg-white/10 text-white font-bold'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{lang.label}</span>
                    {currentLanguage === lang.code && (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 sm:p-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white transition relative"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#0c0d14] border border-white/15 rounded-3xl shadow-2xl p-4 z-50 backdrop-blur-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-widest">
                    {getTranslation(currentLanguage, 'liveNotifications')}
                  </h4>
                  <span className="text-[10px] text-blue-400 font-bold">{getTranslation(currentLanguage, 'live')}</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-200">
                    <p className="font-semibold text-white">{getTranslation(currentLanguage, 'newRemoteOpportunity')}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {getTranslation(currentLanguage, 'newRemoteOpportunityDesc')}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-slate-300">
                    <p className="font-semibold text-slate-200">{getTranslation(currentLanguage, 'aiStrategyUpdated')}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {getTranslation(currentLanguage, 'aiStrategyUpdatedDesc')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Auth Button */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 px-2.5 sm:px-3.5 py-1 rounded-full bg-white/5 border border-white/15 text-white text-xs font-medium hover:bg-white/10 transition"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-purple-500 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white uppercase border border-white/20 shrink-0">
                  {user.fullName.charAt(0)}
                </div>
                <span className="hidden sm:inline font-semibold max-w-[90px] truncate">
                  {user.fullName}
                </span>
                <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              </button>

              <button
                onClick={onSignOut}
                className="p-1.5 sm:p-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-rose-400 transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 sm:px-5 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:bg-slate-200 transition shadow-lg"
            >
              {getTranslation(currentLanguage, 'signInButton')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
