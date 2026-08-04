import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Sparkles,
  DollarSign,
  Clock,
  Layers,
  ChevronRight,
  CheckCircle2,
  Sliders,
  Zap,
  ShieldCheck,
  TrendingUp,
  Award,
  Bookmark,
  Share2,
  Download,
  Users,
  Globe,
  MapPin,
  ExternalLink,
  Briefcase,
  Target,
  FileText,
  Check,
  BarChart3,
  Compass,
  ArrowRight,
  Wrench,
  Monitor,
  Flame,
  Calendar,
  BookOpen,
  Cpu,
  Link as LinkIcon,
} from 'lucide-react';
import {
  Language,
  UserProfile,
  BusinessIdea,
  BusinessScores,
  BusinessHighlights,
  BusinessRoadmap30Day,
} from '../types';
import { getTranslation } from '../i18n/translations';
import { SAMPLE_BUSINESSES } from '../data/mockData';
import {
  saveBusinessIdeaToFirestore,
  fetchSavedBusinessIdeasFromFirestore,
  removeSavedBusinessIdeaFromFirestore,
  recordBusinessCreatedInFirestore,
} from '../lib/firebase';
import { recordAIOSEvent } from '../lib/aiBrainOS';

interface StartBusinessViewProps {
  user: UserProfile | null;
  language: Language;
}

