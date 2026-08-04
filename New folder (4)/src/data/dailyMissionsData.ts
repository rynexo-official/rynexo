import {
  DailyMission,
  OpportunityRecommendation,
  AchievementBadge,
  DailySuccessProgress,
  UserProfile,
} from '../types';

export const DEFAULT_ACHIEVEMENTS: AchievementBadge[] = [
  {
    id: 'badge_first_mission',
    title: 'First Step to Mastery',
    description: 'Completed your first daily RYNEXO success mission',
    iconName: 'Zap',
    unlocked: false,
    category: 'Streak',
  },
  {
    id: 'badge_first_job',
    title: 'First Job Applied',
    description: 'Applied to a high-paying remote job offer',
    iconName: 'Briefcase',
    unlocked: false,
    category: 'Job',
  },
  {
    id: 'badge_first_biz',
    title: 'First Business Created',
    description: 'Generated and structured a custom AI business model',
    iconName: 'Rocket',
    unlocked: false,
    category: 'Business',
  },
  {
    id: 'badge_7day_streak',
    title: '7-Day Streak',
    description: 'Maintained a 7-day consecutive success streak',
    iconName: 'Flame',
    unlocked: false,
    category: 'Streak',
  },
  {
    id: 'badge_30day_streak',
    title: '30-Day Unstoppable',
    description: 'Maintained a 30-day consecutive success streak',
    iconName: 'Award',
    unlocked: false,
    category: 'Streak',
  },
  {
    id: 'badge_first_client',
    title: 'First Client Outreach',
    description: 'Pitched an AI or freelance service offer to a client',
    iconName: 'Target',
    unlocked: false,
    category: 'Client',
  },
  {
    id: 'badge_first_income',
    title: 'First Online Income',
    description: 'Unlocked your first digital or freelance earnings',
    iconName: 'DollarSign',
    unlocked: false,
    category: 'Income',
  },
  {
    id: 'badge_affiliate_success',
    title: 'Affiliate Master',
    description: 'Shared or joined a recurring SaaS affiliate program',
    iconName: 'Share2',
    unlocked: false,
    category: 'Income',
  },
];

export const DAILY_MISSIONS_POOL: Omit<DailyMission, 'date' | 'completed' | 'completedAt'>[] = [
  {
    id: 'mission_apply_jobs',
    title: 'Apply to 3 Remote Jobs',
    description: 'Browse top verified remote listings in RYNEXO Find Job Hub and submit your application.',
    category: 'Career',
    estimatedMinutes: 15,
    actionTab: 'jobs',
  },
  {
    id: 'mission_improve_cv',
    title: 'Improve Your CV with AI Coach',
    description: 'Run your CV through RYNEXO AI Career Coach to optimize keywords for global ATS screeners.',
    category: 'Career',
    estimatedMinutes: 10,
    actionTab: 'coach',
  },
  {
    id: 'mission_contact_client',
    title: 'Contact 1 Potential B2B Client',
    description: 'Send a personalized email or LinkedIn message offering a 10-minute AI efficiency audit.',
    category: 'Business',
    estimatedMinutes: 12,
    actionTab: 'business',
  },
  {
    id: 'mission_learn_ai_skill',
    title: 'Learn 1 AI Prompting Skill',
    description: 'Complete one lesson in RYNEXO Learning Center on Advanced Gemini API Prompting.',
    category: 'Learning',
    estimatedMinutes: 20,
    actionTab: 'learning',
  },
  {
    id: 'mission_fiverr_gig',
    title: 'Create Your First Fiverr / Upwork Offer',
    description: 'Package your AI prompt or content creation skill into a $50 - $150 freelance offer.',
    category: 'Freelance',
    estimatedMinutes: 25,
    actionTab: 'business',
  },
  {
    id: 'mission_linkedin_post',
    title: 'Publish 1 Value LinkedIn Post',
    description: 'Share a quick breakdown of how AI tools automate workflows to attract inbound clients.',
    category: 'Career',
    estimatedMinutes: 10,
    actionTab: 'coach',
  },
  {
    id: 'mission_landing_page',
    title: 'Build 1 Business Landing Page Blueprint',
    description: 'Use RYNEXO AI Business Incubator to outline a high-converting 30-day launch roadmap.',
    category: 'Business',
    estimatedMinutes: 15,
    actionTab: 'business',
  },
  {
    id: 'mission_affiliate_share',
    title: 'Select 1 High-Ticket Affiliate Offer',
    description: 'Join a high-paying recurring SaaS program in RYNEXO Affiliate Hub to build passive income.',
    category: 'Income',
    estimatedMinutes: 8,
    actionTab: 'affiliates',
  },
];

