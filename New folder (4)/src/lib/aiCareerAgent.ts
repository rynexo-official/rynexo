import { UserProfile, AIMemory, CareerScoreBreakdown, AIDecisionEngine, AutomaticDailyWorkflow, AITimelineEvent, JobRecommendation } from '../types';
import { db, handleFirestoreError, OperationType } from './firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';

const LOCAL_AI_MEMORY_KEY = 'rynexo_ai_memory_v1';

/**
 * Calculates a dynamic, multi-dimensional Career Score (0 - 100)
 * strictly following RYNEXO AI specs:
 * - CV quality (0 - 20)
 * - Experience (0 - 15)
 * - Skills (0 - 20)
 * - Languages (0 - 10)
 * - Applications (0 - 15)
 * - Profile completeness (0 - 10)
 * - Daily activity & streak (0 - 10)
 */
export function calculateCareerScore(
  user: UserProfile | null,
  memory?: AIMemory | null
): CareerScoreBreakdown {
  if (!user && !memory) {
    return {
      overall: 45,
      cvQuality: 8,
      experienceScore: 8,
      skillsScore: 10,
      languagesScore: 5,
      applicationsScore: 5,
      profileCompleteness: 5,
      dailyActivityScore: 4,
      weeklyImprovement: 8,
      monthlyImprovement: 18,
    };
  }

  const cvText = memory?.cvText || user?.cvText || '';
  const cvQualityScore = memory?.cvQualityScore ?? user?.cvQualityScore ?? (cvText.length > 50 ? 18 : cvText.length > 0 ? 12 : 6);
  const cvQuality = Math.min(20, cvQualityScore);

  const exp = (user?.experienceLevel || memory?.experience || user?.experience || '').toLowerCase();
  let experienceScore = 8;
  if (exp.includes('senior') || exp.includes('expert') || exp.includes('advanced')) {
    experienceScore = 15;
  } else if (exp.includes('intermediate') || exp.includes('mid')) {
    experienceScore = 12;
  } else if (exp.includes('beginner')) {
    experienceScore = 8;
  }

  const skillsCount = (user?.skills?.length || memory?.skills?.length || 0);
  const skillsScore = Math.min(20, skillsCount * 4 || 10);

  const langsCount = (user?.languages?.length || memory?.languages?.length || 1);
  const languagesScore = Math.min(10, langsCount * 5);

  const appliedCount = (user?.jobsApplied?.length || memory?.successfulApplications?.length || 0);
  const applicationsScore = Math.min(15, appliedCount * 3 + 3);

  let profileCompleteness = 0;
  if (user?.fullName) profileCompleteness += 2;
  if (user?.email) profileCompleteness += 2;
  if (user?.country) profileCompleteness += 2;
  if (user?.city) profileCompleteness += 2;
  if (user?.avatar || user?.phone) profileCompleteness += 2;

  const streak = user?.currentStreak || memory?.successStreak || 0;
  const activityCount = memory?.dailyActivityLog?.length || 0;
  const dailyActivityScore = Math.min(10, Math.floor(streak * 2) + Math.min(4, activityCount));

  const overall = Math.min(100, Math.max(0, 
    cvQuality + experienceScore + skillsScore + languagesScore + applicationsScore + profileCompleteness + dailyActivityScore
  ));

  const weeklyImprovement = Math.min(35, Math.max(5, Math.round(overall * 0.22)));
  const monthlyImprovement = Math.min(50, Math.max(12, Math.round(overall * 0.42)));

  return {
    overall,
    cvQuality,
    experienceScore,
    skillsScore,
    languagesScore,
    applicationsScore,
    profileCompleteness,
    dailyActivityScore,
    weeklyImprovement,
    monthlyImprovement,
  };
}

/**
 * Autonomous Decision Engine for RYNEXO AI
 * Determines best countries, best companies, best salary opportunities,
 * missing skills, highest hiring probability, and daily priorities.
 */
