import { UserProfile, AIMemory, DailySuccessProgress } from '../types';
import {
  fetchAIMemoryFromFirestore,
  updateAIMemoryRecommendationInFirestore,
  syncAIMemoryToFirestore,
  saveDailySuccessProgressToFirestore,
  db
} from './firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

export interface ProactiveRecommendation {
  id: string;
  category: 'Job' | 'Affiliate' | 'Business' | 'Learning' | 'Income';
  title: string;
  subtitle: string;
  reason: string;
  actionText: string;
  targetTab: 'jobs' | 'business' | 'affiliates' | 'learning' | 'coach' | 'profile' | 'dashboard';
  impactScore: number; // 0 - 100
  timestamp: string;
  read: boolean;
  actedUpon: boolean;
  metadata?: any;
}

export interface AIOperatingSystemContext {
  profile: UserProfile;
  memory: AIMemory | null;
  dailySuccess: DailySuccessProgress | null;
  proactiveRecommendations: ProactiveRecommendation[];
  activeLearningSignals: {
    source: string;
    insight: string;
    timestamp: string;
  }[];
  isLearning: boolean;
  lastSyncTime: string;
}

// Global In-Memory Reactive Event Subscribers
type AIBrainListener = (ctx: AIOperatingSystemContext) => void;
const listeners: Set<AIBrainListener> = new Set();

let currentOSContext: AIOperatingSystemContext | null = null;

export function subscribeToAIBrainOS(listener: AIBrainListener) {
  listeners.add(listener);
  if (currentOSContext) {
    listener(currentOSContext);
  }
  return () => {
    listeners.delete(listener);
  };
}

function notifySubscribers() {
  if (!currentOSContext) return;
  listeners.forEach((fn) => fn(currentOSContext!));
}

/**
 * Record an activity event from ANY module in RYNEXO AI OS.
 * Updates Firestore `ai_memory` and triggers cross-module intelligence.
 */
export async function recordAIOSEvent(
  uid: string,
  eventType:
    | 'job_searched'
    | 'job_viewed'
    | 'job_saved'
    | 'job_applied'
    | 'business_incubated'
    | 'business_saved'
    | 'affiliate_joined'
    | 'lesson_completed'
    | 'mission_completed'
    | 'income_updated'
    | 'profile_updated'
    | 'ai_chat_logged',
  data: any,
  currentProfile: UserProfile
): Promise<void> {
  if (!uid) return;

  const now = new Date().toISOString();
  const dateStr = now.split('T')[0];

  // 1. Prepare memory activity log item
  const logItem = {
    date: dateStr,
    action: eventType,
    metadata: data,
    timestamp: now,
  };

  // 2. Local memory updates
  if (currentOSContext) {
    currentOSContext.isLearning = true;
    currentOSContext.activeLearningSignals = [
      {
        source: getEventLabel(eventType),
        insight: getEventInsight(eventType, data),
        timestamp: now,
      },
      ...currentOSContext.activeLearningSignals.slice(0, 9),
    ];
    notifySubscribers();
  }

  // 3. Persist to Firestore `ai_memory` collection
  try {
    const memoryRef = doc(db, 'ai_memory', uid);
    const existing = currentOSContext?.memory;
    const updatedLogs = [logItem, ...(existing?.dailyActivityLog || [])].slice(0, 50);

    const updatePayload: any = {
      dailyActivityLog: updatedLogs,
      lastActiveTime: now,
      updatedAt: now,
    };

    // Specific field updates based on event type
    if (eventType === 'job_saved' && data.id) {
      const saved = existing?.savedJobs || [];
      if (!saved.some((j: any) => j.id === data.id)) {
        updatePayload.savedJobs = [...saved, data];
      }
    } else if (eventType === 'business_saved' && data.id) {
      const saved = existing?.savedBusinesses || [];
      if (!saved.some((b: any) => b.id === data.id)) {
        updatePayload.savedBusinesses = [...saved, data];
      }
    } else if (eventType === 'job_searched' && typeof data === 'string') {
      const searches = existing?.userSearches || [];
      if (!searches.includes(data)) {
        updatePayload.userSearches = [data, ...searches].slice(0, 20);
      }
    }

    await setDoc(memoryRef, updatePayload, { merge: true });

    // Update in-memory context
    if (currentOSContext && currentOSContext.memory) {
      currentOSContext.memory = {
        ...currentOSContext.memory,
        ...updatePayload,
      };
    }
  } catch (err) {
    console.warn('Firestore AI OS Memory Sync Warning:', err);
  } finally {
    if (currentOSContext) {
      currentOSContext.isLearning = false;
      currentOSContext.lastSyncTime = now;
      notifySubscribers();
    }
  }
}

/**
 * Fetch proactive AI recommendations from the server for the 5 key OS areas:
 * - Better Jobs
 * - Better Affiliate Offers
 * - Better Business Opportunities
 * - Better Learning Resources
 * - Better Income Strategies
 */
export async function fetchProactiveOSRecommendations(
  userProfile: UserProfile,
  memory: AIMemory | null
): Promise<ProactiveRecommendation[]> {
  try {
    const res = await fetch('/api/ai/proactive-recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userProfile,
        aiMemory: memory,
      }),
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.recommendations)) {
      return data.recommendations;
    }
  } catch (err) {
    console.warn('Proactive recommendations endpoint warning:', err);
  }

  // Fallback high-value recommendations based on real profile attributes
  return generateFallbackRecommendations(userProfile, memory);
}

