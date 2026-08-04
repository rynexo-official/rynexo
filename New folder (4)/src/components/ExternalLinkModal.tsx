import React from 'react';
import { ExternalLink, X } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../i18n/translations';

interface ExternalLinkModalProps {
  isOpen: boolean;
  targetUrl: string | null;
  onClose: () => void;
  language: Language;
}

export const ExternalLinkModal: React.FC<ExternalLinkModalProps> = ({
  isOpen,
  targetUrl,
  onClose,
  language,
}) => {
  if (!isOpen || !targetUrl) return null;

  const handleContinue = () => {
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      {/* Glassmorphism Dialog Container */}
      <div className="relative w-full max-w-md bg-[#0c0d14] border border-white/15 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 shadow-2xl overflow-hidden text-center backdrop-blur-2xl">
        {/* Soft Ambient Radial Light Accent */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-48 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 rounded-full blur-[80px] pointer-events-none" />

        {/* Close Icon Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition z-10"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative z-10 flex flex-col items-center">
          {/* Badge Icon */}
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center mb-5 text-blue-400 shadow-md">
            <ExternalLink className="w-6 h-6" />
          </div>

          {/* Dialog Title */}
          <h2 className="text-2xl font-bold text-white tracking-tight mb-4">
            {getTranslation(language, 'leavingDialogTitle')}
          </h2>

          {/* Dialog Message */}
          <div className="space-y-3 text-xs sm:text-sm text-slate-300/90 leading-relaxed font-normal mb-8 max-w-xs">
            <p>{getTranslation(language, 'leavingDialogMessage1')}</p>
            <p>{getTranslation(language, 'leavingDialogMessage2')}</p>
            <p className="font-semibold text-white pt-1">
              {getTranslation(language, 'leavingDialogQuestion')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 px-5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 font-bold text-xs tracking-wide transition-all"
            >
              {getTranslation(language, 'cancelButton')}
            </button>

            <button
              onClick={handleContinue}
              className="flex-1 py-3.5 px-5 rounded-full bg-white text-black hover:bg-slate-200 font-bold text-xs tracking-wide shadow-xl transition-all flex items-center justify-center gap-2 group"
            >
              <span>{getTranslation(language, 'continueButton')}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
