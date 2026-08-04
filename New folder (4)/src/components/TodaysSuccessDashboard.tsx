import React, { useState, useEffect } from 'react';
import {
  Flame,
  Zap,
  Target,
  Trophy,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Award,
  Calendar,
  DollarSign,
  Briefcase,
  Rocket,
  BookOpen,
  Share2,
  ChevronRight,
  RefreshCw,
  Clock,
  ShieldCheck,
  Check,
  Lock,
  ArrowRight,
  Globe,
  Star,
  Compass,
  BarChart3,
  Bot,
} from 'lucide-react';
import {
  Language,
  UserProfile,
  DailySuccessProgress,
  DailyMission,
  OpportunityRecommendation,
  AchievementBadge,
} from '../types';
import { getTranslation } from '../i18n/translations';
import { TabType } from './BottomNav';
import {
  getInitialSuccessProgress,
  getTodayDateString,
  getTodayMissionForUser,
  getTodayOpportunities,
  getTodayMotivationMessage,
} from '../data/dailyMissionsData';
import {
  saveDailySuccessProgressToFirestore,
  fetchDailySuccessProgressFromFirestore,
  recordMissionCompletedInFirestore,
} from '../lib/firebase';

interface TodaysSuccessDashboardProps {
  user: UserProfile | null;
  language: Language;
  onNavigateTab: (tab: TabType) => void;
  onOpenLearning?: () => void;
  onOpenAffiliateMarketplace?: () => void;
}

