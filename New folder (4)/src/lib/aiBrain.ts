import { UserProfile, AIMemory, DailySuccessProgress, DailyMission } from '../types';
import {
  fetchUserProfileFromFirestore,
  syncAIMemoryToFirestore,
  updateAIMemoryRecommendationInFirestore,
  fetchDailySuccessProgressFromFirestore,
  saveDailySuccessProgressToFirestore,
} from './firebase';
import { getInitialSuccessProgress, getTodayDateString, getTodayMissionForUser } from '../data/dailyMissionsData';

export interface AIBrainBriefing {
  greeting?: string;
  todayFocus?: string;
  missingSkillsToMaster?: string[];
  recommendedJobsCount?: number;
  topCareerPath?: string;
  topBusinessPath?: string;
  nextStepAction?: string;
  strategicSummary?: string;
}

export interface AIBrainState {
  userProfile: UserProfile | null;
  aiMemory: AIMemory | null;
  briefing: AIBrainBriefing | null;
  dailySuccess: DailySuccessProgress | null;
  careerPlan: any | null;
  affiliatePlan: any | null;
  lastSyncTimestamp: number;
}

// Global In-Memory Cache to prevent duplicate Firestore reads
let brainCache: Record<string, AIBrainState> = {};

/**
 * Central AI Brain decision loader.
 * Coordinates profile, permanent AI Memory, daily success progress, and Gemini AI Brain briefings.
 */
export async function loadAIBrainIntelligence(
  user: UserProfile,
  forceRefresh = false
): Promise<AIBrainState> {
  const uid = user?.uid || 'guest';
  const now = Date.now();

  // Return cached intelligence if fresh (< 3 minutes old) and not forced
  if (!forceRefresh && brainCache[uid] && now - brainCache[uid].lastSyncTimestamp < 180000) {
    return brainCache[uid];
  }

  // 1. Fetch latest profile & AI memory from Firestore
  let freshProfile = user;
  if (user?.uid) {
    const fetched = await fetchUserProfileFromFirestore(user.uid);
    if (fetched) freshProfile = fetched;
  }

  let memory: AIMemory | null = null;
  if (freshProfile?.uid) {
    memory = await syncAIMemoryToFirestore(freshProfile);
  }

  // 2. Load Daily Success progress
  let daily = await fetchDailySuccessProgressFromFirestore(freshProfile?.uid);

  const todayStr = getTodayDateString();
  if (!daily) {
    daily = getInitialSuccessProgress(freshProfile);
    if (freshProfile?.uid) {
      await saveDailySuccessProgressToFirestore(daily);
    }
  } else if (daily.todayMission && daily.todayMission.date !== todayStr) {
    // New calendar day mission reset
    const newMission = getTodayMissionForUser(freshProfile);
    daily.todayMission = newMission;
    daily.dailyMotivationDate = todayStr;
    if (freshProfile?.uid) {
      await saveDailySuccessProgressToFirestore(daily);
    }
  }

  // 3. Trigger Central AI Brain Endpoint
  let briefing: AIBrainBriefing | null = null;
  try {
    const res = await fetch('/api/ai/brain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userProfile: freshProfile,
        aiMemory: memory,
      }),
    });
    const data = await res.json();
    if (data.success && data.brain) {
      briefing = data.brain;
      if (freshProfile?.uid && briefing?.strategicSummary) {
        updateAIMemoryRecommendationInFirestore(
          freshProfile.uid,
          briefing.strategicSummary,
          briefing.todayFocus
        ).catch(() => {});
      }
    }
  } catch (e) {
    console.warn('AI Brain endpoint call warning:', e);
  }

  const newState: AIBrainState = {
    userProfile: freshProfile,
    aiMemory: memory,
    briefing,
    dailySuccess: daily,
    careerPlan: null,
    affiliatePlan: null,
    lastSyncTimestamp: now,
  };

  brainCache[uid] = newState;
  return newState;
}

export function getCachedAIBrainState(uid: string): AIBrainState | null {
  return brainCache[uid] || null;
}

export async function recordAIBrainConversation(
  uid: string,
  summary: string,
  recommendation: string
): Promise<void> {
  if (!uid) return;
  await updateAIMemoryRecommendationInFirestore(uid, recommendation, summary);
  if (brainCache[uid] && brainCache[uid].aiMemory) {
    brainCache[uid].aiMemory!.lastAIRecommendation = recommendation;
    brainCache[uid].aiMemory!.aiConversationsSummary = summary;
  }
}
