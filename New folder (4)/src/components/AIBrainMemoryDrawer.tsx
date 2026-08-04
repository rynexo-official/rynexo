import React from 'react';
import {
  X,
  Brain,
  Cpu,
  Database,
  Sparkles,
  Zap,
  Briefcase,
  TrendingUp,
  DollarSign,
  GraduationCap,
  MessageSquare,
  Activity,
  CheckCircle2,
  Lock,
  ArrowRight,
  Layers,
  Globe,
  Award
} from 'lucide-react';
import { UserProfile, AIMemory } from '../types';

interface AIBrainMemoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  aiMemory: AIMemory | null;
  activeLearningSignals?: { source: string; insight: string; timestamp: string }[];
  onNavigateTab: (tab: string) => void;
}

export const AIBrainMemoryDrawer: React.FC<AIBrainMemoryDrawerProps> = ({
  isOpen,
  onClose,
  userProfile,
  aiMemory,
  activeLearningSignals = [],
  onNavigateTab,
}) => {
  if (!isOpen) return null;

  const skills = aiMemory?.skills || userProfile?.skills || [];
  const country = aiMemory?.country || userProfile?.country || 'Global';
  const city = aiMemory?.city || userProfile?.city || 'Capital';
  const targetIncome = aiMemory?.monthlyIncomeTarget || userProfile?.incomeTarget || userProfile?.monthlyGoalUSD || 5000;
  const currentIncome = aiMemory?.currentIncome || userProfile?.currentIncome || 0;
  const budget = aiMemory?.budget ?? userProfile?.budget ?? userProfile?.availableBudgetUSD ?? 250;
  const savedJobsCount = aiMemory?.savedJobs?.length || (typeof userProfile?.savedJobs === 'number' ? userProfile.savedJobs : userProfile?.savedJobs?.length || 0);
  const savedBusinessesCount = aiMemory?.savedBusinesses?.length || (typeof userProfile?.savedBusinesses === 'number' ? userProfile.savedBusinesses : userProfile?.savedBusinesses?.length || 0);
  const activityLogs = aiMemory?.dailyActivityLog || [];
  const streak = aiMemory?.successStreak || userProfile?.currentStreak || 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-blue-500/20 text-slate-100 h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Brain className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white tracking-wide">
                  RYNEXO Central AI Brain
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1" />
                  Live Memory Sync
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Unified Cross-Module Knowledge Base stored in Firestore (collection: <code className="text-blue-300">ai_memory</code>)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* OS Neural Flow Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-indigo-950/60 to-purple-950/60 border border-blue-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-300 flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span>Inter-Module Neural Mesh</span>
              </span>
              <span className="text-xs text-slate-400">10 Learning Streams Active</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every job search, business idea, affiliate click, mission completion, and AI conversation feeds into this single brain memory. Recommendations continuously evolve to maximize your income velocity.
            </p>

            <div className="grid grid-cols-5 gap-2 pt-2">
              {[
                { name: 'Jobs', icon: Briefcase, tab: 'jobs', count: `${savedJobsCount} Saved` },
                { name: 'Business', icon: TrendingUp, tab: 'business', count: `${savedBusinessesCount} Incubated` },
                { name: 'Affiliates', icon: DollarSign, tab: 'affiliates', count: 'Active Catalogs' },
                { name: 'Learning', icon: GraduationCap, tab: 'learning', count: `${skills.length} Skills` },
                { name: 'Income', icon: Award, tab: 'coach', count: `$${currentIncome} / $${targetIncome}` },
              ].map((m, idx) => {
                const IconComp = m.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      onClose();
                      onNavigateTab(m.tab);
                    }}
                    className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 text-center transition group flex flex-col items-center space-y-1"
                  >
                    <IconComp className="w-4 h-4 text-blue-400 group-hover:scale-110 transition" />
                    <span className="text-[11px] font-bold text-white block">{m.name}</span>
                    <span className="text-[9px] text-slate-400 block truncate">{m.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 10 Learning Dimensions Memory Matrix */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
              <Database className="w-4 h-4 text-purple-400" />
              <span>Unified AI Memory State (10 Dimensions)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Profile & Location */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                    <span>Candidate Identity & Location</span>
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-sm font-black text-white">
                  {userProfile?.fullName || 'Authenticated Entrepreneur'}
                </p>
                <p className="text-xs text-slate-400">
                  {city}, {country} | {userProfile?.profession || 'Specialist'}
                </p>
              </div>

              {/* 2. Skills & Mastery */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Skills & Technology Stack</span>
                  </span>
                  <span className="text-[10px] font-bold text-indigo-400">{skills.length} Indexed</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {skills.length > 0 ? (
                    skills.slice(0, 5).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 text-[10px] font-bold border border-indigo-500/20">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No explicit skills added yet</span>
                  )}
                </div>
              </div>

              {/* 3. Income Goals */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Financial Velocity & Budget</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400">Target: ${targetIncome}/mo</span>
                </div>
                <p className="text-sm font-black text-white">
                  Current: ${currentIncome} USD / mo
                </p>
                <p className="text-xs text-slate-400">
                  Available Budget: ${budget} USD
                </p>
              </div>

              {/* 4. Daily Mission Streak */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Daily Mission Consistency</span>
                  </span>
                  <span className="text-[10px] font-bold text-amber-400">{streak} Day Streak</span>
                </div>
                <p className="text-sm font-black text-white">
                  {streak > 0 ? `${streak} Days Active Execution` : 'Mission Engine Initialized'}
                </p>
                <p className="text-xs text-slate-400">
                  Daily reset at midnight UTC
                </p>
              </div>
            </div>
          </div>

          {/* AI Executive Recommendation in Memory */}
          {aiMemory?.lastAIRecommendation && (
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-purple-500/30 space-y-2">
              <span className="text-xs font-extrabold uppercase text-purple-300 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Latest AI Memory Strategic Directive</span>
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium italic">
                "{aiMemory.lastAIRecommendation}"
              </p>
            </div>
          )}

          {/* Live Learning Signals Stream */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Real-Time AI Brain Signals</span>
            </h3>

            <div className="space-y-2">
              {activeLearningSignals.length > 0 ? (
                activeLearningSignals.map((sig, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0 animate-ping" />
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-blue-300">{sig.source}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(sig.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{sig.insight}</p>
                    </div>
                  </div>
                ))
              ) : activityLogs.length > 0 ? (
                activityLogs.slice(0, 4).map((log, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-emerald-300">{log.action.replace('_', ' ').toUpperCase()}</span>
                        <span className="text-[10px] text-slate-500">{log.date}</span>
                      </div>
                      <p className="text-xs text-slate-300">
                        {typeof log.metadata === 'string' ? log.metadata : JSON.stringify(log.metadata || {})}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-500">
                  AI Brain is active and awaiting interactive triggers from jobs, business, or chat modules.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Firestore Storage</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
          >
            Close Memory View
          </button>
        </div>
      </div>
    </div>
  );
};
