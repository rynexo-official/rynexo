import React, { useState, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Zap,
  RefreshCw,
  X,
  Target,
  Briefcase,
  TrendingUp,
  BookOpen,
  DollarSign,
  Users,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Compass,
  UserCheck,
} from 'lucide-react';
import { Language, UserProfile, CoachMessage, AIMemory } from '../types';
import { getTranslation } from '../i18n/translations';
import { ExternalLinkModal } from './ExternalLinkModal';
import {
  fetchUserProfileFromFirestore,
  fetchAIMemoryFromFirestore,
  syncAIMemoryToFirestore,
  updateAIMemoryRecommendationInFirestore
} from '../lib/firebase';

interface AICoachViewProps {
  user: UserProfile | null;
  language: Language;
}

export const AICoachView: React.FC<AICoachViewProps> = ({ user, language }) => {
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(user);
  const [currentAIMemory, setCurrentAIMemory] = useState<AIMemory | null>(null);
  const [isMemorySynced, setIsMemorySynced] = useState<boolean>(false);

  // Sync latest authenticated user profile and AI Memory directly from Firebase
  useEffect(() => {
    async function loadFreshMemoryAndProfile() {
      if (user?.uid) {
        const fresh = await fetchUserProfileFromFirestore(user.uid);
        if (fresh) {
          setCurrentUserProfile(fresh);
          const memory = await syncAIMemoryToFirestore(fresh);
          setCurrentAIMemory(memory);
          setIsMemorySynced(true);
        } else {
          const memory = await fetchAIMemoryFromFirestore(user.uid);
          if (memory) {
            setCurrentAIMemory(memory);
            setIsMemorySynced(true);
          }
        }
      }
    }
    loadFreshMemoryAndProfile();
  }, [user]);

  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: 'msg_init',
      sender: 'ai',
      text: `Hello ${
        currentUserProfile?.fullName || 'Entrepreneur'
      }. I am your RYNEXO AI Coach. I have synced your profile (Location: ${
        currentUserProfile?.city || 'Global'
      }, ${currentUserProfile?.country || 'Remote'} | Profession: ${
        currentUserProfile?.profession || 'Not specified'
      } | Budget: $${currentUserProfile?.availableBudgetUSD || 0}). Every recommendation I make is strictly tailored to your real profile details. Select a topic below or click "Create My Success Plan" to generate your roadmap.`,
      timestamp: 'Just now',
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'CAREER' | 'BUSINESS' | 'MONEY' | 'LEARNING'>('CAREER');

  // Success Plan Modal & State
  const [isSuccessPlanOpen, setIsSuccessPlanOpen] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [successPlanResult, setSuccessPlanResult] = useState<any>(null);

  const [planForm, setPlanForm] = useState({
    age: '26',
    country: currentUserProfile?.country || '',
    city: currentUserProfile?.city || '',
    profession: currentUserProfile?.profession || '',
    skills: currentUserProfile?.skills?.join(', ') || '',
    languages: Array.isArray(currentUserProfile?.languages) ? currentUserProfile.languages.join(', ') : 'English',
    experience: currentUserProfile?.experienceLevel || 'intermediate',
    budget: currentUserProfile?.availableBudgetUSD !== undefined ? String(currentUserProfile.availableBudgetUSD) : '250',
    goal: currentUserProfile?.careerGoal || (currentUserProfile?.monthlyGoalUSD ? `Reach $${currentUserProfile.monthlyGoalUSD}/mo income` : 'Build $5,000/mo income stream'),
  });

  // Keep planForm synced whenever currentUserProfile updates
  useEffect(() => {
    if (currentUserProfile) {
      setPlanForm({
        age: '26',
        country: currentUserProfile.country || '',
        city: currentUserProfile.city || '',
        profession: currentUserProfile.profession || '',
        skills: currentUserProfile.skills?.join(', ') || '',
        languages: Array.isArray(currentUserProfile.languages) ? currentUserProfile.languages.join(', ') : 'English',
        experience: currentUserProfile.experienceLevel || 'intermediate',
        budget: currentUserProfile.availableBudgetUSD !== undefined ? String(currentUserProfile.availableBudgetUSD) : '250',
        goal: currentUserProfile.careerGoal || (currentUserProfile.monthlyGoalUSD ? `Reach $${currentUserProfile.monthlyGoalUSD}/mo income` : 'Build $5,000/mo income stream'),
      });
    }
  }, [currentUserProfile]);

  // External Link Modal State for Telegram Community
  const [pendingCommunityUrl, setPendingCommunityUrl] = useState<string | null>(null);

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = textToSend || inputPrompt;
    if (!queryText.trim()) return;

    const userMsg: CoachMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setLoading(true);

    try {
      // Always load fresh authenticated user profile and AI Memory from Firebase before generating advice
      let profileToUse = currentUserProfile;
      let memoryToUse = currentAIMemory;
      if (user?.uid) {
        const fresh = await fetchUserProfileFromFirestore(user.uid);
        if (fresh) {
          profileToUse = fresh;
          setCurrentUserProfile(fresh);
          const memory = await syncAIMemoryToFirestore(fresh);
          memoryToUse = memory;
          setCurrentAIMemory(memory);
          setIsMemorySynced(true);
        }
      }

      const response = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: queryText,
          userProfile: profileToUse,
          aiMemory: memoryToUse,
          language,
        }),
      });

      const data = await response.json();
      if (data.success && data.reply) {
        const aiMsg: CoachMessage = {
          id: 'ai_' + Date.now(),
          sender: 'ai',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);

        // Automatically update AI Memory in Firestore with latest AI Recommendation
        if (user?.uid) {
          updateAIMemoryRecommendationInFirestore(user.uid, data.reply).catch((e) =>
            console.warn('AI memory update recommendation error:', e)
          );
        }
      }
    } catch (err) {
      console.error('AI Coach call error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSuccessPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingPlan(true);

    try {
      // Always load fresh user profile from Firebase
      let profileToUse = currentUserProfile;
      if (user?.uid) {
        const fresh = await fetchUserProfileFromFirestore(user.uid);
        if (fresh) {
          profileToUse = fresh;
          setCurrentUserProfile(fresh);
        }
      }

      const response = await fetch('/api/ai/success-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: profileToUse?.fullName,
          age: planForm.age,
          country: planForm.country || profileToUse?.country,
          city: planForm.city || profileToUse?.city,
          profession: planForm.profession || profileToUse?.profession || '',
          skills: planForm.skills || profileToUse?.skills?.join(', '),
          languages: planForm.languages || (Array.isArray(profileToUse?.languages) ? profileToUse.languages.join(', ') : 'English'),
          experience: planForm.experience || profileToUse?.experienceLevel,
          budget: planForm.budget || profileToUse?.availableBudgetUSD,
          monthlyGoal: profileToUse?.monthlyGoalUSD,
          careerGoal: planForm.goal || profileToUse?.careerGoal,
          language,
        }),
      });

      const data = await response.json();
      if (data.success && data.plan) {
        setSuccessPlanResult(data.plan);
        setIsSuccessPlanOpen(false);

        // Also push a summary message into chat console
        const planSummaryMsg: CoachMessage = {
          id: 'plan_' + Date.now(),
          sender: 'ai',
          text: `I have generated your Personalized Success Plan based strictly on your verified Firebase profile. You can review your roadmap summary below or ask me specific questions to refine your milestones.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, planSummaryMsg]);
      }
    } catch (err) {
      console.error('Error generating success plan:', err);
    } finally {
      setGeneratingPlan(false);
    }
  };

  const categoryPrompts = {
    CAREER: [
      'Help me find high-paying remote job positions',
      'How can I optimize my CV for global ATS filters?',
      'Give me top interview preparation techniques for tech roles',
      'What salary range should I ask for with my skill set?',
    ],
    BUSINESS: [
      'Generate 3 profitable online business ideas for my budget',
      'How to start affiliate marketing with recurring revenue?',
      'Guide me on offering AI automation services to agencies',
      'How do I create and market zero-inventory digital products?',
    ],
    MONEY: [
      'How can I build 3 diverse online income streams?',
      'What budget strategy should I use for scaling my revenue?',
      'Explain passive income models using software automation',
      'Create a financial independence strategy for $5,000/month',
    ],
    LEARNING: [
      'Build a personalized learning roadmap for high-demand AI skills',
      'What daily habits increase execution speed and output?',
      'Which top 3 skills offer highest income leverage this year?',
      'Suggest daily learning tasks to master online business',
    ],
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Luxury Hero Header */}
      <div className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] bg-gradient-to-b from-purple-950/40 via-slate-950/80 to-slate-950/90 border border-white/10 p-8 sm:p-12 text-center flex flex-col items-center justify-center backdrop-blur-2xl shadow-2xl">
        {/* Ambient Radial Glows */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-indigo-600/20 rounded-full blur-[110px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-purple-300 text-[11px] font-semibold tracking-widest uppercase shadow-sm">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span>24/7 Executive AI Mentor</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold tracking-wide shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Memory Synced</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
            {getTranslation(language, 'coachTitle')}
          </h1>

          <p className="text-slate-300/90 text-sm sm:text-base font-normal max-w-2xl mt-4 leading-relaxed tracking-wide">
            {getTranslation(language, 'coachSubtitle')}
          </p>

          {/* Primary Action: Create My Success Plan */}
          <div className="mt-8">
            <button
              onClick={() => setIsSuccessPlanOpen(true)}
              className="relative group overflow-hidden px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-bold text-sm tracking-wide shadow-2xl hover:shadow-purple-500/25 hover:scale-105 transition-all duration-300 flex items-center gap-3 border border-white/20"
            >
              <Sparkles className="w-4 h-4 text-purple-200 group-hover:rotate-12 transition-transform" />
              <span>{getTranslation(language, 'createSuccessPlan')}</span>
              <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Mission Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-2 rounded-[28px] bg-white/[0.03] border border-white/10 backdrop-blur-2xl">
        <button
          onClick={() => setActiveCategory('CAREER')}
          className={`py-3.5 px-4 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2.5 ${
            activeCategory === 'CAREER'
              ? 'bg-white text-black shadow-lg font-bold'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Briefcase className="w-4 h-4 text-blue-500 shrink-0" />
          <span>CAREER</span>
        </button>

        <button
          onClick={() => setActiveCategory('BUSINESS')}
          className={`py-3.5 px-4 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2.5 ${
            activeCategory === 'BUSINESS'
              ? 'bg-white text-black shadow-lg font-bold'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-purple-500 shrink-0" />
          <span>BUSINESS</span>
        </button>

        <button
          onClick={() => setActiveCategory('MONEY')}
          className={`py-3.5 px-4 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2.5 ${
            activeCategory === 'MONEY'
              ? 'bg-white text-black shadow-lg font-bold'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>MONEY</span>
        </button>

        <button
          onClick={() => setActiveCategory('LEARNING')}
          className={`py-3.5 px-4 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2.5 ${
            activeCategory === 'LEARNING'
              ? 'bg-white text-black shadow-lg font-bold'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-500 shrink-0" />
          <span>LEARNING</span>
        </button>
      </div>

      {/* Generated Success Plan Roadmap Card (if generated) */}
      {successPlanResult && (
        <div className="p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] bg-gradient-to-b from-purple-950/30 via-slate-900/60 to-slate-950/80 border border-purple-500/30 backdrop-blur-2xl shadow-2xl space-y-8 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Personalized RYNEXO Success Plan
                </h2>
                <p className="text-xs text-slate-300">
                  Tailored to your goal: {planForm.goal}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSuccessPlanResult(null)}
              className="p-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Career Recommendation */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <h3 className="text-xs font-bold text-blue-300 uppercase tracking-widest flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Career Path Recommendation
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed">
                {successPlanResult.careerRecommendation || 'Strategic remote position alignment.'}
              </p>
            </div>

            {/* Best Online Business */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <h3 className="text-xs font-bold text-purple-300 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Best Online Business Model
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed">
                {successPlanResult.bestOnlineBusiness || 'High-ticket affiliate or agency service.'}
              </p>
            </div>

            {/* Income Strategy */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-widest flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Income Growth Strategy
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed">
                {successPlanResult.incomeStrategy || 'Leveraging recurring commissions and client retainers.'}
              </p>
            </div>

            {/* Estimated Timeline */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Estimated Timeline
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed">
                {successPlanResult.estimatedTimeline || 'Initial income within 14-30 days.'}
              </p>
            </div>
          </div>

          {/* 30-Day Action Plan Milestones */}
          {Array.isArray(successPlanResult.actionPlan30Day) && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                30-Day Action Plan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {successPlanResult.actionPlan30Day.map((step: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1.5"
                  >
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                      Week {idx + 1}
                    </span>
                    <p className="text-slate-200 leading-relaxed font-medium">
                      {typeof step === 'string' ? step : step.description || step.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Luxury AI Chat Console */}
      <div className="rounded-[32px] bg-white/[0.03] border border-white/10 backdrop-blur-2xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
        {/* Console Top Bar */}
        <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-xs font-bold text-white tracking-wide">
              RYNEXO AI Strategy Mentor Console
            </span>
          </div>

          <span className="text-[11px] font-mono text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            Active Mentor Mode
          </span>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-white shrink-0 border border-white/20 shadow-md">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] p-4 sm:p-5 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                    isAI
                      ? 'bg-white/5 border border-white/10 text-slate-200 shadow-sm'
                      : 'bg-white text-black font-semibold shadow-lg'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-2.5 text-right font-mono ${
                      isAI ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {!isAI && (
                  <div className="w-9 h-9 rounded-2xl bg-white text-black flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                    {user ? user.fullName.charAt(0) : 'U'}
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-purple-300 p-2">
              <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
              <span>AI Coach is formulating your personalized strategy...</span>
            </div>
          )}
        </div>

        {/* Category Quick Prompts */}
        <div className="px-4 py-2.5 bg-white/5 border-t border-white/10 flex items-center gap-2 overflow-x-auto">
          {categoryPrompts[activeCategory].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 text-[11px] font-medium whitespace-nowrap transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-white/5 border-t border-white/10 flex items-center gap-2">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={getTranslation(language, 'typePrompt')}
            className="flex-1 px-5 py-3 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-white/30 transition-all"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={loading || !inputPrompt.trim()}
            className="p-3 rounded-full bg-white text-black hover:bg-slate-200 transition-all disabled:opacity-50 shadow-md shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* RYNEXO Community Support Section */}
      <div className="p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] bg-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {getTranslation(language, 'needMoreSupport')}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Connect with 12,000+ active entrepreneurs and mentors in the official Telegram community.
            </p>
          </div>
        </div>

        <button
          onClick={() => setPendingCommunityUrl('https://t.me/primevision_0')}
          className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white text-black hover:bg-slate-200 font-bold text-xs tracking-wide shadow-xl transition-all flex items-center justify-center gap-2 shrink-0 group"
        >
          <span>{getTranslation(language, 'joinCommunityBtn')}</span>
          <ExternalLink className="w-4 h-4 text-slate-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* "Create My Success Plan" Form Modal */}
      {isSuccessPlanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl bg-[#0c0d14] border border-white/15 rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-2xl overflow-y-auto max-h-[90vh] backdrop-blur-2xl">
            <button
              onClick={() => setIsSuccessPlanOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto mb-3">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {getTranslation(language, 'successPlanTitle')}
              </h2>
              <p className="text-xs text-slate-300/90 mt-1 max-w-md mx-auto">
                {getTranslation(language, 'successPlanSubtitle')}
              </p>
            </div>

            <form onSubmit={handleGenerateSuccessPlan} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={planForm.age}
                    onChange={(e) => setPlanForm({ ...planForm, age: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={planForm.country}
                    onChange={(e) => setPlanForm({ ...planForm, country: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={planForm.city}
                    onChange={(e) => setPlanForm({ ...planForm, city: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    Current Profession
                  </label>
                  <input
                    type="text"
                    value={planForm.profession}
                    onChange={(e) => setPlanForm({ ...planForm, profession: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    Languages
                  </label>
                  <input
                    type="text"
                    value={planForm.languages}
                    onChange={(e) => setPlanForm({ ...planForm, languages: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                  Key Skills
                </label>
                <input
                  type="text"
                  value={planForm.skills}
                  onChange={(e) => setPlanForm({ ...planForm, skills: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    Experience Level
                  </label>
                  <select
                    value={planForm.experience}
                    onChange={(e) => setPlanForm({ ...planForm, experience: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="beginner" className="bg-slate-900 text-white">Beginner</option>
                    <option value="intermediate" className="bg-slate-900 text-white">Intermediate</option>
                    <option value="advanced" className="bg-slate-900 text-white">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    Monthly Budget (USD)
                  </label>
                  <input
                    type="number"
                    value={planForm.budget}
                    onChange={(e) => setPlanForm({ ...planForm, budget: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                  Primary Goal
                </label>
                <input
                  type="text"
                  value={planForm.goal}
                  onChange={(e) => setPlanForm({ ...planForm, goal: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={generatingPlan}
                  className="w-full py-3.5 px-6 rounded-full bg-white text-black font-bold text-xs tracking-wide shadow-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>
                    {generatingPlan
                      ? getTranslation(language, 'generatingPlanBtn')
                      : getTranslation(language, 'generatePlanBtn')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog before opening external Telegram link */}
      <ExternalLinkModal
        isOpen={!!pendingCommunityUrl}
        targetUrl={pendingCommunityUrl}
        onClose={() => setPendingCommunityUrl(null)}
        language={language}
      />
    </div>
  );
};