export const TodaysSuccessDashboard: React.FC<TodaysSuccessDashboardProps> = ({
  user,
  language,
  onNavigateTab,
  onOpenLearning,
  onOpenAffiliateMarketplace,
}) => {
  const [progress, setProgress] = useState<DailySuccessProgress>(() =>
    getInitialSuccessProgress(user)
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showIncomeModal, setShowIncomeModal] = useState<boolean>(false);
  const [newIncomeVal, setNewIncomeVal] = useState<number>(progress.currentMonthlyIncomeUSD);
  const [newGoalVal, setNewGoalVal] = useState<number>(progress.monthlyGoalIncomeUSD);

  // Load progress from Firestore on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const remote = await fetchDailySuccessProgressFromFirestore(user?.uid);
      if (remote) {
        // Check if date has changed for today's mission
        const todayStr = getTodayDateString();
        if (remote.todayMission && remote.todayMission.date !== todayStr) {
          const freshMission = getTodayMissionForUser(user);
          remote.todayMission = freshMission;
          remote.dailyMotivationText = getTodayMotivationMessage(user, remote.currentStreak);
          remote.dailyMotivationDate = todayStr;
        }
        setProgress(remote);
      } else {
        // Initialize fresh state
        const initial = getInitialSuccessProgress(user);
        setProgress(initial);
        await saveDailySuccessProgressToFirestore(initial);
      }
      setLoading(false);
    }
    loadData();
  }, [user]);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Complete Today's Mission
  const handleCompleteMission = async () => {
    if (progress.todayMission.completed) return;

    const todayStr = getTodayDateString();
    const updatedMission: DailyMission = {
      ...progress.todayMission,
      completed: true,
      completedAt: new Date().toISOString(),
    };

    const newCurrentStreak = progress.currentStreak + 1;
    const newBestStreak = Math.max(progress.bestStreak, newCurrentStreak);
    const newDaysCompleted = progress.daysCompletedCount + 1;
    const newWeeklyDays = Math.min(7, progress.weeklyCompletedDays + 1);
    const newMonthlyDays = Math.min(30, progress.monthlyCompletedDays + 1);

    // Check Badge Unlocks
    const updatedAchievements = progress.achievements.map((ach) => {
      if (ach.id === 'badge_first_mission' && !ach.unlocked) {
        return { ...ach, unlocked: true, unlockedAt: new Date().toISOString() };
      }
      if (ach.id === 'badge_7day_streak' && newCurrentStreak >= 7 && !ach.unlocked) {
        return { ...ach, unlocked: true, unlockedAt: new Date().toISOString() };
      }
      if (ach.id === 'badge_30day_streak' && newCurrentStreak >= 30 && !ach.unlocked) {
        return { ...ach, unlocked: true, unlockedAt: new Date().toISOString() };
      }
      return ach;
    });

    const updatedProgress: DailySuccessProgress = {
      ...progress,
      currentStreak: newCurrentStreak,
      bestStreak: newBestStreak,
      daysCompletedCount: newDaysCompleted,
      weeklyCompletedDays: newWeeklyDays,
      monthlyCompletedDays: newMonthlyDays,
      lastCompletedDate: todayStr,
      todayMission: updatedMission,
      completedMissionIds: [...progress.completedMissionIds, updatedMission.id],
      achievements: updatedAchievements,
      updatedAt: new Date().toISOString(),
    };

    setProgress(updatedProgress);
    await saveDailySuccessProgressToFirestore(updatedProgress);
    if (user?.uid) {
      await recordMissionCompletedInFirestore(updatedMission.id, user.uid);
    }

    showToast(`🎉 Mission Completed! Streak increased to ${newCurrentStreak} Days! Data saved to Firestore.`);
  };

  // Update Income Progress
  const handleSaveIncomeGoal = async () => {
    const updated: DailySuccessProgress = {
      ...progress,
      currentMonthlyIncomeUSD: Number(newIncomeVal),
      monthlyGoalIncomeUSD: Number(newGoalVal),
      updatedAt: new Date().toISOString(),
    };
    setProgress(updated);
    await saveDailySuccessProgressToFirestore(updated);
    setShowIncomeModal(false);
    showToast('Income goal and progress updated in Firestore!');
  };

  // Handle Opportunity Click
  const handleOpportunityClick = (opp: OpportunityRecommendation) => {
    if (opp.actionTab === 'learning' && onOpenLearning) {
      onOpenLearning();
    } else if (opp.actionTab === 'affiliates' && onOpenAffiliateMarketplace) {
      onOpenAffiliateMarketplace();
    } else {
      onNavigateTab(opp.actionTab);
    }
  };

  // Percentages Calculations
  const todayProgressPercent = progress.todayMission.completed ? 100 : 0;
  const weeklyProgressPercent = Math.round((progress.weeklyCompletedDays / 7) * 100);
  const monthlyProgressPercent = Math.round((progress.monthlyCompletedDays / 30) * 100);
  const incomeProgressPercent = Math.min(
    100,
    Math.round((progress.currentMonthlyIncomeUSD / Math.max(1, progress.monthlyGoalIncomeUSD)) * 100)
  );
  const overallSuccessRate = Math.round(
    (todayProgressPercent * 0.2 + weeklyProgressPercent * 0.4 + monthlyProgressPercent * 0.4)
  );

  return (
    <div className="space-y-8 text-left animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl bg-emerald-500 text-black font-extrabold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-black" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER HERO BANNER */}
      <div className="p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] bg-gradient-to-br from-[#0e0f1a] via-[#15112e] to-[#090b14] border border-white/10 backdrop-blur-2xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-widest">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{getTranslation(language, 'dailySuccessSystem')}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {getTranslation(language, 'todaysSuccessDashboard')}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              {getTranslation(language, 'executeDailyMission')}
            </p>

            {/* AI Motivation Quote */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-3 mt-4">
              <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block">
                  {getTranslation(language, 'dailyAiMotivation')}
                </span>
                <p className="text-xs font-semibold text-slate-200 leading-relaxed">
                  "{progress.dailyMotivationText}"
                </p>
              </div>
            </div>
          </div>

          {/* Quick Streak Widget */}
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shrink-0 flex flex-col items-center justify-center text-center space-y-2 min-w-[200px]">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Flame className="w-8 h-8 text-amber-400 fill-amber-400 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {getTranslation(language, 'currentStreak')}
              </span>
              <p className="text-3xl font-black text-white">{progress.currentStreak} {getTranslation(language, 'days')}</p>
            </div>
            <span className="text-[10px] font-medium text-amber-300/90 bg-amber-500/10 px-3 py-0.5 rounded-full border border-amber-500/20">
              {getTranslation(language, 'personalBest')}: {progress.bestStreak} {getTranslation(language, 'days')}
            </span>
          </div>
        </div>
      </div>

      {/* TODAY'S MISSION CARD (PRIMARY FOCUS) */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-br from-[#0e0d18] to-[#090a12] border border-purple-500/30 backdrop-blur-xl shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">{getTranslation(language, 'todaysMission')}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase">
                  {getTranslation(language, 'dailyPriority')}
                </span>
              </div>
              <p className="text-xs text-slate-400">{getTranslation(language, 'personalizedSkillsGoals')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>{getTranslation(language, 'estMins')} {progress.todayMission.estimatedMinutes} {getTranslation(language, 'mins')}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/10">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                {progress.todayMission.category}
              </span>
              <span className="text-[11px] text-slate-400">{getTranslation(language, 'date')}: {progress.todayMission.date}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {progress.todayMission.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {progress.todayMission.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {progress.todayMission.actionTab && (
              <button
                onClick={() => handleOpportunityClick({
                  id: 'action',
                  type: 'Job',
                  title: '',
                  subtitle: '',
                  matchScore: 100,
                  reason: '',
                  tags: [],
                  actionTab: progress.todayMission.actionTab!,
                })}
                className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 transition flex items-center justify-center gap-2"
              >
                <span>{getTranslation(language, 'executeMission')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleCompleteMission}
              disabled={progress.todayMission.completed}
              className={`px-6 py-3.5 rounded-2xl font-extrabold text-xs tracking-wide transition shadow-xl flex items-center justify-center gap-2.5 ${
                progress.todayMission.completed
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 cursor-default'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {progress.todayMission.completed ? getTranslation(language, 'missionCompletedToday') : getTranslation(language, 'completeTodaysMission')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* SUCCESS STREAK & PROGRESS ENGINE (METRICS GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Current Streak */}
        <div className="p-6 rounded-[28px] bg-[#0c0d15] border border-white/10 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {getTranslation(language, 'currentStreak')}
            </span>
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-white">{progress.currentStreak} {getTranslation(language, 'days')}</p>
            <p className="text-xs text-slate-400">
              {progress.currentStreak === 0
                ? getTranslation(language, 'startFirstMissionToday')
                : `${getTranslation(language, 'bestRecord')}: ${progress.bestStreak} ${getTranslation(language, 'days')}`}
            </p>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (progress.currentStreak / 30) * 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Weekly Progress */}
        <div className="p-6 rounded-[28px] bg-[#0c0d15] border border-white/10 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {getTranslation(language, 'weeklyProgress')}
            </span>
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-white">
              {progress.weeklyCompletedDays === 0 ? '0%' : `${progress.weeklyCompletedDays} / 7 ${getTranslation(language, 'days')}`}
            </p>
            <p className="text-xs text-slate-400">
              {progress.weeklyCompletedDays === 0
                ? getTranslation(language, 'completeTodaysMissionToBegin')
                : `${weeklyProgressPercent}% ${getTranslation(language, 'weeklyTargetAchieved')}`}
            </p>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${weeklyProgressPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Monthly Progress */}
        <div className="p-6 rounded-[28px] bg-[#0c0d15] border border-white/10 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Monthly Progress
            </span>
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-white">
              {progress.monthlyCompletedDays === 0 ? '0%' : `${progress.monthlyCompletedDays} / 30 Days`}
            </p>
            <p className="text-xs text-slate-400">
              {progress.monthlyCompletedDays === 0
                ? 'Your progress will appear after completing missions.'
                : `${monthlyProgressPercent}% Monthly Consistency`}
            </p>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className="bg-purple-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${monthlyProgressPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Monthly Income Goal */}
        <div className="p-6 rounded-[28px] bg-[#0c0d15] border border-white/10 space-y-3 relative flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Income Goal Progress
            </span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          {progress.monthlyGoalIncomeUSD === 0 ? (
            <div className="space-y-2">
              <p className="text-xl font-black text-slate-300">No goal set yet.</p>
              <button
                onClick={() => setShowIncomeModal(true)}
                className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition shadow-md"
              >
                Set My Income Goal
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-2xl font-black text-emerald-400">
                ${progress.currentMonthlyIncomeUSD.toLocaleString()} / ${progress.monthlyGoalIncomeUSD.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400">{incomeProgressPercent}% Income Goal Met</p>
              <button
                onClick={() => setShowIncomeModal(true)}
                className="text-[10px] text-purple-300 font-bold hover:underline block pt-1"
              >
                Update Income Goal →
              </button>
            </div>
          )}
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-1">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${incomeProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* TODAY'S OPPORTUNITIES RECOMMENDATIONS */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-[#0c0d15] border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-purple-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Today's Opportunities</h2>
              <p className="text-xs text-slate-400">Curated daily opportunities matched to your skills & location</p>
            </div>
          </div>

          <span className="text-[11px] px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold">
            5 Curated Recommendations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {progress.opportunities.map((opp) => (
            <div
              key={opp.id}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-bold uppercase">
                    Best {opp.type}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    {opp.matchScore}% Match
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">{opp.title}</h3>
                <p className="text-xs font-semibold text-purple-300">{opp.subtitle}</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">{opp.reason}</p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {opp.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-slate-300 text-[10px]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleOpportunityClick(opp)}
                className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <span>View Opportunity</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ACHIEVEMENTS & BADGES SECTION */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-[#0c0d15] border border-white/10 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Achievements & Badges</h2>
              <p className="text-xs text-slate-400">
                {progress.achievements.filter((a) => a.unlocked).length === 0
                  ? 'No achievements unlocked yet. Complete your first mission to unlock your first badge.'
                  : 'Unlock milestone badges as you complete daily missions'}
              </p>
            </div>
          </div>

          <span className="text-[11px] text-amber-300 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            {progress.achievements.filter((a) => a.unlocked).length} / {progress.achievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {progress.achievements.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border text-center space-y-2 flex flex-col items-center justify-center transition-all ${
                badge.unlocked
                  ? 'bg-amber-500/10 border-amber-500/30 text-white shadow-lg'
                  : 'bg-white/[0.02] border-white/5 text-slate-500 opacity-60'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  badge.unlocked
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                    : 'bg-white/5 text-slate-600'
                }`}
              >
                {badge.unlocked ? <Trophy className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>

              <div className="space-y-0.5">
                <h3 className="text-[11px] font-bold leading-tight">{badge.title}</h3>
                <p className="text-[9px] text-slate-400 leading-tight line-clamp-2">
                  {badge.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* UPDATE INCOME MODAL */}
      {showIncomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0f111a] border border-white/15 p-6 rounded-3xl max-w-md w-full space-y-5 text-left shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Update Monthly Income Goal</span>
              </h3>
              <button
                onClick={() => setShowIncomeModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Current Monthly Income (USD)
                </label>
                <input
                  type="number"
                  value={newIncomeVal}
                  onChange={(e) => setNewIncomeVal(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Monthly Income Goal (USD)
                </label>
                <input
                  type="number"
                  value={newGoalVal}
                  onChange={(e) => setNewGoalVal(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowIncomeModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveIncomeGoal}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg"
              >
                Save Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
