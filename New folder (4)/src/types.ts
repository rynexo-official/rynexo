export type Language = 'en' | 'fr' | 'ar';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  country: string;
  city: string;
  profession?: string;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
  language: Language;
  avatar?: string;
  plan?: string;
  currentStreak?: number;
  incomeTarget?: number;
  currentIncome?: number;
  experience?: string;
  skills: string[];
  languages?: string[];
  careerGoals?: string[];
  businessInterests?: string[];
  budget?: number;
  completedMissions?: string[] | number;
  savedJobs?: number | string[];
  savedBusinesses?: number | string[];

  // Legacy & Compatibility Fields
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | string;
  monthlyGoalUSD?: number;
  availableBudgetUSD?: number;
  weeklyHours?: number;
  careerGoal?: string;
  subscriptionTier?: 'free' | 'standard' | 'pro' | 'business' | 'enterprise' | string;
  subscriptionPlan?: string;
  subscriptionStatus?: 'active' | 'in_trial' | 'past_due' | 'canceled' | 'expired' | 'inactive' | string;
  paymentStatus?: 'active' | 'trial_active' | 'Paid' | 'Pending' | 'canceled' | 'failed' | string;
  paypalTransactionId?: string;
  paypalSubscriptionId?: string;
  nextBillingDate?: string;
  subscriptionCreatedAt?: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;

  // 3-Day Free Trial & SaaS Subscription Model
  trialStatus?: 'active' | 'expired' | 'cancelled' | 'none' | string;
  trialStartDate?: string;
  trialEndDate?: string;
  cancelAtPeriodEnd?: boolean;
  paymentMethodAttached?: boolean;
  lastEmailNotification?: string;

  // Real-time AI Profile & Activity Tracking
  jobsViewed?: string[];
  jobsApplied?: string[];
  businessesCreated?: string[];
  affiliatesJoined?: string[];
  streakHistory?: { date: string; completed: boolean }[];
  achievements?: AchievementBadge[];
  aiReadinessReport?: AIReadinessReport;
  readinessScore?: number;
  currentMonthlyIncomeUSD?: number;

  // AI Autopilot & Memory Extensions
  cvText?: string;
  cvQualityScore?: number;
  careerHistory?: string[];
  salaryTarget?: number;
  rejectedJobs?: any[];
  successfulApplications?: any[];
  careerScore?: number;
}

export interface CareerScoreBreakdown {
  overall: number; // 0 - 100
  cvQuality: number; // 0 - 20
  experienceScore: number; // 0 - 15
  skillsScore: number; // 0 - 20
  languagesScore: number; // 0 - 10
  applicationsScore: number; // 0 - 15
  profileCompleteness: number; // 0 - 10
  dailyActivityScore: number; // 0 - 10
  weeklyImprovement: number; // percentage delta e.g. 14
  monthlyImprovement: number; // percentage delta e.g. 32
}

export interface AIDecisionEngine {
  bestCountries: {
    country: string;
    flag?: string;
    matchScore: number;
    confidence: number;
    salaryRange: string;
    reason: string;
  }[];
  bestCompanies: {
    company: string;
    logo?: string;
    openRoles: number;
    matchScore: number;
    confidence: number;
    hiringProbability: number;
    reason: string;
  }[];
  bestSalaryOpportunities: {
    title: string;
    range: string;
    currency: string;
    confidence: number;
    location: string;
  }[];
  missingSkills: {
    skill: string;
    impact: string;
    priority: 'Critical' | 'High' | 'Medium';
    courseRecommendation?: string;
  }[];
  hiringProbability: number; // 0 - 100%
  dailyPriorities: {
    id: string;
    text: string;
    category: string;
    confidence: number;
    completed?: boolean;
  }[];
  aiConfidence: number; // 0 - 100%
}

