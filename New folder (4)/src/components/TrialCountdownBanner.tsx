import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { UserProfile, Language } from '../types';
import { getTranslation } from '../i18n/translations';

interface TrialCountdownBannerProps {
  user: UserProfile | null;
  onOpenPayments: () => void;
  language?: Language;
}

export const TrialCountdownBanner: React.FC<TrialCountdownBannerProps> = ({
  user,
  onOpenPayments,
  language = 'en',
}) => {
  const lang: Language = (language || 'en') as Language;
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    days: 3,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    if (!user || !user.trialEndDate) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(user.trialEndDate!).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [user]);

  // If user is not logged in or doesn't have an active trial / subscription banner
  const isInTrial = user?.trialStatus === 'active' || user?.subscriptionStatus === 'in_trial';
  const isCanceled = user?.subscriptionStatus === 'canceled' || user?.trialStatus === 'cancelled';

  if (isCanceled) {
    return (
      <div className="w-full bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border-b border-rose-500/30 px-4 py-2.5 text-xs text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>
            <strong>{getTranslation(lang, 'subscriptionCancelled')}</strong> {getTranslation(lang, 'subscriptionCancelledDesc')}
          </span>
        </div>
        <button
          onClick={onOpenPayments}
          className="px-3 py-1 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs transition shrink-0"
        >
          {getTranslation(lang, 'reactivateTrial')}
        </button>
      </div>
    );
  }

  if (!isInTrial && !user?.subscriptionStatus) {
    return (
      <div className="w-full bg-gradient-to-r from-blue-950 via-indigo-950 to-purple-950 border-b border-blue-500/30 px-4 py-2.5 text-xs text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          <span>
            <strong>{getTranslation(lang, 'trialAvailableTitle')}</strong> {getTranslation(lang, 'trialAvailableDesc')}
          </span>
        </div>
        <button
          onClick={onOpenPayments}
          className="px-3 py-1 rounded-xl bg-[#FFC439] hover:bg-[#ffbb1a] text-[#003087] font-black text-xs transition shrink-0 flex items-center gap-1"
        >
          <span>{getTranslation(lang, 'startFreeTrial')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (!isInTrial) return null;

  const isWarning = timeLeft.days === 0 && timeLeft.hours < 24;

  return (
    <div
      className={`w-full border-b px-4 py-2.5 text-xs text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg ${
        isWarning
          ? 'bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-amber-500/40'
          : 'bg-gradient-to-r from-blue-950 via-slate-900 to-purple-950 border-blue-500/30'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-bold">
          <Clock className={`w-4 h-4 ${isWarning ? 'text-amber-400 animate-bounce' : 'text-blue-400'}`} />
          <span>
            {getTranslation(lang, 'trialTimer')}
          </span>
        </div>

        {/* Countdown digits */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 font-black text-blue-300">
            {String(timeLeft.days).padStart(2, '0')}d
          </span>
          <span>:</span>
          <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 font-black text-blue-300">
            {String(timeLeft.hours).padStart(2, '0')}h
          </span>
          <span>:</span>
          <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 font-black text-blue-300">
            {String(timeLeft.minutes).padStart(2, '0')}m
          </span>
          <span>:</span>
          <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 font-black text-blue-300">
            {String(timeLeft.seconds).padStart(2, '0')}s
          </span>
        </div>

        <span className="hidden md:inline text-slate-300 text-[11px]">
          {getTranslation(lang, 'cancelAnytime')}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden lg:inline text-[11px] text-slate-400 font-mono">
          {getTranslation(lang, 'paypalSecureNotice')}
        </span>
        <button
          onClick={onOpenPayments}
          className="px-3.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs transition"
        >
          {getTranslation(lang, 'subscription')}
        </button>
      </div>
    </div>
  );
};
