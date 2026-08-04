import React, { useState, useEffect } from 'react';
import {
  Award,
  TrendingUp,
  Briefcase,
  Rocket,
  GraduationCap,
  RefreshCw,
  CheckSquare,
  Square,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Calendar,
  History,
  CheckCircle2,
  User,
  ExternalLink,
} from 'lucide-react';
import { Language, UserProfile, AIReadinessReport, NextActionItem, WeeklyChallengeItem } from '../types';
import { getTranslation } from '../i18n/translations';
import { saveAIReadinessReportToFirestore, fetchAIReadinessHistoryFromFirestore, fetchUserProfileFromFirestore } from '../lib/firebase';

interface AIReadinessViewProps {
  user: UserProfile | null;
  language: Language;
  onOpenProfile?: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const AIReadinessView: React.FC<AIReadinessViewProps> = ({
  user,
  language,
  onOpenProfile,
  onNavigateTab,
}) => {
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(user);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AIReadinessReport | null>(null);
  const [history, setHistory] = useState<AIReadinessReport[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Sync fresh profile from Firebase
  useEffect(() => {
    async function loadProfileAndReports() {
      let activeUser = user;
      if (user?.uid) {
        const fresh = await fetchUserProfileFromFirestore(user.uid);
        if (fresh) {
          activeUser = fresh;
          setCurrentUserProfile(fresh);
        }
      }

      // Load saved reports history
      const savedHistory = await fetchAIReadinessHistoryFromFirestore(activeUser?.uid);
      setHistory(savedHistory);

      if (savedHistory.length > 0) {
        setReport(savedHistory[0]);
      } else {
        // Generate initial report
        generateReport(activeUser);
      }
    }

    loadProfileAndReports();
  }, [user]);

  const generateReport = async (profileToUse: UserProfile | null = currentUserProfile) => {
    setLoading(true);
    try {
      const prevOverall = report ? report.overallScore : undefined;
      const response = await fetch('/api/ai/readiness-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile: profileToUse,
          previousScore: prevOverall,
          language,
        }),
      });

      const data = await response.json();
      if (data.success && data.report) {
        const newReport: AIReadinessReport = data.report;
        setReport(newReport);

        // Save to Firebase Firestore & local storage
        await saveAIReadinessReportToFirestore(newReport, profileToUse?.uid);

        // Update local history
        setHistory((prev) => [newReport, ...prev.filter((r) => r.id !== newReport.id)]);
      }
    } catch (err) {
      console.error('Failed to generate AI Readiness Report:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleActionItem = async (actionId: string) => {
    if (!report) return;
    const updatedActions = report.nextBestActions.map((item) =>
      item.id === actionId ? { ...item, completed: !item.completed } : item
    );

    // Calculate score boost if completed
    const completedCount = updatedActions.filter((a) => a.completed).length;
    const boost = completedCount * 2;
    const updatedReport: AIReadinessReport = {
      ...report,
      nextBestActions: updatedActions,
      overallScore: Math.min(100, (report.overallScore || 75) + (boost > 0 ? 1 : 0)),
    };

    setReport(updatedReport);
    await saveAIReadinessReportToFirestore(updatedReport, currentUserProfile?.uid);
  };

  const toggleWeeklyChallenge = async (challengeId: string) => {
    if (!report) return;
    const updatedChallenges = report.weeklyChallenges.map((item) =>
      item.id === challengeId ? { ...item, completed: !item.completed } : item
    );

    const completedCount = updatedChallenges.filter((c) => c.completed).length;
    const bonus = completedCount * 2;
    const updatedReport: AIReadinessReport = {
      ...report,
      weeklyChallenges: updatedChallenges,
      learningProgressScore: Math.min(100, Math.max(50, (report.learningProgressScore || 70) + (bonus > 0 ? 1 : 0))),
    };

    setReport(updatedReport);
    await saveAIReadinessReportToFirestore(updatedReport, currentUserProfile?.uid);
  };

  const completedChallengesCount = report?.weeklyChallenges.filter((c) => c.completed).length || 0;
  const totalChallengesCount = report?.weeklyChallenges.length || 5;

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-purple-950/40 via-slate-900/80 to-blue-950/40 border border-white/10 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>RYNEXO Intelligence Center</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              AI Readiness Report
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-2 leading-relaxed">
              Personalized career, business, and income acceleration scores calculated dynamically from your verified profile attributes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => generateReport()}
              disabled={loading}
              className="px-5 py-3 rounded-full bg-white text-black font-bold text-xs hover:bg-slate-200 transition flex items-center gap-2 shadow-xl disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-purple-600 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Analyzing Profile...' : 'Re-Analyze Profile'}</span>
            </button>