export interface AutomaticDailyWorkflow {
  date: string; // YYYY-MM-DD
  dailyMission: {
    id: string;
    title: string;
    description: string;
    category: 'Career' | 'Skill' | 'Application' | 'Networking';
    completed: boolean;
    points: number;
  };
  bestJobsToday: {
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    matchScore: number;
    confidence: number;
    applyUrl: string;
  }[];
  bestCompaniesToday: {
    company: string;
    openRoles: number;
    hiringProbability: number;
    matchReason: string;
  }[];
  skillsToImprove: {
    skill: string;
    category: string;
    level: string;
  }[];
  estimatedMonthlyIncome: number;
  hiringProbability: number;
}

export interface AITimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  type: 'mission_completed' | 'job_saved' | 'job_rejected' | 'application_submitted' | 'skill_unlocked' | 'score_boost' | 'ai_briefing' | 'worker_execution' | 'inter_agent_communication';
  description: string;
  workerId?: string;
  scoreDelta?: number;
  iconName?: string;
}

export type AIWorkerId =
  | 'career'
  | 'resume'
  | 'outreach'
  | 'skill'
  | 'business'
  | 'affiliate'
  | 'productivity'
  | 'market_intelligence';

export interface AIWorker {
  id: AIWorkerId;
  name: string;
  role: string;
  description: string;
  status: 'Active' | 'Executing' | 'Idle' | 'Optimizing';
  lastTask: string;
  lastTaskTime: string;
  currentMission: string;
  confidence: number; // 0 - 100%
  executionTimeMs: number;
  performanceScore: number; // 0 - 100
  inputsRequired: string[];
  outputsProduced: string[];
  iconName: string;
}

export interface InterAgentMessage {
  id: string;
  timestamp: string;
  fromWorkerId: AIWorkerId;
  toWorkerId: AIWorkerId;
  topic: string;
  payload: any;
  status: 'Delivered' | 'Processed';
}

export interface AIWorkerExecution {
  id: string;
  workerId: AIWorkerId;
  workerName: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  status: 'Completed' | 'Failed' | 'In Progress';
  actionTaken: string;
  outputSummary: string;
  dataProduced: any;
  confidence: number;
}

export interface AIMemory {
  uid: string;
  fullName: string;
  country: string;
  city: string;
  languages: string[];
  skills: string[];
  experience: string;
  careerGoals: string[];
  businessInterests: string[];
  budget: number;
  monthlyIncomeTarget: number;
  currentIncome: number;
  preferredJobTypes: string[];
  preferredBusinessTypes: string[];

  // Memory Stores
  cvText?: string;
  cvQualityScore?: number;
  careerHistory?: string[];
  savedJobs: any[];
  savedBusinesses: any[];
  rejectedJobs?: any[];
  successfulApplications?: any[];
  userSearches?: string[];
  dailyActivityLog?: { date: string; action: string; metadata?: any }[];

  // Analytics & Intelligence
  careerScore?: number;
  careerScoreBreakdown?: CareerScoreBreakdown;
  decisionEngine?: AIDecisionEngine;
  dailyWorkflow?: AutomaticDailyWorkflow;
  timelineEvents?: AITimelineEvent[];
  aiReadinessReports?: AIReadinessReport[];
  dailyMissionHistory?: any[];
  successStreak: number;
  aiConversationsSummary?: string;
  lastAIRecommendation?: string;
  lastActiveTime: string;
  updatedAt?: string;
}

export interface JobRecommendation {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  country?: string;
  city?: string;
  location: string;
  isRemote: boolean;
  salaryRange: string;
  matchPercentage?: number;
  type: string;
  category: string;
  description: string;
  whyFits?: string;
  requiredSkills: string[];
  experienceRequired?: string;
  languagesRequired?: string[];
  applicationDeadline?: string;
  companyWebsite?: string;
  applyUrl: string;
  postedDate: string;
  requirements?: string[];
  benefits?: string[];
  isTrending?: boolean;
  isFeaturedCompany?: boolean;
  isUpdatedToday?: boolean;
  isRecentlyAdded?: boolean;
}

