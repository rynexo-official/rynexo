import React, { useState } from 'react';
import { Users, ExternalLink, MessageSquare, Zap, Award, Globe } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../i18n/translations';
import { ExternalLinkModal } from './ExternalLinkModal';

interface CommunityViewProps {
  language: Language;
}

export const CommunityView: React.FC<CommunityViewProps> = ({ language }) => {
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const telegramGroupUrl = 'https://t.me/primevision_0';

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900/60 border border-white/10 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/15 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>{getTranslation(language, 'activeMembers')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {getTranslation(language, 'communityTitle')}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              {getTranslation(language, 'communitySubtitle')}
            </p>
          </div>

          <button
            onClick={() => setPendingUrl(telegramGroupUrl)}
            className="px-6 py-3.5 rounded-full bg-white text-black font-bold text-xs tracking-wide shadow-xl hover:bg-slate-200 transition flex items-center justify-center gap-2 shrink-0"
          >
            <span>{getTranslation(language, 'joinTelegramButton')}</span>
            <ExternalLink className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      </div>

      {/* Community Value Proposition Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Feature 1 */}
        <div className="p-6 rounded-[32px] bg-white/[0.03] border border-white/10 backdrop-blur-xl">
          <div className="p-3.5 rounded-2xl bg-white/10 border border-white/20 text-purple-300 w-fit mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base mb-1">
            {getTranslation(language, 'feature1Title')}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {getTranslation(language, 'feature1Desc')}
          </p>
        </div>

        {/* Feature 2 */}
        <div className="p-6 rounded-[32px] bg-white/[0.03] border border-white/10 backdrop-blur-xl">
          <div className="p-3.5 rounded-2xl bg-white/10 border border-white/20 text-blue-300 w-fit mb-4">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base mb-1">
            {getTranslation(language, 'feature2Title')}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {getTranslation(language, 'feature2Desc')}
          </p>
        </div>

        {/* Feature 3 */}
        <div className="p-6 rounded-[32px] bg-white/[0.03] border border-white/10 backdrop-blur-xl">
          <div className="p-3.5 rounded-2xl bg-white/10 border border-white/20 text-emerald-300 w-fit mb-4">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base mb-1">
            {getTranslation(language, 'feature3Title')}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {getTranslation(language, 'feature3Desc')}
          </p>
        </div>
      </div>

      {/* Telegram Group Preview Card */}
      <div className="p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] bg-white/[0.03] border border-white/10 backdrop-blur-xl text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 text-blue-400 mx-auto flex items-center justify-center">
          <Globe className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">
            Official RYNEXO Telegram Network
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto leading-relaxed">
            Moderated 24/7 by experienced online business leaders and career strategists. Free access for registered users.
          </p>
        </div>

        <button
          onClick={() => setPendingUrl(telegramGroupUrl)}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-black font-bold text-xs hover:bg-slate-200 transition shadow-xl"
        >
          <span>Open Telegram Group</span>
          <ExternalLink className="w-4 h-4 text-blue-600" />
        </button>
      </div>

      {/* Confirmation Dialog before opening external Telegram link */}
      <ExternalLinkModal
        isOpen={!!pendingUrl}
        targetUrl={pendingUrl}
        onClose={() => setPendingUrl(null)}
        language={language}
      />
    </div>
  );
};
