import React from 'react';
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Language, UserProfile } from '../types';
import { getTranslation } from '../i18n/translations';

interface WelcomeModalProps {
  user: UserProfile;
  isOpen: boolean;
  onProceedToDashboard: () => void;
  language: Language;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  user,
  isOpen,
  onProceedToDashboard,
  language,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-violet-500/30 rounded-3xl p-6 sm:p-8 text-center shadow-2xl">
        {/* Glow Element */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-violet-600/30 blur-3xl rounded-full pointer-events-none" />

        {/* Icon */}
        <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-500 mb-4 shadow-xl shadow-violet-600/30">
          <Sparkles className="w-8 h-8 text-white" />
        </div>

        {/* Title */}
        <h3 className="text-2xl font-black text-white tracking-tight">
          {getTranslation(language, 'welcomeTitle')}
        </h3>

        <p className="text-sm font-semibold text-violet-300 mt-1">
          {user.fullName}
        </p>

        <p className="text-xs text-slate-300 leading-relaxed mt-3 px-2">
          {getTranslation(language, 'welcomeSubtitle')}
        </p>

        {/* Created Details Summary */}
        <div className="my-6 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-left space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Auth Status:
            </span>
            <span className="font-semibold text-emerald-400">Firebase Verified</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Zap className="w-4 h-4 text-violet-400" />
              Profile Location:
            </span>
            <span className="font-semibold text-slate-200">
              {user.city}, {user.country}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-violet-400" />
              AI Engines:
            </span>
            <span className="font-semibold text-violet-300">Gemini 3.6 Ready</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onProceedToDashboard}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-bold text-xs tracking-wider shadow-xl shadow-violet-600/30 hover:opacity-95 transition flex items-center justify-center gap-2"
        >
          <span>{getTranslation(language, 'getStartedDashboard')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
