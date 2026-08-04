import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Briefcase,
  TrendingUp,
  DollarSign,
  GraduationCap,
  Award,
  ArrowRight,
  X,
  CheckCircle2,
  ChevronRight,
  Zap,
  Bell
} from 'lucide-react';
import { UserProfile, AIMemory } from '../types';
import {
  ProactiveRecommendation,
  fetchProactiveOSRecommendations,
  recordAIOSEvent
} from '../lib/aiBrainOS';

interface GlobalAIONotificationEngineProps {
  userProfile: UserProfile | null;
  aiMemory: AIMemory | null;
  onNavigateTab: (tab: string) => void;
  onOpenBrainDrawer?: () => void;
}

export const GlobalAIONotificationEngine: React.FC<GlobalAIONotificationEngineProps> = ({
  userProfile,
  aiMemory,
  onNavigateTab,
  onOpenBrainDrawer,
}) => {
  const [recommendations, setRecommendations] = useState<ProactiveRecommendation[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load Proactive Recommendations on mount & profile change
  useEffect(() => {
    let mounted = true;
    async function loadRecs() {
      if (!userProfile) return;
      setLoading(true);
      const recs = await fetchProactiveOSRecommendations(userProfile, aiMemory);
      if (mounted) {
        setRecommendations(recs);
        setLoading(false);
      }
    }
    loadRecs();
    return () => {
      mounted = false;
    };
  }, [userProfile?.uid, aiMemory?.updatedAt]);

  const activeRecs = recommendations.filter((r) => !dismissedIds.includes(r.id));
  const currentRec = activeRecs[activeIndex % (activeRecs.length || 1)];

  if (!userProfile || activeRecs.length === 0 || loading) {
    return null;
  }

  const handleActNow = async (rec: ProactiveRecommendation) => {
    // 1. Update AI Memory in Firestore
    if (userProfile?.uid) {
      await recordAIOSEvent(
        userProfile.uid,
        'profile_updated',
        {
          actedRecommendationId: rec.id,
          title: rec.title,
          category: rec.category,
        },
        userProfile
      );
    }

    // 2. Mark as dismissed locally and navigate
    setDismissedIds((prev) => [...prev, rec.id]);
    onNavigateTab(rec.targetTab);
  };

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedIds((prev) => [...prev, id]);
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Job':
        return { label: 'Better Job Signal', bg: 'bg-blue-500/10 text-blue-300 border-blue-500/30', icon: Briefcase };
      case 'Affiliate':
        return { label: 'Better Affiliate Offer', bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30', icon: DollarSign };
      case 'Business':
        return { label: 'Better Business Signal', bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30', icon: TrendingUp };
      case 'Learning':
        return { label: 'Better Learning Module', bg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30', icon: GraduationCap };
      case 'Income':
        return { label: 'Better Income Strategy', bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30', icon: Award };
      default:
        return { label: 'Proactive AI Signal', bg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30', icon: Sparkles };
    }
  };

  const badgeInfo = getCategoryBadge(currentRec.category);
  const CategoryIcon = badgeInfo.icon;

  return (
    <div className="w-full bg-slate-950 border-b border-blue-500/20 text-slate-100 px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: AI Proactive Signal Ticker */}
        <div className="flex items-start md:items-center space-x-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>

          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border flex items-center space-x-1 ${badgeInfo.bg}`}>
                <CategoryIcon className="w-3 h-3 mr-1" />
                {badgeInfo.label}
              </span>
              <span className="text-[10px] font-bold text-slate-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1" />
                Impact Match: {currentRec.impactScore}%
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <h4 className="text-xs font-bold text-white truncate">
                {currentRec.title}
              </h4>
              <span className="text-xs text-slate-400 hidden lg:inline">
                • {currentRec.subtitle}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 line-clamp-1">
              {currentRec.reason}
            </p>
          </div>
        </div>

        {/* Right: Actions & Carousel Control */}
        <div className="flex items-center space-x-2 shrink-0 self-end md:self-auto">
          {activeRecs.length > 1 && (
            <div className="flex items-center space-x-1 bg-slate-900 rounded-lg p-0.5 border border-slate-800 mr-2">
              <button
                onClick={() => setActiveIndex((prev) => (prev - 1 + activeRecs.length) % activeRecs.length)}
                className="p-1 rounded text-slate-400 hover:text-white transition"
                title="Previous Proactive Signal"
              >
                ‹
              </button>
              <span className="text-[10px] font-bold text-slate-400 px-1">
                {(activeIndex % activeRecs.length) + 1}/{activeRecs.length}
              </span>
              <button
                onClick={() => setActiveIndex((prev) => (prev + 1) % activeRecs.length)}
                className="p-1 rounded text-slate-400 hover:text-white transition"
                title="Next Proactive Signal"
              >
                ›
              </button>
            </div>
          )}

          <button
            onClick={() => handleActNow(currentRec)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-blue-500/20"
          >
            <span>{currentRec.actionText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {onOpenBrainDrawer && (
            <button
              onClick={onOpenBrainDrawer}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-800 transition flex items-center space-x-1"
              title="Open AI Memory Matrix"
            >
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">AI Brain</span>
            </button>
          )}

          <button
            onClick={(e) => handleDismiss(currentRec.id, e)}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-900 transition"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