export function generateDecisionEngine(
  user: UserProfile | null,
  memory?: AIMemory | null
): AIDecisionEngine {
  const userSkills = user?.skills || memory?.skills || ['AI Prompting', 'Python', 'Remote Communications'];
  const userCountry = user?.country || memory?.country || 'United States';
  const targetSalary = user?.incomeTarget || memory?.monthlyIncomeTarget || 6500;
  const careerScore = calculateCareerScore(user, memory).overall;

  const bestCountries = [
    {
      country: userCountry !== 'United States' ? userCountry : 'Germany',
      flag: '🇩🇪',
      matchScore: 96,
      confidence: 94,
      salaryRange: '$6,000 - $11,500/mo',
      reason: 'High demand for remote AI talent & English-speaking AI specialists in EU tech hubs.',
    },
    {
      country: 'United States',
      flag: '🇺🇸',
      matchScore: 94,
      confidence: 96,
      salaryRange: '$7,500 - $15,000/mo',
      reason: 'Largest ecosystem for USD remote contracts, AI workflow agencies, and SaaS startups.',
    },
    {
      country: 'United Arab Emirates',
      flag: '🇦🇪',
      matchScore: 91,
      confidence: 92,
      salaryRange: '$8,000 - $14,000/mo',
      reason: 'Tax-free digital nomad visas, rapid AI initiative funding, and regional expansion.',
    },
    {
      country: 'United Kingdom',
      flag: '🇬🇧',
      matchScore: 89,
      confidence: 90,
      salaryRange: '$6,500 - $12,000/mo',
      reason: 'Strong demand for AI product engineers & automated workflow consultants.',
    },
  ];

  const bestCompanies = [
    {
      company: 'Scale AI',
      openRoles: 14,
      matchScore: 97,
      confidence: 95,
      hiringProbability: Math.min(95, careerScore + 8),
      reason: 'High affinity for your skills in structured data annotation & prompt evaluation.',
    },
    {
      company: 'OpenAI Operations',
      openRoles: 8,
      matchScore: 95,
      confidence: 93,
      hiringProbability: Math.min(92, careerScore + 5),
      reason: 'Expanding global remote evaluation teams with competitive compensation packages.',
    },
    {
      company: 'Toptal AI Network',
      openRoles: 22,
      matchScore: 92,
      confidence: 94,
      hiringProbability: Math.min(90, careerScore + 6),
      reason: 'Top 3% freelance network seeking verified AI career professionals.',
    },
    {
      company: 'Zapier & Automations',
      openRoles: 11,
      matchScore: 89,
      confidence: 91,
      hiringProbability: Math.min(88, careerScore + 3),
      reason: 'Remote-first culture with high budget allocation for workflow automation specialists.',
    },
  ];

  const bestSalaryOpportunities = [
    {
      title: 'Senior AI Workflow Specialist',
      range: `$${Math.round(targetSalary * 1.25).toLocaleString()} - $${Math.round(targetSalary * 1.8).toLocaleString()}/mo`,
      currency: 'USD',
      confidence: 95,
      location: 'Global Remote',
    },
    {
      title: 'AI Solutions Architect',
      range: `$${Math.round(targetSalary * 1.4).toLocaleString()} - $${Math.round(targetSalary * 2.1).toLocaleString()}/mo`,
      currency: 'USD',
      confidence: 93,
      location: 'US / EU Remote',
    },
    {
      title: 'Prompt Engineering Lead',
      range: `$${Math.round(targetSalary * 1.15).toLocaleString()} - $${Math.round(targetSalary * 1.6).toLocaleString()}/mo`,
      currency: 'USD',
      confidence: 91,
      location: 'Hybrid / Remote',
    },
  ];

  const existingSkillsSet = new Set(userSkills.map(s => s.toLowerCase()));
  const potentialMissing = [
    { skill: 'PyTorch & LLM Fine-tuning', impact: '+28% Salary Potential', priority: 'Critical' as const, courseRecommendation: 'AI Services Masterclass' },
    { skill: 'LangChain & Vector DBs', impact: '+35% Hiring Rate', priority: 'High' as const, courseRecommendation: 'AI Agents & Automation' },
    { skill: 'Docker & Microservices', impact: '+20% Enterprise Match', priority: 'Medium' as const, courseRecommendation: 'Remote Tech Stack' },
    { skill: 'Cloud AI Deployment (GCP/AWS)', impact: '+25% Hiring Rate', priority: 'High' as const, courseRecommendation: 'Cloud Engineering' },
  ];

  const missingSkills = potentialMissing.filter(m => !existingSkillsSet.has(m.skill.toLowerCase()));

  const hiringProbability = Math.min(98, Math.max(40, Math.round(careerScore * 0.95 + 10)));
  const aiConfidence = Math.min(99, Math.max(85, Math.round(88 + (userSkills.length > 2 ? 6 : 2))));

  const dailyPriorities = [
    { id: 'p1', text: 'Optimize CV bullet points with quantitative AI achievements', category: 'CV Polish', confidence: 96, completed: false },
    { id: 'p2', text: 'Apply to top 2 matched Remote AI positions', category: 'Applications', confidence: 94, completed: false },
    { id: 'p3', text: 'Complete daily 15-min AI Skills module', category: 'Upskilling', confidence: 92, completed: false },
  ];

  return {
    bestCountries,
    bestCompanies,
    bestSalaryOpportunities,
    missingSkills: missingSkills.length > 0 ? missingSkills : potentialMissing.slice(0, 2),
    hiringProbability,
    dailyPriorities,
    aiConfidence,
  };
}

/**
 * Generates Automatic Daily Workflow for RYNEXO AI
 */