export function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function getTodayMissionForUser(user: UserProfile | null): DailyMission {
  const todayStr = getTodayDateString();
  // Pick mission deterministically based on date string hash
  let hash = 0;
  for (let i = 0; i < todayStr.length; i++) {
    hash = (hash << 5) - hash + todayStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % DAILY_MISSIONS_POOL.length;
  const template = DAILY_MISSIONS_POOL[index];

  return {
    ...template,
    date: todayStr,
    completed: false,
  };
}

export function getTodayOpportunities(user: UserProfile | null): OpportunityRecommendation[] {
  const country = user?.country || 'Global';
  const goal = user?.careerGoal || 'AI Business';

  return [
    {
      id: 'opp_job_1',
      type: 'Job',
      title: 'Remote AI Prompt & Operations Specialist',
      subtitle: '$4,500 - $7,000 / month • Full-Time Remote',
      matchScore: 96,
      reason: `Matches your location (${country}) and interest in ${goal}.`,
      tags: ['Remote', 'AI Prompting', 'High Pay'],
      actionTab: 'jobs',
    },
    {
      id: 'opp_biz_1',
      type: 'Business',
      title: 'B2B AI Automation & Prompt Agency',
      subtitle: '$3,500 - $8,000 / month • Low Startup Cost',
      matchScore: 94,
      reason: 'Low budget required with high scalable monthly retainer model.',
      tags: ['AI Agency', 'Retainer', '14-Day Launch'],
      actionTab: 'business',
    },
    {
      id: 'opp_free_1',
      type: 'Freelance',
      title: 'Upwork AI Workflow & Make.com Architect',
      subtitle: '$45 - $85 / hour • Flexible Hours',
      matchScore: 92,
      reason: 'High demand from global clients seeking automated business workflows.',
      tags: ['Freelance', 'Hourly', 'Flex Time'],
      actionTab: 'business',
    },
    {
      id: 'opp_aff_1',
      type: 'Affiliate',
      title: 'Hostinger & AI Tools Partner Program',
      subtitle: '40% Recurring Commission per Signup',
      matchScore: 89,
      reason: 'Generates predictable passive income with zero inventory.',
      tags: ['Passive Income', 'SaaS', 'High Conversion'],
      actionTab: 'affiliates',
    },
    {
      id: 'opp_learn_1',
      type: 'Learning',
      title: 'Mastering AI Prompting & Client Acquisition',
      subtitle: 'RYNEXO Certificate Course • 45 Mins',
      matchScore: 98,
      reason: 'Core skill needed to increase your income potential by 3x.',
      tags: ['Certificate', 'Mastery', '45 Mins'],
      actionTab: 'learning',
    },
  ];
}

export function getTodayMotivationMessage(user: UserProfile | null, streak: number): string {
  const name = user?.fullName ? user.fullName.split(' ')[0] : 'Achiever';
  const country = user?.country ? `in ${user.country}` : 'globally';

  const messages = [
    `${name}, consistency beats talent every time. Your ${streak}-day streak is positioning you for high-paying opportunities ${country}!`,
    `Great progress, ${name}! One daily mission executed with discipline puts you ahead of 95% of competitors globally.`,
    `${name}, every small step today compounds into massive career and income growth tomorrow. Focus on today's mission!`,
    `Unstoppable energy, ${name}! Your dedication to building digital income streams ${country} is creating real freedom.`,
    `Keep pushing forward, ${name}! High earners aren't made overnight—they are built day by day with RYNEXO.`,
  ];

  const todayStr = getTodayDateString();
  let hash = 0;
  for (let i = 0; i < todayStr.length; i++) {
    hash = (hash << 5) - hash + todayStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % messages.length;
  return messages[index];
}

export function getInitialSuccessProgress(user: UserProfile | null): DailySuccessProgress {
  const todayMission = getTodayMissionForUser(user);
  const todayStr = getTodayDateString();

  return {
    userId: user?.uid || 'guest',
    currentStreak: 0,
    bestStreak: 0,
    daysCompletedCount: 0,
    todayMission,
    weeklyCompletedDays: 0,
    monthlyCompletedDays: 0,
    monthlyGoalIncomeUSD: 0,
    currentMonthlyIncomeUSD: 0,
    dailyMotivationText: getTodayMotivationMessage(user, 0),
    dailyMotivationDate: todayStr,
    completedMissionIds: [],
    achievements: DEFAULT_ACHIEVEMENTS,
    opportunities: getTodayOpportunities(user),
    updatedAt: new Date().toISOString(),
  };
}
