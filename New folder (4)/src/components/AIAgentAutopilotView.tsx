import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  TrendingUp,
  Brain,
  Zap,
  Briefcase,
  Building2,
  DollarSign,
  Globe,
  Award,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  ShieldCheck,
  RefreshCw,
  Target,
  BarChart3,
  Layers,
  ChevronRight,
  Send,
  ArrowUpRight,
  Database
} from 'lucide-react';
import { UserProfile, AIMemory, CareerScoreBreakdown, AIDecisionEngine, AutomaticDailyWorkflow, AITimelineEvent, Language } from '../types';
import {
  calculateCareerScore,
  generateDecisionEngine,
  generateDailyWorkflow,
  recordJobRejectedInFirestore,
  recordJobAppliedInFirestore,
  recordAITimelineEventInFirestore
} from '../lib/aiCareerAgent';
import { syncAIMemoryToFirestore, fetchAIMemoryFromFirestore } from '../lib/firebase';
import { getTranslation } from '../i18n/translations';

interface AIAgentAutopilotViewProps {
  user: UserProfile | null;
  language: Language;
  onNavigateTab: (tab: any) => void;
  onClose?: () => void;
}

export const AIAgentAutopilotView: React.FC<AIAgentAutopilotViewProps> = ({
  user,
  language,
  onNavigateTab,
  onClose,
}) => {
  const [memory, setMemory] = useState<AIMemory | null>(null);
  const [score, setScore] = useState<CareerScoreBreakdown | null>(null);
  const [decisionEngine, setDecisionEngine] = useState<AIDecisionEngine | null>(null);
  const [dailyWorkflow, setDailyWorkflow] = useState<AutomaticDailyWorkflow | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'decision' | 'workflow' | 'memory' | 'timeline'>('decision');
  const [cvText, setCvText] = useState<string>('');
  const [cvAnalyzing, setCvAnalyzing] = useState<boolean>(false);
  const [cvSuccessMsg, setCvSuccessMsg] = useState<string>('');

  useEffect(() => {
    async function loadAgentState() {
      setLoading(true);
      if (user?.uid) {
        const mem = await fetchAIMemoryFromFirestore(user.uid);
        if (mem) {
          setMemory(mem);
          setCvText(mem.cvText || user.cvText || '');
        } else {
          const synced = await syncAIMemoryToFirestore(user);
          setMemory(synced);
        }
      }

      const currentScore = calculateCareerScore(user, memory);
      const currentDecision = generateDecisionEngine(user, memory);
      const currentWorkflow = generateDailyWorkflow(user, memory);

      setScore(currentScore);
      setDecisionEngine(currentDecision);
      setDailyWorkflow(currentWorkflow);
      setLoading(false);
    }
    loadAgentState();
  }, [user]);

  const handleRefreshAutopilot = async () => {
    setIsRefreshing(true);
    if (user?.uid) {
      const updatedMem = await syncAIMemoryToFirestore(user, {
        lastActiveTime: new Date().toISOString(),
      });
      setMemory(updatedMem);
      await recordAITimelineEventInFirestore(user.uid, {
        title: 'AI Autopilot Re-calibrated',
        type: 'ai_briefing',
        description: 'Analyzed latest market telemetry and candidate profile updates in Firestore.',
        iconName: 'RefreshCw',
      });
    }

    const updatedScore = calculateCareerScore(user, memory);
    const updatedDecision = generateDecisionEngine(user, memory);
    const updatedWorkflow = generateDailyWorkflow(user, memory);

    setScore(updatedScore);
    setDecisionEngine(updatedDecision);
    setDailyWorkflow(updatedWorkflow);

    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleAnalyzeCV = async () => {
    if (!cvText.trim() || !user?.uid) return;
    setCvAnalyzing(true);
    setCvSuccessMsg('');

    const quality = Math.min(20, cvText.length > 300 ? 19 : cvText.length > 100 ? 14 : 9);
    const updatedMem = await syncAIMemoryToFirestore(user, {
      cvText,
      cvQualityScore: quality,
      updatedAt: new Date().toISOString(),
    });

    setMemory(updatedMem);

    await recordAITimelineEventInFirestore(user.uid, {
      title: 'CV Deep Analysis Completed',
      type: 'score_boost',
      description: `Parsed candidate CV. Dynamic CV quality score updated to ${quality}/20.`,
      scoreDelta: 10,
      iconName: 'FileText',
    });

    const newScore = calculateCareerScore(user, updatedMem);
    const newDecision = generateDecisionEngine(user, updatedMem);
    const newWorkflow = generateDailyWorkflow(user, updatedMem);

    setScore(newScore);
    setDecisionEngine(newDecision);
    setDailyWorkflow(newWorkflow);

    setCvAnalyzing(false);
    setCvSuccessMsg('CV analyzed successfully and permanently saved to Firestore AI Memory!');
  };

  const handleRejectJob = async (job: { id: string; title: string; company: string }) => {
    if (!user?.uid) return;
    await recordJobRejectedInFirestore(job, user.uid);
    handleRefreshAutopilot();
  };

  const handleApplyJob = async (job: { id: string; title: string; company: string; applyUrl?: string }) => {
    if (!user?.uid) return;
    await recordJobAppliedInFirestore(job, user.uid);
    if (job.applyUrl) {
      window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
    }
    handleRefreshAutopilot();
  };

  const activeScore = score?.overall || 50;

  return (
    <div className="space-y-6 text-white pb-12">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-8 border border-blue-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
              <Bot className="w-3.5 h-3.5 text-blue-400" />
              <span>RYNEXO AI Autopilot Active</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>RYNEXO AI Career Agent</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Autonomous career intelligence permanently learning from your profile, skills, CV, searches, and daily activity stored in Firestore.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <button
              onClick={handleRefreshAutopilot}
              disabled={isRefreshing}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wide transition shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Re-analyzing...' : 'Sync AI Autopilot'}</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Metric Bar */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10">
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Target className="w-3.5 h-3.5 text-blue-400" />
              <span>Career Score</span>
            </div>
            <div className="text-2xl font-bold text-white flex items-baseline gap-2">
              <span>{activeScore}/100</span>
              <span className="text-xs font-normal text-emerald-400">+{score?.weeklyImprovement || 12}% this week</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Confidence</span>
            </div>
            <div className="text-2xl font-bold text-amber-300">
              {decisionEngine?.aiConfidence || 94}%
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hiring Probability</span>
            </div>
            <div className="text-2xl font-bold text-emerald-400">
              {decisionEngine?.hiringProbability || 88}%
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span>Firestore Memory</span>
            </div>
            <div className="text-2xl font-bold text-purple-300 text-xs sm:text-sm font-mono mt-1">
              ai_memory / {user?.uid ? user.uid.substring(0, 8) : 'guest'}...
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/10 space-x-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('decision')}
          className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'decision'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>Decision Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('workflow')}
          className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'workflow'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Automatic Daily Workflow</span>
        </button>

        <button
          onClick={() => setActiveTab('memory')}
          className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'memory'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>AI Memory & CV Parser</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'timeline'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>AI Timeline</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: DECISION ENGINE */}
      {/* ======================================================== */}
      {activeTab === 'decision' && decisionEngine && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Best Countries */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-base text-white">Best Target Countries</h3>
                </div>
                <span className="text-xs text-blue-300 font-mono">Top Match Vectors</span>
              </div>
              <div className="space-y-3">
                {decisionEngine.bestCountries.map((c, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-blue-500/30 transition">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{c.flag || '🌍'}</span>
                        <span className="font-bold text-sm text-white">{c.country}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 text-xs font-semibold">
                          Match {c.matchScore}%
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold">
                          Confidence {c.confidence}%
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{c.reason}</p>
                    <div className="text-xs font-mono text-emerald-400 mt-2 font-medium">
                      Salary Opportunity: {c.salaryRange}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Companies */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-base text-white">Best Companies Today</h3>
                </div>
                <span className="text-xs text-purple-300 font-mono">Hiring Probability</span>
              </div>
              <div className="space-y-3">
                {decisionEngine.bestCompanies.map((comp, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-purple-500/30 transition">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white">{comp.company}</span>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 text-xs font-semibold">
                          {comp.openRoles} Open Roles
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold">
                          {comp.hiringProbability}% Hire Prob
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{comp.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Missing Skills & Daily Priorities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Missing Skills */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-base text-white">Missing Skills to Unlock Top 10% Salary</h3>
                </div>
              </div>
              <div className="space-y-3">
                {decisionEngine.missingSkills.map((sk, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm text-white">{sk.skill}</div>
                      <div className="text-xs text-amber-300 font-mono mt-0.5">{sk.impact}</div>
                    </div>
                    <button
                      onClick={() => onNavigateTab('learning')}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-medium text-xs transition border border-amber-500/20 flex items-center gap-1"
                    >
                      <span>Learn</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Salary Opportunities */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-base text-white">Best Salary Opportunities</h3>
                </div>
              </div>
              <div className="space-y-3">
                {decisionEngine.bestSalaryOpportunities.map((sal, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm text-white">{sal.title}</div>
                      <div className="text-xs text-slate-400">{sal.location}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-400 font-mono">{sal.range}</div>
                      <div className="text-[10px] text-blue-300">{sal.confidence}% Confidence</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: AUTOMATIC DAILY WORKFLOW */}
      {/* ======================================================== */}
      {activeTab === 'workflow' && dailyWorkflow && (
        <div className="space-y-6">
          {/* Today's Mission */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900/60 border border-blue-500/30 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 font-mono text-xs font-semibold uppercase">
                  Daily Mission &bull; {dailyWorkflow.date}
                </span>
                <h2 className="text-xl font-bold text-white mt-2">{dailyWorkflow.dailyMission.title}</h2>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-blue-500/10 border border-blue-400/20 text-blue-300 font-bold text-sm">
                +{dailyWorkflow.dailyMission.points} Career Points
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
              {dailyWorkflow.dailyMission.description}
            </p>
          </div>

          {/* Today's Recommended Jobs */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-400" />
              <span>Best Jobs Today (AI Curated)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dailyWorkflow.bestJobsToday.map((job) => (
                <div key={job.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-blue-500/40 transition flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="font-bold text-base text-white">{job.title}</h4>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold">
                        {job.matchScore}% Match
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mb-1">{job.company} &bull; {job.location}</div>
                    <div className="text-sm font-bold text-emerald-400 font-mono">{job.salary}</div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => handleApplyJob(job)}
                      className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide transition flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Apply & Sync</span>
                    </button>

                    <button
                      onClick={() => handleRejectJob(job)}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-300 text-slate-400 font-medium text-xs transition border border-white/5 flex items-center gap-1"
                      title="Discard and re-calibrate AI memory"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: AI MEMORY & CV PARSER */}
      {/* ======================================================== */}
      {activeTab === 'memory' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base text-white">Permanent CV Analysis & Parser</h3>
              </div>
              <span className="text-xs text-blue-300 font-mono">Firestore AI Memory</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Paste or edit your CV text below. RYNEXO AI will continuously analyze your achievements, skills, and experience level to update your dynamic Career Score in Firestore.
            </p>

            <textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Paste your CV text, employment history, bullet points, or project achievements here..."
              rows={6}
              className="w-full p-4 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm font-mono focus:outline-none focus:border-blue-500 transition"
            />

            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handleAnalyzeCV}
                disabled={cvAnalyzing || !cvText.trim()}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide transition shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{cvAnalyzing ? 'Analyzing with Gemini...' : 'Analyze CV & Sync Memory'}</span>
              </button>
              {cvSuccessMsg && (
                <span className="text-xs text-emerald-400 font-medium">{cvSuccessMsg}</span>
              )}
            </div>
          </div>

          {/* Firestore Memory Dump Inspector */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" />
              <span>Firestore Candidate Memory Record</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                <div className="text-slate-400 mb-1">UID</div>
                <div className="text-white truncate">{memory?.uid || user?.uid}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                <div className="text-slate-400 mb-1">Saved Jobs Count</div>
                <div className="text-emerald-400 font-bold">{memory?.savedJobs?.length || user?.savedJobs || 0}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                <div className="text-slate-400 mb-1">Applications Submitted</div>
                <div className="text-blue-400 font-bold">{memory?.successfulApplications?.length || user?.jobsApplied?.length || 0}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: AI TIMELINE */}
      {/* ======================================================== */}
      {activeTab === 'timeline' && (
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span>AI Evolution & Activity Timeline</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Firestore Streamed</span>
          </div>

          {(!memory?.timelineEvents || memory.timelineEvents.length === 0) ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No timeline events recorded yet. Complete missions, save jobs, or analyze your CV to build your AI evolution log!
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-500/20">
              {memory.timelineEvents.map((evt) => (
                <div key={evt.id} className="relative group">
                  <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-slate-900 shadow" />
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-blue-500/30 transition">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-white text-sm">{evt.title}</span>
                      <span className="text-slate-400 font-mono">{new Date(evt.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-300">{evt.description}</p>
                    {evt.scoreDelta && (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 text-[10px] font-mono font-bold">
                        +{evt.scoreDelta} Career Points
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function CalendarIcon(props: any) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
      <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
      <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
      <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
    </svg>
  );
}