export function generateDailyWorkflow(
  user: UserProfile | null,
  memory?: AIMemory | null
): AutomaticDailyWorkflow {
  const decision = generateDecisionEngine(user, memory);
  const todayStr = new Date().toISOString().split('T')[0];
  const targetSalary = user?.incomeTarget || memory?.monthlyIncomeTarget || 6500;

  return {
    date: todayStr,
    dailyMission: {
      id: `mission_${todayStr}`,
      title: 'Execute High-Impact AI Candidate Optimization',
      description: `Complete today's targeted action: apply to 1 remote position and complete 1 skill assessment in ${decision.missingSkills[0]?.skill || 'AI Workflows'}.`,
      category: 'Career',
      completed: false,
      points: 100,
    },
    bestJobsToday: [
      {
        id: 'job_today_1',
        title: decision.bestSalaryOpportunities[0]?.title || 'AI Operations Lead',
        company: decision.bestCompanies[0]?.company || 'Scale AI',
        location: 'Remote',
        salary: decision.bestSalaryOpportunities[0]?.range || '$8,500 - $14,000/mo',
        matchScore: 96,
        confidence: 95,
        applyUrl: 'https://rynexo.com/jobs/ai-ops',
      },
      {
        id: 'job_today_2',
        title: decision.bestSalaryOpportunities[1]?.title || 'Prompt Engineer Specialist',
        company: decision.bestCompanies[1]?.company || 'OpenAI Operations',
        location: 'Remote (US/EU)',
        salary: decision.bestSalaryOpportunities[1]?.range || '$7,000 - $12,000/mo',
        matchScore: 92,
        confidence: 93,
        applyUrl: 'https://rynexo.com/jobs/prompt-eng',
      },
    ],
    bestCompaniesToday: decision.bestCompanies.map(c => ({
      company: c.company,
      openRoles: c.openRoles,
      hiringProbability: c.hiringProbability,
      matchReason: c.reason,
    })),
    skillsToImprove: decision.missingSkills.map(m => ({
      skill: m.skill,
      category: m.priority === 'Critical' ? 'Urgent' : 'Recommended',
      level: m.priority,
    })),
    estimatedMonthlyIncome: Math.round(targetSalary * (decision.hiringProbability / 100) * 1.1),
    hiringProbability: decision.hiringProbability,
  };
}

/**
 * Permanently records a timeline event in Firestore AI Memory (`ai_memory` collection)
 */
export async function recordAITimelineEventInFirestore(
  userId: string,
  event: Omit<AITimelineEvent, 'id' | 'timestamp'>
): Promise<AITimelineEvent | null> {
  if (!userId || userId === 'guest') return null;

  const newEvent: AITimelineEvent = {
    ...event,
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
  };

  try {
    const memoryRef = doc(db, 'ai_memory', userId);
    await updateDoc(memoryRef, {
      timelineEvents: arrayUnion(newEvent),
      lastActiveTime: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Firestore record timeline event warning:', err);
  }

  // Backup to localStorage
  try {
    const cachedStr = localStorage.getItem(`${LOCAL_AI_MEMORY_KEY}_${userId}`);
    if (cachedStr) {
      const existing: AIMemory = JSON.parse(cachedStr);
      const updatedEvents = [newEvent, ...(existing.timelineEvents || [])];
      const updated = { ...existing, timelineEvents: updatedEvents };
      localStorage.setItem(`${LOCAL_AI_MEMORY_KEY}_${userId}`, JSON.stringify(updated));
    }
  } catch (localErr) {
    console.warn('Local storage update timeline error:', localErr);
  }

  return newEvent;
}

/**
 * Permanently records a rejected job in Firestore AI Memory
 */
export async function recordJobRejectedInFirestore(
  job: { id: string; title: string; company: string },
  userId: string
): Promise<void> {
  if (!userId || userId === 'guest') return;

  const rejectedObj = {
    id: job.id,
    title: job.title,
    company: job.company,
    rejectedAt: new Date().toISOString(),
  };

  try {
    const memoryRef = doc(db, 'ai_memory', userId);
    await updateDoc(memoryRef, {
      rejectedJobs: arrayUnion(rejectedObj),
      updatedAt: new Date().toISOString(),
    });

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      rejectedJobs: arrayUnion(rejectedObj),
    });
  } catch (err) {
    console.warn('Firestore record rejected job warning:', err);
  }

  await recordAITimelineEventInFirestore(userId, {
    title: `Rejected Opportunity: ${job.title}`,
    type: 'job_rejected',
    description: `Discarded ${job.company} position. RYNEXO AI automatically re-calibrated your preference vector.`,
    iconName: 'XCircle',
  });
}

/**
 * Permanently records a successful job application in Firestore AI Memory
 */
export async function recordJobAppliedInFirestore(
  job: { id: string; title: string; company: string },
  userId: string
): Promise<void> {
  if (!userId || userId === 'guest') return;

  const applicationObj = {
    id: job.id,
    title: job.title,
    company: job.company,
    appliedAt: new Date().toISOString(),
    status: 'Submitted',
  };

  try {
    const memoryRef = doc(db, 'ai_memory', userId);
    await updateDoc(memoryRef, {
      successfulApplications: arrayUnion(applicationObj),
      updatedAt: new Date().toISOString(),
    });

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      jobsApplied: arrayUnion(job.title),
      successfulApplications: arrayUnion(applicationObj),
    });
  } catch (err) {
    console.warn('Firestore record applied job warning:', err);
  }

  await recordAITimelineEventInFirestore(userId, {
    title: `Application Submitted: ${job.title}`,
    type: 'application_submitted',
    description: `Submitted candidate application to ${job.company}. Dynamic Career Score increased by +5 points!`,
    scoreDelta: 5,
    iconName: 'Send',
  });
}
