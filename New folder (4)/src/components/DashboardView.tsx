import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Briefcase, 
  Rocket, 
  Users, 
  Bot, 
  BookOpen, 
  DollarSign, 
  ArrowUpRight, 
  Sparkles, 
  Shield, 
  ExternalLink,
  ChevronRight,
  Zap,
  Award,
  Calendar,
  Flame,
  CheckCircle2,
  Target,
  BarChart3,
  Activity,
  Layers,
  Star,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { Language, UserProfile, AffiliateOffer } from '../types';
import { getTranslation } from '../i18n/translations';
import { TabType } from './BottomNav';
import { TodaysSuccessDashboard } from './TodaysSuccessDashboard';
import { loadAIBrainIntelligence, AIBrainState } from '../lib/aiBrain';
import { calculateCareerScore, generateDecisionEngine, generateDailyWorkflow } from '../lib/aiCareerAgent';

interface DashboardViewProps {
  user: UserProfile | null;
  language: Language;
  onNavigateTab: (tab: TabType) => void;
  affiliateOffers: AffiliateOffer[];
  onOpenCommunity: () => void;
  onOpenLearning: () => void;
  onOpenAffiliateMarketplace: () => void;
  onOpenReadinessReport: () => void;
  onOpenAIAgent?: () => void;
  onOpenAIExecutive?: () => void;
  onOpenMarketplace?: () => void;
  onOpenPayments?: () => void;
  onOpenAdmin?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  language,
  onNavigateTab,
  affiliateOffers,
  onOpenCommunity,
  onOpenLearning,
  onOpenAffiliateMarketplace,
  onOpenReadinessReport,
  onOpenAIAgent,
  onOpenAIExecutive,
  onOpenMarketplace,
  onOpenPayments,
  onOpenAdmin,
}) => {
  const [activeChartPeriod, setActiveChartPeriod] = useState<'7D' | '30D' | '6M'>('30D');
  const [brainState, setBrainState] = useState<AIBrainState | null>(null);

  useEffect(() => {
    async function syncBrain() {
      if (user) {
        const state = await loadAIBrainIntelligence(user);
        setBrainState(state);
      }
    }
    syncBrain();
  }, [user]);

  // Compute stats directly from Firebase user profile and AI Brain
  const activeProfile = brainState?.userProfile || user;
  const userName = activeProfile?.fullName ? activeProfile.fullName.split(' ')[0] : (activeProfile?.email ? activeProfile.email.split('@')[0] : getTranslation(language, 'entrepreneur'));
  const readinessScore = activeProfile?.readinessScore ?? activeProfile?.aiReadinessReport?.overallScore ?? 50;
  const careerScore = activeProfile?.aiReadinessReport?.careerReadinessScore ?? (activeProfile?.skills?.length ? Math.min(95, 50 + activeProfile.skills.length * 10) : 50);
  const businessScore = activeProfile?.aiReadinessReport?.businessReadinessScore ?? (activeProfile?.businessInterests?.length ? Math.min(95, 50 + activeProfile.businessInterests.length * 10) : 50);
  const monthlyTarget = activeProfile?.incomeTarget ?? activeProfile?.monthlyGoalUSD ?? 0;
  const currentIncome = activeProfile?.currentIncome ?? activeProfile?.currentMonthlyIncomeUSD ?? 0;
  const estimatedDailyIncome = monthlyTarget > 0 ? Math.round(monthlyTarget / 30) : 0;
  const currentStreak = brainState?.dailySuccess?.streakDays ?? activeProfile?.currentStreak ?? 0;
  const userSkills = activeProfile?.skills?.length ? activeProfile.skills.join(', ') : 'AI Prompting, Automation';
  const userCountry = activeProfile?.country || 'Global';
  const userBudget = activeProfile?.budget ?? activeProfile?.availableBudgetUSD ?? 0;

  // AI Dynamic Summary generated from Central AI Brain
  const aiSummaryText = brainState?.briefing?.strategicSummary || (user
    ? `Central AI Brain initialized for ${userName} (${userSkills} in ${userCountry}). Target: $${monthlyTarget.toLocaleString()}/mo.`
    : 'Sign in to sync your Firebase AI Operating System profile and personalize your career and business recommendations.');

  // Sample income trajectory chart data
  const incomeChartData = [
    { day: 'W1', target: Math.round(monthlyTarget * 0.15), actual: Math.round(monthlyTarget * 0.18) },
    { day: 'W2', target: Math.round(monthlyTarget * 0.35), actual: Math.round(monthlyTarget * 0.40) },
    { day: 'W3', target: Math.round(monthlyTarget * 0.60), actual: Math.round(monthlyTarget * 0.68) },
    { day: 'W4', target: Math.round(monthlyTarget * 0.85), actual: Math.round(monthlyTarget * 0.92) },
    { day: 'W5', target: monthlyTarget, actual: Math.round(monthlyTarget * 1.05) },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* ======================================================== */}
      {/* 1. HERO OPERATING SYSTEM WELCOME BANNER */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-b from-purple-950/40 via-[#0a0a1a] to-[#06060e] border border-white/15 p-6 sm:p-10 md:p-12 backdrop-blur-3xl shadow-2xl shadow-purple-950/30">
        {/* Soft Ambient Radial Lighting */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-r from-purple-600/20 via-indigo-600/20 to-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-12 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          {/* Top Status Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 p-0.5 shadow-lg shadow-purple-500/25">
                <div className="w-full h-full rounded-[14px] bg-[#090914] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400">
                  RYNEXO AI OS 2.0
                </span>
                <p className="text-xs text-slate-300 font-bold">{getTranslation(language, 'personalizedIntelligenceActive')}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onOpenPayments}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition ${
                  user?.subscriptionStatus === 'active'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
                    : user?.subscriptionStatus === 'in_trial' || user?.trialStatus === 'active'
                    ? 'bg-blue-500/10 border-blue-500/40 text-blue-300 hover:bg-blue-500/20'
                    : 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>
                  {getTranslation(language, 'plan')}: {user?.subscriptionPlan || user?.plan || 'AI Career Pro'} ({user?.subscriptionStatus === 'active' ? getTranslation(language, 'planActive') : (user?.subscriptionStatus === 'in_trial' ? getTranslation(language, 'planTrial') : getTranslation(language, 'planInactive'))})
                </span>
              </button>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{getTranslation(language, 'firebaseSyncLive')}</span>
              </div>
              <button
                onClick={onOpenReadinessReport}
                className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5 text-amber-300" />
                <span>{getTranslation(language, 'report')}</span>
              </button>
            </div>
          </div>

          {/* Hero Main Greeting */}
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
              {getTranslation(language, 'welcomeBack')}, <span className="bg-gradient-to-r from-purple-300 via-indigo-200 to-blue-400 bg-clip-text text-transparent">{userName}</span>
            </h1>

            {/* Dynamic AI Summary */}
            <div className="mt-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {aiSummaryText}
              </p>
            </div>
          </div>

          {/* Key Metric Highlights Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-8">
            {/* AI Readiness Score */}
            <div 
              onClick={onOpenReadinessReport}
              className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-purple-500/40 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1">
                <span>{getTranslation(language, 'aiReadiness')}</span>
                <Award className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-xl font-black text-white group-hover:text-purple-300 transition">
                {readinessScore}%
              </div>
              <p className="text-[10px] text-purple-400 font-bold mt-0.5">{getTranslation(language, 'topCandidate')}</p>
            </div>

            {/* Career Score */}
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1">
                <span>{getTranslation(language, 'careerScore')}</span>
                <Briefcase className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="text-xl font-black text-white">{careerScore}/100</div>
              <p className="text-[10px] text-blue-400 font-bold mt-0.5">{getTranslation(language, 'jobMatchHigh')}</p>
            </div>

            {/* Business Score */}
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1">
                <span>{getTranslation(language, 'businessScore')}</span>
                <Rocket className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="text-xl font-black text-white">{businessScore}/100</div>
              <p className="text-[10px] text-indigo-400 font-bold mt-0.5">{getTranslation(language, 'incubatorReady')}</p>
            </div>

            {/* Estimated Monthly Income */}
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1">
                <span>{getTranslation(language, 'monthlyTarget')}</span>
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl font-black text-emerald-400">
                ${monthlyTarget.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{getTranslation(language, 'goalActive')}</p>
            </div>

            {/* Today's Potential Income */}
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1">
                <span>{getTranslation(language, 'todaysPotential')}</span>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-xl font-black text-amber-300">
                ${estimatedDailyIncome} {getTranslation(language, 'perDay')}
              </div>
              <p className="text-[10px] text-amber-400/80 font-bold mt-0.5">{getTranslation(language, 'missionActive')}</p>
            </div>

            {/* Current Streak & Milestone */}
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1">
                <span>{getTranslation(language, 'currentStreak')}</span>
                <Flame className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="text-xl font-black text-white">{currentStreak} {getTranslation(language, 'days')}</div>
              <p className="text-[10px] text-rose-300 font-bold mt-0.5">{getTranslation(language, 'milestone10Days')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1B. RYNEXO AI CAREER AGENT AUTOPILOT BANNER & WIDGETS */}
      {/* ======================================================== */}
      {(() => {
        const scoreBreakdown = calculateCareerScore(user);
        const decisionEngine = generateDecisionEngine(user);
        const dailyWorkflow = generateDailyWorkflow(user);

        return (
          <div className="space-y-6">
            {/* Enterprise Phase Ecosystem Quick Launch Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={onOpenMarketplace}
                className="p-5 rounded-3xl bg-gradient-to-br from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/30 hover:border-blue-400 transition cursor-pointer group shadow-xl flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 text-[10px] font-extrabold uppercase border border-blue-500/20">
                    {getTranslation(language, 'fiveEcosystems')}
                  </span>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-300 transition" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white group-hover:text-blue-300 transition">
                    {getTranslation(language, 'navMarketplace')}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    {getTranslation(language, 'rynexoGlobalMarketplaceDesc')}
                  </p>
                </div>
              </div>

              <div
                onClick={onOpenPayments}
                className="p-5 rounded-3xl bg-gradient-to-br from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/30 hover:border-purple-400 transition cursor-pointer group shadow-xl flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 text-[10px] font-extrabold uppercase border border-purple-500/20">
                    {getTranslation(language, 'productionBilling')}
                  </span>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-purple-300 transition" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white group-hover:text-purple-300 transition">
                    {getTranslation(language, 'navPayments')}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    {getTranslation(language, 'paymentsSubscriptionsDesc')}
                  </p>
                </div>
              </div>

              <div
                onClick={onOpenAdmin}
                className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950/80 border border-emerald-500/30 hover:border-emerald-400 transition cursor-pointer group shadow-xl flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-extrabold uppercase border border-emerald-500/20">
                    {getTranslation(language, 'systemCommand')}
                  </span>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-300 transition" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white group-hover:text-emerald-300 transition">
                    {getTranslation(language, 'navAdmin')}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    {getTranslation(language, 'enterpriseAdminPanelDesc')}
                  </p>
                </div>
              </div>
            </div>

            {/* AI Agent Autopilot Launch Card */}
            <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-blue-950/70 via-indigo-950/70 to-purple-950/70 border border-blue-500/30 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
                  <Bot className="w-3.5 h-3.5 text-blue-400" />
                  <span>{getTranslation(language, 'firestoreAiMemoryActive')}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>{getTranslation(language, 'aiAutopilotDecisionEngine')}</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  {getTranslation(language, 'aiAutopilotDecisionEngineDesc')}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {onOpenAIExecutive && (
                  <button
                    onClick={onOpenAIExecutive}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs tracking-wide shadow-xl shadow-indigo-600/30 transition flex items-center gap-2"
                  >
                    <Cpu className="w-4 h-4" />
                    <span>{getTranslation(language, 'aiExecutiveWorkforce')}</span>
                  </button>
                )}
                {onOpenAIAgent && (
                  <button
                    onClick={onOpenAIAgent}
                    className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs tracking-wide transition flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{getTranslation(language, 'aiAutopilot')}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Career Growth Breakdown & Income Prediction Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Career Score Breakdown (0-100) */}
              <div className="lg:col-span-2 p-6 rounded-[32px] bg-[#090914]/90 border border-white/10 backdrop-blur-2xl shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    <h3 className="font-extrabold text-base text-white tracking-tight">
                      {getTranslation(language, 'dynamicCareerBreakdown')}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      +{scoreBreakdown.weeklyImprovement}% {getTranslation(language, 'weeklyImprovement')}
                    </span>
                    <span className="text-xs font-bold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                      +{scoreBreakdown.monthlyImprovement}% {getTranslation(language, 'monthlyImprovement')}
                    </span>
                  </div>
                </div>

                {/* Score Progress Bars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-300">{getTranslation(language, 'cvQuality')}</span>
                      <span className="text-blue-400 font-mono font-bold">{scoreBreakdown.cvQuality} / 20</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(scoreBreakdown.cvQuality / 20) * 100}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-300">{getTranslation(language, 'experienceScore')}</span>
                      <span className="text-indigo-400 font-mono font-bold">{scoreBreakdown.experienceScore} / 15</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(scoreBreakdown.experienceScore / 15) * 100}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-300">{getTranslation(language, 'skillsMastery')}</span>
                      <span className="text-purple-400 font-mono font-bold">{scoreBreakdown.skillsScore} / 20</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(scoreBreakdown.skillsScore / 20) * 100}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-300">{getTranslation(language, 'languagesScore')}</span>
                      <span className="text-emerald-400 font-mono font-bold">{scoreBreakdown.languagesScore} / 10</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(scoreBreakdown.languagesScore / 10) * 100}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-300">{getTranslation(language, 'applicationsSubmitted')}</span>
                      <span className="text-amber-400 font-mono font-bold">{scoreBreakdown.applicationsScore} / 15</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(scoreBreakdown.applicationsScore / 15) * 100}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-300">{getTranslation(language, 'profileCompleteness')}</span>
                      <span className="text-rose-400 font-mono font-bold">{scoreBreakdown.profileCompleteness} / 10</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(scoreBreakdown.profileCompleteness / 10) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Income Prediction & AI Confidence Card */}
              <div className="p-6 rounded-[32px] bg-[#090914]/90 border border-white/10 backdrop-blur-2xl shadow-xl flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      <h3 className="font-extrabold text-base text-white">{getTranslation(language, 'incomePrediction')}</h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-bold">
                      {decisionEngine.aiConfidence}% {getTranslation(language, 'aiConfidence')}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                    <div className="text-xs text-slate-400">{getTranslation(language, 'targetMonthlyGoal')}</div>
                    <div className="text-xl font-bold text-white font-mono">${monthlyTarget.toLocaleString()} {getTranslation(language, 'perMonth')}</div>
                    <div className="text-xs text-slate-400 pt-2 border-t border-white/5">{getTranslation(language, 'aiPredictedMonthlyVelocity')}</div>
                    <div className="text-2xl font-black text-emerald-400 font-mono">
                      ${dailyWorkflow.estimatedMonthlyIncome.toLocaleString()} {getTranslation(language, 'perMonth')}
                    </div>
                    <div className="text-[10px] text-emerald-300 font-semibold mt-1">
                      {getTranslation(language, 'hiringProbabilityRate')}: {decisionEngine.hiringProbability}%
                    </div>
                  </div>
                </div>

                {onOpenAIAgent && (
                  <button
                    onClick={onOpenAIAgent}
                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs transition"
                  >
                    {getTranslation(language, 'viewAllDecisionInsights')}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ======================================================== */}
      {/* 2. TODAY'S DAILY SUCCESS MISSIONS */}
      {/* ======================================================== */}
      <TodaysSuccessDashboard
        user={user}
        language={language}
        onNavigateTab={onNavigateTab}
        onOpenLearning={onOpenLearning}
        onOpenAffiliateMarketplace={onOpenAffiliateMarketplace}
      />

      {/* ======================================================== */}
      {/* 3. INTERACTIVE INCOME & CAREER PROGRESS CHART */}
      {/* ======================================================== */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-[#090914]/90 border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                AI Trajectory & Income Analytics
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time projection based on completed daily missions and Firebase activity tracking
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/5 border border-white/10 text-xs">
            {(['7D', '30D', '6M'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setActiveChartPeriod(period)}
                className={`px-3 py-1 rounded-full font-bold transition ${
                  activeChartPeriod === period
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Visualization */}
        <div className="h-64 sm:h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={incomeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090914',
                  borderColor: 'rgba(255,255,255,0.15)',
                  borderRadius: '16px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#a855f7"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#actualGradient)"
                name="AI Actual Velocity"
              />
              <Area
                type="monotone"
                dataKey="target"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#targetGradient)"
                name="Target Target"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Actual Velocity
            </span>
            <span className="flex items-center gap-1.5 font-bold text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Target Roadmap
            </span>
          </div>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +14.2% Faster Growth
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. AI OPPORTUNITY CENTERS (JOB HUB, INCUBATOR, AFFILIATE) */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {getTranslation(language, 'aiOpportunitiesTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Tailored AI opportunities matching your skills ({userSkills}) and target location ({userCountry}).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 pt-2">
          {/* Card 1: Find Jobs */}
          <div 
            onClick={() => onNavigateTab('jobs')}
            className="group relative cursor-pointer p-6 sm:p-8 rounded-[32px] bg-white/[0.03] border border-white/10 hover:border-purple-500/40 hover:bg-white/[0.06] backdrop-blur-2xl transition-all duration-300 shadow-xl flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-105 transition-transform duration-300">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px] font-bold">
                  96% AI Match
                </div>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 tracking-tight group-hover:text-blue-300 transition-colors">
                {getTranslation(language, 'findJobsTitle')}
              </h3>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                {getTranslation(language, 'findJobsDesc')}
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
                Explore Remote Jobs
              </span>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </div>

          {/* Card 2: Business Incubator */}
          <div 
            onClick={() => onNavigateTab('business')}
            className="group relative cursor-pointer p-6 sm:p-8 rounded-[32px] bg-white/[0.03] border border-white/10 hover:border-purple-500/40 hover:bg-white/[0.06] backdrop-blur-2xl transition-all duration-300 shadow-xl flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-105 transition-transform duration-300">
                  <Rocket className="w-6 h-6" />
                </div>
                <div className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-bold">
                  Budget: ${userBudget}
                </div>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 tracking-tight group-hover:text-purple-300 transition-colors">
                {getTranslation(language, 'startBusinessTitle')}
              </h3>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                {getTranslation(language, 'startBusinessDesc')}
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
                Launch Business
              </span>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </div>

          {/* Card 3: Affiliate Marketplace */}
          <div 
            onClick={onOpenAffiliateMarketplace}
            className="group relative cursor-pointer p-6 sm:p-8 rounded-[32px] bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 hover:bg-white/[0.06] backdrop-blur-2xl transition-all duration-300 shadow-xl flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform duration-300">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-bold">
                  Up to 60% Payout
                </div>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 tracking-tight group-hover:text-emerald-300 transition-colors">
                {getTranslation(language, 'makeMoneyOnlineTitle')}
              </h3>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                {getTranslation(language, 'makeMoneyOnlineDesc')}
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
                View Affiliate Programs
              </span>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. SECONDARY SHORTCUTS (COMMUNITY & AFFILIATES) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Featured Affiliate Programs Preview */}
        <div className="p-6 rounded-[32px] bg-white/[0.03] border border-white/10 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                {getTranslation(language, 'featuredAffiliates')}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Hand-curated software & cloud tools with recurring affiliate payouts matched to your niche.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {affiliateOffers.slice(0, 2).map((offer) => (
                <div key={offer.id} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
                  <p className="font-bold text-slate-200">{offer.name}</p>
                  <p className="text-[10px] text-emerald-400 mt-0.5">{offer.commission}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onOpenAffiliateMarketplace}
            className="mt-4 w-full py-3 rounded-full bg-white/10 border border-white/10 text-white font-semibold text-xs hover:bg-white/20 transition flex items-center justify-center gap-1.5"
          >
            <span>Explore All Affiliate Programs</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Telegram Community */}
        <div className="p-6 rounded-[32px] bg-gradient-to-br from-blue-950/30 to-purple-950/20 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">
                  {getTranslation(language, 'telegramCommunity')}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-blue-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                12.4k Members
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Join our official Telegram network for instant remote job drops, live weekly coaching sessions, and founder networking.
            </p>
          </div>

          <button
            onClick={onOpenCommunity}
            className="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
          >
            <span>{getTranslation(language, 'joinTelegramButton')}</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