            <button
              onClick={() => setShowHistoryModal(true)}
              className="px-4 py-3 rounded-full bg-white/10 border border-white/15 text-white font-semibold text-xs hover:bg-white/20 transition flex items-center gap-2"
            >
              <History className="w-4 h-4 text-blue-400" />
              <span>Score History</span>
            </button>
          </div>
        </div>

        {/* Profile Basis Banner */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-slate-400 block font-medium">Location</span>
            <span className="font-bold text-slate-200 truncate block">
              {currentUserProfile?.city || 'Global'}, {currentUserProfile?.country || 'Remote'}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-slate-400 block font-medium">Profession</span>
            <span className="font-bold text-slate-200 truncate block">
              {currentUserProfile?.profession || 'General Professional'}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-slate-400 block font-medium">Skills ({currentUserProfile?.skills?.length || 0})</span>
            <span className="font-bold text-slate-200 truncate block">
              {currentUserProfile?.skills?.slice(0, 2).join(', ') || 'Digital Marketing'}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-slate-400 block font-medium">Experience</span>
            <span className="font-bold text-slate-200 capitalize truncate block">
              {currentUserProfile?.experienceLevel || 'Intermediate'}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-slate-400 block font-medium">Monthly Budget</span>
            <span className="font-bold text-emerald-400 truncate block">
              ${currentUserProfile?.availableBudgetUSD || 250} USD
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Career Goal</span>
              <span className="font-bold text-purple-300 truncate block max-w-[90px]">
                {currentUserProfile?.monthlyGoalUSD ? `$${currentUserProfile.monthlyGoalUSD}/mo` : 'Growth'}
              </span>
            </div>
            {onOpenProfile && (
              <button
                onClick={onOpenProfile}
                className="text-[10px] text-blue-400 font-bold hover:underline"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary Progress Tracking Header Card */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/15 text-white font-extrabold text-3xl shadow-inner">
              <span>{report?.overallScore || 85}</span>
              <span className="text-xs text-slate-400 font-normal absolute bottom-2">/ 100</span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg sm:text-xl font-bold text-white">Overall Readiness Score</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                  Active Analysis
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                <span>
                  Previous: <strong className="text-slate-200">{report?.previousOverallScore || 78}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+{report?.progressPercentage || 7.0}% Progress</span>
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  Last Analysis: {report?.createdAt ? new Date(report.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'}
                </span>
              </p>
            </div>
          </div>

          <div className="max-w-md bg-white/5 border border-white/10 p-4 rounded-2xl text-xs text-slate-300 leading-relaxed">
            <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400 block mb-1">
              AI Insight Executive Summary
            </span>
            <p className="italic">
              "{report?.analysisSummary || 'Your profile exhibits strong technical alignment for global remote positions and high-margin online business expansion.'}"
            </p>
          </div>
        </div>
      </div>

      {/* 4 Premium Score Cards Grid */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-4">
          Core Readiness Breakdown
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Career Readiness */}
          <div className="p-6 rounded-[28px] bg-white/[0.03] border border-white/10 hover:border-white/20 transition backdrop-blur-xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-white">
                {report?.careerReadinessScore || 82} <span className="text-xs text-slate-500 font-normal">/100</span>
              </span>
            </div>

            <h3 className="text-sm font-bold text-white mb-1">Career Readiness</h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Qualification level for high-paying global remote roles.
            </p>

            {/* Visual Progress Meter */}
            <div className="w-full bg-white/10 rounded-full h-2 mb-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-400 h-2 rounded-full transition-all duration-700"
                style={{ width: `${report?.careerReadinessScore || 82}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>Status</span>
              <span className="text-blue-300">Remote Qualified</span>
            </div>
          </div>

          {/* Card 2: Business Readiness */}
          <div className="p-6 rounded-[28px] bg-white/[0.03] border border-white/10 hover:border-white/20 transition backdrop-blur-xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Rocket className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-white">
                {report?.businessReadinessScore || 78} <span className="text-xs text-slate-500 font-normal">/100</span>
              </span>
            </div>

            <h3 className="text-sm font-bold text-white mb-1">Business Readiness</h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Preparedness to build and scale an online business model.
            </p>

            {/* Visual Progress Meter */}
            <div className="w-full bg-white/10 rounded-full h-2 mb-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-400 h-2 rounded-full transition-all duration-700"
                style={{ width: `${report?.businessReadinessScore || 78}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>Capital & Skills</span>
              <span className="text-purple-300">Scalable Strategy</span>
            </div>
          </div>

          {/* Card 3: Income Potential */}
          <div className="p-6 rounded-[28px] bg-white/[0.03] border border-white/10 hover:border-white/20 transition backdrop-blur-xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-white">
                {report?.incomePotentialScore || 88} <span className="text-xs text-slate-500 font-normal">/100</span>
              </span>
            </div>

            <h3 className="text-sm font-bold text-white mb-1">Income Potential</h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Market demand multiplier for your skill stack and goals.
            </p>

            {/* Visual Progress Meter */}
            <div className="w-full bg-white/10 rounded-full h-2 mb-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-700"
                style={{ width: `${report?.incomePotentialScore || 88}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>Goal Feasibility</span>
              <span className="text-emerald-300">High Growth</span>
            </div>
          </div>

          {/* Card 4: Learning Progress */}
          <div className="p-6 rounded-[28px] bg-white/[0.03] border border-white/10 hover:border-white/20 transition backdrop-blur-xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-white">
                {report?.learningProgressScore || 80} <span className="text-xs text-slate-500 font-normal">/100</span>
              </span>
            </div>

            <h3 className="text-sm font-bold text-white mb-1">Learning Progress</h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Skill iteration rate and masterclass execution consistency.
            </p>

            {/* Visual Progress Meter */}
            <div className="w-full bg-white/10 rounded-full h-2 mb-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-400 h-2 rounded-full transition-all duration-700"
                style={{ width: `${report?.learningProgressScore || 80}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>Skill Velocity</span>
              <span className="text-amber-300">Continuous Growth</span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Best Action & Weekly Challenges Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Best Action Section */}
        <div className="p-6 sm:p-8 rounded-[32px] bg-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Next Best Actions
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Tailored execution plan
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Execute these personalized high-priority steps to close key profile gaps and accelerate your readiness score.
            </p>

            <div className="space-y-3">
              {report?.nextBestActions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleActionItem(item.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    item.completed
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-400 line-through'
                      : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-200'
                  }`}
                >
                  <button className="mt-0.5 shrink-0 text-purple-400 hover:text-purple-300">
                    {item.completed ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  <div className="flex-1">
                    <p className="text-xs font-semibold leading-snug">{item.action}</p>
                    {item.priority && (
                      <span
                        className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          item.priority === 'High'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {item.priority} Priority
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Completed Actions:{' '}
              <strong className="text-white">
                {report?.nextBestActions.filter((a) => a.completed).length || 0} / {report?.nextBestActions.length || 5}
              </strong>
            </span>
            <span className="text-emerald-400 font-semibold">+Score Boost Active</span>
          </div>
        </div>

        {/* Weekly Challenges Section */}
        <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-br from-purple-950/20 via-slate-900/60 to-slate-900/80 border border-white/10 backdrop-blur-2xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Weekly Challenges
                </h3>
              </div>
              <span className="text-xs font-bold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                Weekly Sprint
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Complete these 5 weekly targets to continuously upgrade your scores and keep your momentum high.
            </p>

            {/* Completion Progress Bar */}
            <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex justify-between items-center text-xs font-bold text-white mb-2">
                <span>Sprint Progress</span>
                <span className="text-purple-300">
                  {completedChallengesCount} of {totalChallengesCount} Completed
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-emerald-400 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${(completedChallengesCount / totalChallengesCount) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {report?.weeklyChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  onClick={() => toggleWeeklyChallenge(challenge.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    challenge.completed
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-400'
                      : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button className="text-purple-400">
                      {challenge.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                    <span className={`text-xs font-semibold ${challenge.completed ? 'line-through' : ''}`}>
                      {challenge.title}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    +{challenge.points || 20} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-400">Sprint resets every Monday</span>
            <button
              onClick={() => onNavigateTab && onNavigateTab('jobs')}
              className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
            >
              <span>Find Matching Opportunities</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0e0f17] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Score History & Logs</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                Close
              </button>
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No previous score analysis logs found.
              </p>
            ) : (
              <div className="space-y-4">
                {history.map((hReport, idx) => (
                  <div
                    key={hReport.id || idx}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">
                        Overall Score: <span className="text-purple-300 text-sm">{hReport.overallScore}/100</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {new Date(hReport.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <div className="text-right text-[11px] text-slate-300 space-y-0.5">
                      <p>Career: <span className="text-blue-400 font-bold">{hReport.careerReadinessScore}</span></p>
                      <p>Business: <span className="text-purple-400 font-bold">{hReport.businessReadinessScore}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