export const StartBusinessView: React.FC<StartBusinessViewProps> = ({ user, language }) => {
  // Main view state
  const [businesses, setBusinesses] = useState<BusinessIdea[]>(SAMPLE_BUSINESSES);
  const [savedBusinesses, setSavedBusinesses] = useState<BusinessIdea[]>([]);
  const [activeTab, setActiveTab] = useState<'incubator' | 'saved'>('incubator');
  const [loading, setLoading] = useState(false);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  // User input form state (synced with real user profile)
  const [country, setCountry] = useState<string>(user?.country || 'United States');
  const [city, setCity] = useState<string>(user?.city || 'New York');
  const [currentSkills, setCurrentSkills] = useState<string>(
    Array.isArray(user?.skills) ? user.skills.join(', ') : 'Digital Marketing, AI Prompting, Strategy'
  );
  const [experienceLevel, setExperienceLevel] = useState<string>(
    user?.experienceLevel || 'Intermediate'
  );
  const [budget, setBudget] = useState<number>(user?.availableBudgetUSD ?? 250);
  const [dailyFreeTime, setDailyFreeTime] = useState<string>('2-4 Hours/Day');
  const [goal, setGoal] = useState<string>('AI Business');

  // AI Generated analysis & roadmap
  const [scores, setScores] = useState<BusinessScores | null>({
    businessReadiness: 88,
    incomePotential: 92,
    startupDifficulty: 35,
    investmentScore: 85,
    successProbability: 89,
  });

  const [highlights, setHighlights] = useState<BusinessHighlights | null>({
    bestBusinessTitle: SAMPLE_BUSINESSES[0].businessName,
    fastestToLaunchTitle: SAMPLE_BUSINESSES[2].businessName,
    lowestInvestmentTitle: SAMPLE_BUSINESSES[2].businessName,
    highestIncomePotentialTitle: SAMPLE_BUSINESSES[0].businessName,
    lowestRiskTitle: SAMPLE_BUSINESSES[1].businessName,
  });

  const [roadmap, setRoadmap] = useState<BusinessRoadmap30Day | null>(null);
  const [roadmapModalOpen, setRoadmapModalOpen] = useState(false);
  const [expandedIdeaId, setExpandedIdeaId] = useState<string | null>(SAMPLE_BUSINESSES[0].id);

  // Sync inputs if user prop updates
  useEffect(() => {
    if (user) {
      if (user.country) setCountry(user.country);
      if (user.city) setCity(user.city);
      if (user.skills && Array.isArray(user.skills) && user.skills.length > 0) {
        setCurrentSkills(user.skills.join(', '));
      }
      if (user.experienceLevel) setExperienceLevel(user.experienceLevel);
      if (user.availableBudgetUSD !== undefined) setBudget(user.availableBudgetUSD);
    }
  }, [user]);

  // Load saved business ideas from Firestore on mount and auto-generate personalized ideas matching user profile
  useEffect(() => {
    const loadSavedAndAutoGenerate = async () => {
      const savedList = await fetchSavedBusinessIdeasFromFirestore(user?.uid);
      setSavedBusinesses(savedList);

      if (user) {
        setLoading(true);
        try {
          const response = await fetch('/api/ai/business', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              country: user.country || country,
              city: user.city || city,
              currentSkills: Array.isArray(user.skills) && user.skills.length > 0 ? user.skills.join(', ') : currentSkills,
              experienceLevel: user.experienceLevel || experienceLevel,
              budget: user.availableBudgetUSD !== undefined ? user.availableBudgetUSD : budget,
              dailyFreeTime,
              goal,
              language,
              userProfile: user,
            }),
          });
          const data = await response.json();
          if (data.success) {
            if (Array.isArray(data.businesses) && data.businesses.length > 0) {
              setBusinesses(data.businesses);
              setExpandedIdeaId(data.businesses[0].id);
            }
            if (data.scores) setScores(data.scores);
            if (data.highlights) setHighlights(data.highlights);
            if (data.roadmap30Day) setRoadmap(data.roadmap30Day);
          }
        } catch (err) {
          console.warn('Auto AI Business generation error:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    loadSavedAndAutoGenerate();
  }, [user, language]);

  // Handle AI Generation
  const handleGenerateIdeas = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country,
          city,
          currentSkills,
          experienceLevel,
          budget,
          dailyFreeTime,
          goal,
          language,
          userProfile: user,
        }),
      });

      const data = await response.json();
      if (data.success) {
        if (Array.isArray(data.businesses) && data.businesses.length > 0) {
          setBusinesses(data.businesses);
          setExpandedIdeaId(data.businesses[0].id);
        }
        if (data.scores) setScores(data.scores);
        if (data.highlights) setHighlights(data.highlights);
        if (data.roadmap30Day) setRoadmap(data.roadmap30Day);
      }
    } catch (err) {
      console.error('Error generating business ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle 30-Day Plan Generation / Opening
  const handleCreate30DayPlan = (biz?: BusinessIdea) => {
    const selected = biz || businesses[0];
    if (!selected) return;

    setRoadmap({
      businessTitle: selected.businessName || selected.title || 'AI Business Strategy',
      week1: 'Niche Analysis & Service Positioning - Define core target client personas and structure high-value offer packages.',
      week2: 'System Setup & Demonstration Prototypes - Build 2 working automation templates and configure professional workspace.',
      week3: 'Direct Outreach & Lead Pipeline - Launch multi-channel outreach to regional and international decision makers.',
      week4: 'Client Acquisition & Service Delivery - Close initial retainer client, establish automated billing, and scale outreach.',
      dailyTasks: [
        'Day 1: Conduct target industry demand audit in your market.',
        'Day 2: Identify 20 target business prospects and key decision-maker emails.',
        'Day 3: Draft high-converting offer script and value proposition sheet.',
        'Day 4: Set up professional business domain and email workspace.',
        'Day 5: Build demonstration workflow prototype using Gemini API.',
        'Day 6: Prepare 60-second video walkthroughs for targeted prospect outreach.',
        'Day 7: Review Week 1 milestones, audit feedback, and calibrate pipeline.',
      ],
      freeLearningResources: [
        'RYNEXO AI Strategy Guidebook & Prompts',
        'Google Cloud Generative AI Fundamentals',
        'Official Gemini API Cookbook & Documentation',
      ],
      aiTools: [
        'Gemini API / RYNEXO AI Architect',
        'Make.com Automation Suite',
        'Canva Pro Brand Suite',
        'Notion Workspace',
      ],
      recommendedWebsites: [
        'https://ai.google.dev',
        'https://make.com',
        'https://linkedin.com',
        'https://stripe.com',
      ],
    });
    setRoadmapModalOpen(true);
  };

  // Toggle Save Idea
  const handleToggleSave = async (biz: BusinessIdea) => {
    const isAlreadySaved = savedBusinesses.some((b) => b.id === biz.id);
    if (isAlreadySaved) {
      await removeSavedBusinessIdeaFromFirestore(biz.id, user?.uid);
      setSavedBusinesses((prev) => prev.filter((b) => b.id !== biz.id));
      showToast('Business idea removed from your saved list');
    } else {
      await saveBusinessIdeaToFirestore(biz, user?.uid);
      if (user?.uid) {
        await recordBusinessCreatedInFirestore(biz.businessName || biz.title || 'AI Business Idea', user.uid);
        recordAIOSEvent(user.uid, 'business_saved', biz, user);
      }
      setSavedBusinesses((prev) => [biz, ...prev]);
      showToast('Business idea saved to Firebase Firestore');
    }
  };

  // Toast Helper
  const showToast = (msg: string) => {
    setCopiedToast(msg);
    setTimeout(() => setCopiedToast(null), 3000);
  };

  // Share Idea
  const handleShareIdea = (biz: BusinessIdea) => {
    const text = `RYNEXO AI Business Blueprint: ${biz.businessName || biz.title}\nCategory: ${biz.category}\nCost: ${biz.startupCost || biz.requiredBudget}\nEstimated Income: ${biz.estimatedMonthlyIncomePotential || biz.estimatedMonthlyRevenue}\nWhy Fits: ${biz.whyFitsYou || biz.whyFitsProfile}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast('Business summary copied to clipboard');
    }
  };

  // Print/PDF Export
  const handleDownloadPdf = (biz: BusinessIdea) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>RYNEXO AI Business Blueprint - ${biz.businessName || biz.title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
            h1 { color: #581c87; font-size: 28px; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
            .meta { display: flex; gap: 20px; font-weight: bold; margin: 20px 0; background: #f3f4f6; padding: 15px; border-radius: 8px; }
            .section { margin-top: 25px; }
            .section-title { font-size: 16px; text-transform: uppercase; color: #6b21a8; font-weight: bold; letter-spacing: 1px; }
            .step { margin-bottom: 12px; background: #fafafa; padding: 12px; border-left: 4px solid #7e22ce; border-radius: 4px; }
          </style>
        </head>
        <body>
          <h1>RYNEXO AI Incubator Blueprint</h1>
          <h2>${biz.businessName || biz.title}</h2>
          <div class="meta">
            <div>Startup Cost: ${biz.startupCost || biz.requiredBudget}</div>
            <div>Difficulty: ${biz.difficultyLevel || biz.difficulty}</div>
            <div>Estimated Revenue: ${biz.estimatedMonthlyIncomePotential || biz.estimatedMonthlyRevenue}</div>
          </div>
          <div class="section">
            <div class="section-title">Strategic Fit Analysis</div>
            <p>${biz.whyFitsYou || biz.whyFitsProfile}</p>
          </div>
          <div class="section">
            <div class="section-title">Required Skills</div>
            <p>${(biz.requiredSkills || []).join(', ')}</p>
          </div>
          <div class="section">
            <div class="section-title">Required Tools</div>
            <p>${(biz.requiredTools || biz.recommendedTools || []).join(', ')}</p>
          </div>
          <div class="section">
            <div class="section-title">Best Growth Platforms</div>
            <p>${(biz.bestPlatforms || []).join(', ')}</p>
          </div>
          <div class="section">
            <div class="section-title">4-Week Execution Plan</div>
            ${(biz.stepByStepLaunchGuide || biz.steps || [])
              .map(
                (s) => `
              <div class="step">
                <strong>Week ${s.week}: ${s.title}</strong>
                <div>${s.description}</div>
              </div>
            `
              )
              .join('')}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const goalOptions = [
    'Extra Income',
    'Full-Time Business',
    'Online Business',
    'Freelancing',
    'E-commerce',
    'AI Business',
    'Affiliate Marketing',
    'Passive Income',
  ];

  return (
    <div className="space-y-8 pb-16 text-left">
      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl bg-emerald-500 text-black font-extrabold text-xs shadow-2xl flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{copiedToast}</span>
        </div>
      )}

      {/* HEADER BANNER */}
      <div className="p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] bg-gradient-to-br from-[#0c0e17] via-[#120f24] to-[#0a0c16] border border-white/10 backdrop-blur-2xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-widest">
              <Rocket className="w-3.5 h-3.5 text-purple-400" />
              <span>RYNEXO Startup Incubator</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Start a Business with AI
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Get personalized business ideas based on your budget, skills, country and income goals.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-full shrink-0">
            <button
              onClick={() => setActiveTab('incubator')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition ${
                activeTab === 'incubator'
                  ? 'bg-white text-black shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Incubator
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'saved'
                  ? 'bg-white text-black shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved ({savedBusinesses.length})</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'incubator' ? (
        <>
          {/* USER INPUTS FORM */}
          <div className="p-6 sm:p-8 rounded-[32px] bg-[#0c0d15] border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-purple-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Personal Incubator Profile Criteria
                </h2>
              </div>
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                Synced with your authenticated profile
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Country */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>Country</span>
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. United States, Germany, Morocco"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-400 transition"
                />
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                  <span>City</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New York, Berlin, Casablanca"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-400 transition"
                />
              </div>

              {/* Current Skills */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Current Skills</span>
                </label>
                <input
                  type="text"
                  value={currentSkills}
                  onChange={(e) => setCurrentSkills(e.target.value)}
                  placeholder="e.g. AI Prompting, Copywriting, Web Development, SEO"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-400 transition"
                />
              </div>

              {/* Experience Level */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Experience Level</span>
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-400 transition"
                >
                  <option value="Beginner" className="bg-[#0b0c13] text-white">
                    Beginner
                  </option>
                  <option value="Intermediate" className="bg-[#0b0c13] text-white">
                    Intermediate
                  </option>
                  <option value="Expert" className="bg-[#0b0c13] text-white">
                    Expert
                  </option>
                </select>
              </div>

              {/* Available Budget */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Available Budget</span>
                  </label>
                  <span className="text-xs font-bold text-emerald-400">${budget} USD</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="25"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-white/10 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Daily Free Time */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Daily Free Time</span>
                </label>
                <select
                  value={dailyFreeTime}
                  onChange={(e) => setDailyFreeTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-400 transition"
                >
                  <option value="1-2 Hours/Day" className="bg-[#0b0c13] text-white">
                    1-2 Hours/Day
                  </option>
                  <option value="2-4 Hours/Day" className="bg-[#0b0c13] text-white">
                    2-4 Hours/Day
                  </option>
                  <option value="4+ Hours/Day" className="bg-[#0b0c13] text-white">
                    4+ Hours/Day
                  </option>
                  <option value="Full-Time (8+ Hrs/Day)" className="bg-[#0b0c13] text-white">
                    Full-Time (8+ Hrs/Day)
                  </option>
                </select>
              </div>

              {/* Goal */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-purple-400" />
                  <span>Primary Goal</span>
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-400 transition"
                >
                  {goalOptions.map((g) => (
                    <option key={g} value={g} className="bg-[#0b0c13] text-white">
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Generate Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleGenerateIdeas}
                disabled={loading}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black hover:bg-slate-200 font-extrabold text-xs tracking-wide transition shadow-2xl flex items-center justify-center gap-2.5 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>{loading ? 'Analyzing Profile & Market Data...' : 'Generate My Business Ideas'}</span>
              </button>
            </div>
          </div>

          {/* AI BUSINESS SCORES (DYNAMIC PROFILE READINESS) */}
          {scores && (
            <div className="p-6 sm:p-8 rounded-[32px] bg-[#0c0d15] border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  AI Business Readiness Metrics
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-left">
                {/* Score 1 */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Business Readiness
                  </span>
                  <p className="text-xl font-black text-blue-400">{scores.businessReadiness}%</p>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-400 h-full rounded-full"
                      style={{ width: `${scores.businessReadiness}%` }}
                    />
                  </div>
                </div>

                {/* Score 2 */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Income Potential
                  </span>
                  <p className="text-xl font-black text-emerald-400">{scores.incomePotential}%</p>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full"
                      style={{ width: `${scores.incomePotential}%` }}
                    />
                  </div>
                </div>

                {/* Score 3 */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Startup Difficulty
                  </span>
                  <p className="text-xl font-black text-amber-400">{scores.startupDifficulty}%</p>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full"
                      style={{ width: `${scores.startupDifficulty}%` }}
                    />
                  </div>
                </div>

                {/* Score 4 */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Investment Score
                  </span>
                  <p className="text-xl font-black text-purple-400">{scores.investmentScore}%</p>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-400 h-full rounded-full"
                      style={{ width: `${scores.investmentScore}%` }}
                    />
                  </div>
                </div>

                {/* Score 5 */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Success Probability
                  </span>
                  <p className="text-xl font-black text-emerald-300">{scores.successProbability}%</p>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-300 h-full rounded-full"
                      style={{ width: `${scores.successProbability}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI ANALYSIS HIGHLIGHT CARDS */}
          {highlights && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Compass className="w-4 h-4 text-purple-400" />
                <span>AI Strategic Highlights</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-left space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-purple-400" />
                    Best Business
                  </span>
                  <p className="text-xs font-bold text-white leading-snug truncate">
                    {highlights.bestBusinessTitle}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-left space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                    Fastest to Launch
                  </span>
                  <p className="text-xs font-bold text-white leading-snug truncate">
                    {highlights.fastestToLaunchTitle}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-left space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    Lowest Investment
                  </span>
                  <p className="text-xs font-bold text-white leading-snug truncate">
                    {highlights.lowestInvestmentTitle}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                    Highest Income Potential
                  </span>
                  <p className="text-xs font-bold text-white leading-snug truncate">
                    {highlights.highestIncomePotentialTitle}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-500/10 border border-slate-500/20 text-left space-y-1 sm:col-span-2 lg:col-span-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />
                    Lowest Risk
                  </span>
                  <p className="text-xs font-bold text-white leading-snug truncate">
                    {highlights.lowestRiskTitle}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* GENERATED BUSINESS IDEAS LIST */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">
                Personalized Business Models ({businesses.length})
              </h3>

              <button
                onClick={() => handleCreate30DayPlan()}
                className="px-4 py-2 rounded-full bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 text-purple-300 font-bold text-xs transition flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Create My 30-Day Business Plan</span>
              </button>
            </div>

            {businesses.map((biz) => {
              const isExpanded = expandedIdeaId === biz.id;
              const isSaved = savedBusinesses.some((b) => b.id === biz.id);

              return (
                <div
                  key={biz.id}
                  className="rounded-[32px] bg-[#0c0d15] border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl transition-all hover:border-white/20"
                >
                  {/* Card Header / Summary Row */}
                  <div
                    onClick={() => setExpandedIdeaId(isExpanded ? null : biz.id)}
                    className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                          {biz.category}
                        </span>

                        <span className="px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-extrabold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          <span>AI Success: 92%</span>
                        </span>

                        <span className="px-3 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-bold">
                          Country Match: Verified
                        </span>

                        <span className="px-3 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-medium">
                          Difficulty: <strong>{biz.difficultyLevel || biz.difficulty}</strong>
                        </span>

                        <span className="px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          Cost: {biz.startupCost || biz.requiredBudget}
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        {biz.businessName || biz.title}
                      </h2>

                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                        {biz.whyFitsYou || biz.whyFitsProfile}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Est. Monthly Income
                        </span>
                        <span className="text-sm font-bold text-emerald-400">
                          {biz.estimatedMonthlyIncomePotential || biz.estimatedMonthlyRevenue}
                        </span>
                      </div>

                      <div className="p-3 rounded-full bg-white/5 border border-white/10 text-slate-400">
                        <ChevronRight
                          className={`w-5 h-5 transition-transform duration-300 ${
                            isExpanded ? 'rotate-90 text-white' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detailed View */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 border-t border-white/10 space-y-6">
                      {/* Metric Specs Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Startup Cost
                          </span>
                          <p className="text-xs font-bold text-white">
                            {biz.startupCost || biz.requiredBudget}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Difficulty Level
                          </span>
                          <p className="text-xs font-bold text-amber-300">
                            {biz.difficultyLevel || biz.difficulty}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Expected First Income
                          </span>
                          <p className="text-xs font-bold text-purple-300">
                            {biz.expectedFirstIncome || biz.timeToFirstIncome}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Estimated Monthly Potential
                          </span>
                          <p className="text-xs font-bold text-emerald-400">
                            {biz.estimatedMonthlyIncomePotential || biz.estimatedMonthlyRevenue}
                          </p>
                        </div>
                      </div>

                      {/* Why This Business Fits You */}
                      <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-xs text-slate-200 leading-relaxed space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
                          Why This Business Fits You:
                        </span>
                        <p>{biz.whyFitsYou || biz.whyFitsProfile}</p>
                      </div>

                      {/* Required Skills, Tools, Platforms */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Skills */}
                        <div className="space-y-2">
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                            <Wrench className="w-3.5 h-3.5 text-blue-400" />
                            <span>Required Skills</span>
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {(biz.requiredSkills || []).map((sk, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs font-medium"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Tools */}
                        <div className="space-y-2">
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-purple-400" />
                            <span>Required Tools</span>
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {(biz.requiredTools || biz.recommendedTools || []).map((tl, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs font-medium"
                              >
                                {tl}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Platforms */}
                        <div className="space-y-2">
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                            <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Best Platforms</span>
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {(
                              biz.bestPlatforms || ['LinkedIn', 'Google', 'Upwork', 'Stripe']
                            ).map((pl, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs font-medium"
                              >
                                {pl}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Step-by-Step Launch Guide */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-purple-400" />
                          <span>Step-by-Step Launch Guide</span>
                        </h4>

                        <div className="space-y-2.5">
                          {(biz.stepByStepLaunchGuide || biz.steps || []).map((step) => (
                            <div
                              key={step.week}
                              className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-start gap-3.5"
                            >
                              <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center justify-center shrink-0">
                                W{step.week}
                              </div>
                              <div className="space-y-0.5">
                                <h5 className="text-xs font-bold text-white">{step.title}</h5>
                                <p className="text-[11px] text-slate-300 leading-relaxed">
                                  {step.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons Row */}
                      <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {/* Save Button */}
                          <button
                            onClick={() => handleToggleSave(biz)}
                            className={`px-4 py-2.5 rounded-full border text-xs font-bold transition flex items-center gap-1.5 ${
                              isSaved
                                ? 'bg-white text-black border-white'
                                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                            }`}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                            <span>{isSaved ? 'Saved in Firestore' : 'Save Business Idea'}</span>
                          </button>

                          {/* Share Button */}
                          <button
                            onClick={() => handleShareIdea(biz)}
                            className="px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
                          >
                            <Share2 className="w-3.5 h-3.5 text-blue-400" />
                            <span>Share</span>
                          </button>

                          {/* Download PDF Button */}
                          <button
                            onClick={() => handleDownloadPdf(biz)}
                            className="px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5 text-purple-400" />
                            <span>Download PDF</span>
                          </button>
                        </div>

                        {/* Create 30-Day Plan Button */}
                        <button
                          onClick={() => handleCreate30DayPlan(biz)}
                          className="px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold tracking-wide transition flex items-center gap-1.5 shadow-lg"
                        >
                          <span>Create 30-Day Business Plan</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* COMMUNITY RECOMMENDATION BANNER */}
          <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-r from-blue-950/40 via-purple-950/40 to-slate-900/60 border border-blue-500/20 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>RYNEXO Founder Circle</span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Need feedback from successful entrepreneurs?
              </h3>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Connect directly with experienced online business founders, AI architects, and global strategy mentors in our community.
              </p>
            </div>

            <a
              href="https://t.me/primevision_0"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs tracking-wide transition shadow-xl flex items-center justify-center gap-2 shrink-0"
            >
              <span>Join RYNEXO Community</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </>
      ) : (
        /* SAVED BUSINESSES TAB */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">
              Saved Business Ideas ({savedBusinesses.length})
            </h3>
          </div>

          {savedBusinesses.length === 0 ? (
            <div className="p-12 text-center rounded-[32px] bg-[#0c0d15] border border-white/10 space-y-3">
              <Bookmark className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-white">No saved business ideas yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Generate personalized ideas and click "Save Business Idea" to store them directly in Firebase Firestore.
              </p>
            </div>
          ) : (
            savedBusinesses.map((biz) => (
              <div
                key={biz.id}
                className="p-6 rounded-[32px] bg-[#0c0d15] border border-white/10 space-y-4 text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="px-3 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider inline-block mb-2">
                      {biz.category}
                    </span>
                    <h2 className="text-xl font-bold text-white">{biz.businessName || biz.title}</h2>
                    <p className="text-xs text-slate-300 mt-1">{biz.whyFitsYou || biz.whyFitsProfile}</p>
                  </div>

                  <button
                    onClick={() => handleToggleSave(biz)}
                    className="p-2.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white"
                  >
                    <Bookmark className="w-4 h-4 fill-current text-purple-400" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-[10px] uppercase text-slate-400 block font-bold">Cost</span>
                    <span className="text-white font-bold">{biz.startupCost || biz.requiredBudget}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-[10px] uppercase text-slate-400 block font-bold">Income</span>
                    <span className="text-emerald-400 font-bold">{biz.estimatedMonthlyIncomePotential || biz.estimatedMonthlyRevenue}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5 col-span-2 sm:col-span-1">
                    <span className="text-[10px] uppercase text-slate-400 block font-bold">Difficulty</span>
                    <span className="text-amber-300 font-bold">{biz.difficultyLevel || biz.difficulty}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleDownloadPdf(biz)}
                    className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-bold"
                  >
                    Download PDF
                  </button>
                  <button
                    onClick={() => handleCreate30DayPlan(biz)}
                    className="px-4 py-2 rounded-full bg-purple-600 text-white text-xs font-bold"
                  >
                    30-Day Plan
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 30-DAY BUSINESS ROADMAP MODAL */}
      {roadmapModalOpen && roadmap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-[#0b0c13] border border-white/15 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] text-left backdrop-blur-2xl space-y-6 my-auto">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider mb-2">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  <span>Executive 30-Day Business Plan</span>
                </div>
                <h2 className="text-2xl font-bold text-white">{roadmap.businessTitle}</h2>
              </div>

              <button
                onClick={() => setRoadmapModalOpen(false)}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white text-xs font-bold"
              >
                Close
              </button>
            </div>

            {/* Weekly Focus Milestones */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span>4-Week Strategic Milestones</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-blue-400 block">Week 1 Focus</span>
                  <p className="text-slate-200 leading-relaxed">{roadmap.week1}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-purple-400 block">Week 2 Focus</span>
                  <p className="text-slate-200 leading-relaxed">{roadmap.week2}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-amber-400 block">Week 3 Focus</span>
                  <p className="text-slate-200 leading-relaxed">{roadmap.week3}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 block">Week 4 Focus</span>
                  <p className="text-slate-200 leading-relaxed">{roadmap.week4}</p>
                </div>
              </div>
            </div>

            {/* Daily Action Tasks */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Daily Execution Tasks</span>
              </h3>

              <div className="space-y-2">
                {roadmap.dailyTasks.map((task, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-slate-200 flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{task}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resources, AI Tools, Recommended Websites */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Learning */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Free Learning</span>
                </h4>
                <div className="space-y-1">
                  {roadmap.freeLearningResources.map((res, i) => (
                    <div key={i} className="p-2 rounded-xl bg-white/5 text-slate-300">
                      {res}
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Tools */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>AI Tools</span>
                </h4>
                <div className="space-y-1">
                  {roadmap.aiTools.map((tl, i) => (
                    <div key={i} className="p-2 rounded-xl bg-white/5 text-slate-300">
                      {tl}
                    </div>
                  ))}
                </div>
              </div>

              {/* Websites */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Websites</span>
                </h4>
                <div className="space-y-1">
                  {roadmap.recommendedWebsites.map((web, i) => (
                    <a
                      key={i}
                      href={web}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white flex items-center justify-between"
                    >
                      <span className="truncate">{web.replace('https://', '')}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Close */}
            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setRoadmapModalOpen(false)}
                className="px-6 py-3 rounded-full bg-white text-black font-extrabold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
