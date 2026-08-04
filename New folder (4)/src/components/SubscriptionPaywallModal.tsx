import React from 'react';
import { Lock, Sparkles, ShieldCheck, ArrowRight, CheckCircle2, X } from 'lucide-react';
import { UserProfile, Language } from '../types';

interface SubscriptionPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPayments: () => void;
  featureName?: string;
  language?: Language;
}

export const SubscriptionPaywallModal: React.FC<SubscriptionPaywallModalProps> = ({
  isOpen,
  onClose,
  onOpenPayments,
  featureName = 'Premium AI Feature',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#0e1329] to-[#070a14] border border-blue-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-blue-400">
          <Lock className="w-7 h-7" />
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>3-Day Free Trial Required</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            Unlock {featureName}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Start your 3-day full access free trial with PayPal payment authorization. $0.00 charged today. Auto-converts to $29/month after 3 days. Cancel anytime before trial ends.
          </p>
        </div>

        {/* Included Features */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2.5">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Included in 3-Day Free Trial:
          </div>
          {[
            '3-Day Full Access ($0.00 charged today)',
            'Unlimited Autonomous AI Agent Executions',
            'Full AI Executive Command Center & Strategy',
            'ATS Resume Rewriter & Recruiter Email Generator',
            'AI Business Incubator & Financial Roadmap Generator',
            'Direct Firebase Firestore Data Persistence',
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="space-y-3">
          <button
            onClick={() => {
              onClose();
              onOpenPayments();
            }}
            className="w-full py-3.5 rounded-2xl bg-[#FFC439] hover:bg-[#ffbb1a] text-[#003087] font-black text-sm transition shadow-lg flex items-center justify-center gap-2"
          >
            <span>Start 3-Day Free Trial (PayPal $0.00)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 pt-1">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Secure payments powered by PayPal. $0.00 today.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