export interface BusinessIdea {
  id: string;
  businessName: string;
  title?: string;
  category: string;
  whyFitsYou: string;
  whyFitsProfile?: string;
  startupCost: string;
  requiredBudget?: string;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Expert' | 'Easy' | 'Medium' | 'Advanced';
  difficulty?: string;
  expectedFirstIncome: string;
  timeToFirstIncome?: string;
  estimatedMonthlyIncomePotential: string;
  estimatedMonthlyRevenue?: string;
  requiredSkills: string[];
  requiredTools: string[];
  recommendedTools?: string[];
  bestPlatforms: string[];
  stepByStepLaunchGuide: {
    week: number;
    title: string;
    description: string;
  }[];
  steps?: {
    week: number;
    title: string;
    description: string;
  }[];
  savedAt?: string;
  userId?: string;
}

export interface BusinessScores {
  businessReadiness: number;
  incomePotential: number;
  startupDifficulty: number;
  investmentScore: number;
  successProbability: number;
}

export interface BusinessHighlights {
  bestBusinessTitle: string;
  fastestToLaunchTitle: string;
  lowestInvestmentTitle: string;
  highestIncomePotentialTitle: string;
  lowestRiskTitle: string;
}

export interface BusinessRoadmap30Day {
  businessTitle: string;
  week1: string;
  week2: string;
  week3: string;
  week4: string;
  dailyTasks: string[];
  freeLearningResources: string[];
  aiTools: string[];
  recommendedWebsites: string[];
}

export interface AffiliateOffer {
  id: string;
  name: string;
  category: string;
  logo: string;
  description: string;
  commission: string;
  avgEarnings: string;
  joinUrl: string;
  isCustomAdmin?: boolean;
  addedAt?: string;
}

export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  content: string;
  completed?: boolean;
}

export interface Course {
  id: string;
  title: string;
  category: 'E-Commerce' | 'AI Services' | 'Freelancing' | 'Affiliate Marketing' | 'Remote Careers';
  level: 'Beginner' | 'Intermediate' | 'Mastery';
  duration: string;
  lessonsCount: number;
  progressPercent: number;
  thumbnailUrl: string;
  description: string;
  lessons: CourseLesson[];
}

export interface CoachMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedAction?: {
    type: 'roadmap' | 'task' | 'link';
    payload: string;
  };
}

export interface DailyTask {
  id: string;
  title: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
  estimatedMinutes: number;
}

export interface WeeklyChallengeItem {
  id: string;
  title: string;
  completed: boolean;
  category?: string;
  points?: number;
}

export interface NextActionItem {
  id: string;
  action: string;
  completed: boolean;
  priority?: 'High' | 'Medium' | 'Low';
}

export interface AIReadinessReport {
  id: string;
  userId?: string;
  createdAt: string;
  careerReadinessScore: number;
  businessReadinessScore: number;
  incomePotentialScore: number;
  learningProgressScore: number;
  overallScore: number;
  previousOverallScore?: number;
  progressPercentage?: number;
  analysisSummary: string;
  nextBestActions: NextActionItem[];
  weeklyChallenges: WeeklyChallengeItem[];
}

export interface DailyMission {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  category: 'Career' | 'Business' | 'Freelance' | 'Learning' | 'Income';
  estimatedMinutes: number;
  completed: boolean;
  completedAt?: string;
  actionUrl?: string;
  actionTab?: 'jobs' | 'business' | 'coach' | 'learning' | 'affiliates';
}

export interface OpportunityRecommendation {
  id: string;
  type: 'Job' | 'Business' | 'Freelance' | 'Affiliate' | 'Learning';
  title: string;
  subtitle: string;
  matchScore: number;
  reason: string;
  tags: string[];
  actionTab: 'jobs' | 'business' | 'coach' | 'learning' | 'affiliates';
  url?: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: 'Streak' | 'Job' | 'Business' | 'Income' | 'Client';
}

export interface DailySuccessProgress {
  userId: string;
  currentStreak: number;
  bestStreak: number;
  daysCompletedCount: number;
  lastCompletedDate?: string; // YYYY-MM-DD
  todayMission: DailyMission;
  weeklyCompletedDays: number; // e.g. 5 out of 7
  monthlyCompletedDays: number; // e.g. 18 out of 30
  monthlyGoalIncomeUSD: number;
  currentMonthlyIncomeUSD: number;
  dailyMotivationText: string;
  dailyMotivationDate: string;
  completedMissionIds: string[];
  achievements: AchievementBadge[];
  opportunities: OpportunityRecommendation[];
  updatedAt: string;
}