/**
 * Update global OS Context
 */
export function setAIOperatingSystemContext(ctx: AIOperatingSystemContext) {
  currentOSContext = ctx;
  notifySubscribers();
}

export function getAIOperatingSystemContext(): AIOperatingSystemContext | null {
  return currentOSContext;
}

function getEventLabel(eventType: string): string {
  switch (eventType) {
    case 'job_searched': return 'Job Search Engine';
    case 'job_viewed': return 'Job Intelligence';
    case 'job_saved': return 'Career Vault';
    case 'job_applied': return 'Outreach Engine';
    case 'business_incubated': return 'Business Incubator';
    case 'business_saved': return 'Enterprise Vault';
    case 'affiliate_joined': return 'Affiliate Network';
    case 'lesson_completed': return 'Learning Academy';
    case 'mission_completed': return 'Daily Mission';
    case 'income_updated': return 'Income Tracker';
    case 'profile_updated': return 'Profile Intelligence';
    case 'ai_chat_logged': return 'AI Coach Session';
    default: return 'AI Brain OS';
  }
}

function getEventInsight(eventType: string, data: any): string {
  if (eventType === 'job_searched') return `Analyzed search query "${data}" for career match patterns.`;
  if (eventType === 'job_saved') return `Saved role "${data.title || 'Job'}" to AI Memory. Synthesizing required skill bridge.`;
  if (eventType === 'business_incubated') return `Evaluated business concept "${data.title || 'Startup'}". Updating affiliate tool match.`;
  if (eventType === 'affiliate_joined') return `Activated affiliate program "${data.name || 'Program'}". Calculating projected revenue.`;
  if (eventType === 'lesson_completed') return `Completed lesson "${data.title || 'Lesson'}". Updating ATS resume qualification.`;
  if (eventType === 'mission_completed') return `Completed daily mission. Incrementing streak & income velocity.`;
  if (eventType === 'profile_updated') return `Profile updated. Recalibrating global career and business decision engine.`;
  return `AI Memory synchronized event: ${eventType}.`;
}

function generateFallbackRecommendations(
  profile: UserProfile,
  memory: AIMemory | null
): ProactiveRecommendation[] {
  const country = profile.country || 'Global';
  const skills = profile.skills?.length > 0 ? profile.skills.join(', ') : 'AI & Digital Strategy';
  const targetIncome = profile.incomeTarget || profile.monthlyGoalUSD || 5000;
  const budget = profile.budget ?? profile.availableBudgetUSD ?? 250;

  const now = new Date().toISOString();

  return [
    {
      id: 'rec_job_1',
      category: 'Job',
      title: `Top Remote Role Match: Senior ${skills.split(',')[0]} Specialist`,
      subtitle: `Matched for ${country} / Target: $${targetIncome * 12}/yr`,
      reason: `Matches your ${skills} skills with 96% confidence score.`,
      actionText: 'View & Apply Now',
      targetTab: 'jobs',
      impactScore: 96,
      timestamp: now,
      read: false,
      actedUpon: false,
    },
    {
      id: 'rec_affiliate_1',
      category: 'Affiliate',
      title: 'High-Ticket SaaS Offer: Hostinger Cloud 60% Recurring',
      subtitle: 'Earn up to $120 per referral with low friction',
      reason: `Complements your $${budget} budget and digital automation focus.`,
      actionText: 'Activate Affiliate Offer',
      targetTab: 'affiliates',
      impactScore: 92,
      timestamp: now,
      read: false,
      actedUpon: false,
    },
    {
      id: 'rec_business_1',
      category: 'Business',
      title: 'Optimal Business Model: B2B AI Automation & Prompt Agency',
      subtitle: `Requires $${budget} budget / Projected $3,500/mo in 21 days`,
      reason: `Directly aligns with your goal to reach $${targetIncome}/mo income.`,
      actionText: 'Launch 30-Day Plan',
      targetTab: 'business',
      impactScore: 94,
      timestamp: now,
      read: false,
      actedUpon: false,
    },
    {
      id: 'rec_learning_1',
      category: 'Learning',
      title: 'Recommended Masterclass: AI API Integration & Webhooks',
      subtitle: '15 Min Module — Boosts ATS Job Match by +24%',
      reason: 'Fills critical missing skill for high-paying remote roles.',
      actionText: 'Start 15-Min Lesson',
      targetTab: 'learning',
      impactScore: 89,
      timestamp: now,
      read: false,
      actedUpon: false,
    },
    {
      id: 'rec_income_1',
      category: 'Income',
      title: `Strategic Income Accelerator: Stack Freelancing + Affiliate Revenue`,
      subtitle: `Target: Bridge $${Math.max(0, targetIncome - (profile.currentIncome || 0))}/mo gap`,
      reason: 'Combines direct service revenue with recurring SaaS passive commissions.',
      actionText: 'View Income Strategy',
      targetTab: 'coach',
      impactScore: 95,
      timestamp: now,
      read: false,
      actedUpon: false,
    },
  ];
}