// ==========================================
// ENTERPRISE PHASE ECOSYSTEM TYPES
// ==========================================

export interface CompanyAccount {
  id: string;
  name: string;
  logoUrl?: string;
  verified: boolean;
  industry: string;
  companySize: string;
  website: string;
  location: string;
  description: string;
  publishedJobsCount: number;
  activeRecruitersCount: number;
  savedCandidateIds: string[];
  invitedCandidateIds: string[];
  joinedAt: string;
}

export interface RecruiterAccount {
  id: string;
  fullName: string;
  email: string;
  agencyName: string;
  companyIds: string[];
  activeSearchesCount: number;
  interviewsScheduledCount: number;
  aiRankedCandidateMatches: number;
  joinedAt: string;
}

export interface CandidateInterview {
  id: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  scheduledTime: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  meetingUrl: string;
  notes?: string;
}

export interface FreelanceService {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  title: string;
  category: string;
  shortDescription: string;
  priceUSD: number;
  deliveryDays: number;
  rating: number;
  reviewsCount: number;
  aiRecommendationScore: number; // 0 - 100
  tags: string[];
  featured: boolean;
  createdAt: string;
}

export interface AffiliateProgramDetail {
  id: string;
  title: string;
  companyName: string;
  logoUrl?: string;
  category: string;
  commissionRate: string; // e.g. "40% Recurring"
  cookieDurationDays: number; // e.g. 60
  payoutFrequency: 'Weekly' | 'Bi-Weekly' | 'Monthly' | 'Instant';
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  aiScore: number; // 0 - 100
  avgMonthlyEarningsUSD: number;
  affiliateUrl: string;
  description: string;
  tags: string[];
}

export interface DigitalProduct {
  id: string;
  title: string;
  creatorId: string;
  creatorName: string;
  category: 'Template' | 'AI Prompt' | 'CV Template' | 'Course' | 'E-book' | 'Software' | 'Digital Tool';
  priceUSD: number;
  rating: number;
  salesCount: number;
  description: string;
  previewUrl?: string;
  fileFormat: string;
  tags: string[];
  featured: boolean;
  createdAt: string;
}

export type PaymentGatewayType = 'Stripe' | 'PayPal' | 'Paddle' | 'LemonSqueezy' | 'Crypto Web3';

export interface PaymentTransaction {
  id: string;
  userId: string;
  userEmail: string;
  gateway: PaymentGatewayType;
  amountUSD: number;
  currency: string;
  status: 'Succeeded' | 'Processing' | 'Failed' | 'Refunded';
  planId?: string;
  productId?: string;
  createdAt: string;
}

export type SubscriptionTierType = 'Free' | 'Standard' | 'Pro' | 'Business' | 'Enterprise';

export interface SubscriptionPlan {
  id: SubscriptionTierType;
  name: string;
  priceMonthlyUSD: number;
  priceYearlyUSD: number;
  tagline: string;
  features: string[];
  limits: {
    jobApplicationsPerMonth: number | 'Unlimited';
    aiWorkerExecutionsPerDay: number | 'Unlimited';
    recruiterSeats: number;
    customAffiliateOffers: number | 'Unlimited';
    apiAccess: boolean;
    dedicatedAccountManager: boolean;
  };
  popular?: boolean;
}

export interface AdminAnalytics {
  mrrUSD: number;
  arrUSD: number;
  totalRevenueUSD: number;
  conversionRate: number; // percentage
  retentionRate: number; // percentage
  activeUsersCount: number;
  registeredUsersCount: number;
  companiesCount: number;
  recruitersCount: number;
  digitalProductsCount: number;
  freelanceServicesCount: number;
  topCountries: { country: string; userCount: number; revenueUSD: number }[];
  topCompanies: { name: string; jobsPosted: number; hiresCount: number }[];
  topAffiliatePrograms: { name: string; clicks: number; earningsUSD: number }[];
  apiHealth: { service: string; status: 'Operational' | 'Degraded' | 'Down'; latencyMs: number }[];
}



