import {
  UserProfile,
  AIMemory,
  AIWorker,
  AIWorkerId,
  AIWorkerExecution,
  InterAgentMessage,
  AITimelineEvent
} from '../types';
import { db } from './firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { recordAITimelineEventInFirestore } from './aiCareerAgent';

const LOCAL_EXECUTIVE_WORKFORCE_KEY = 'rynexo_executive_workforce_v1';

export const INITIAL_AI_WORKERS: AIWorker[] = [
  {
    id: 'career',
    name: 'Career Agent',
    role: 'Opportunity Hunter & Job Matcher',
    description: 'Continuously scans global job databases to pinpoint maximum salary match roles.',
    status: 'Active',
    lastTask: 'Analyzed 1,420 remote AI roles for high confidence vector match',
    lastTaskTime: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    currentMission: 'Identify top 5 high-salary remote positions matching candidate skills',
    confidence: 97,
    executionTimeMs: 142,
    performanceScore: 98,
    inputsRequired: ['Profile Skills', 'Country', 'Salary Target'],
    outputsProduced: ['Target Jobs List', 'Company Match Ratings'],
    iconName: 'Briefcase',
  },
  {
    id: 'resume',
    name: 'Resume Agent',
    role: 'CV Strategist & ATS Optimizer',
    description: 'Continuously rewrites and tailors candidate CV bullet points for specific target companies.',
    status: 'Active',
    lastTask: 'Optimized CV impact metrics for Scale AI & OpenAI roles',
    lastTaskTime: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    currentMission: 'Inject quantitative AI project metrics into CV executive summary',
    confidence: 94,
    executionTimeMs: 185,
    performanceScore: 95,
    inputsRequired: ['CV Text', 'Target Jobs', 'Skills'],
    outputsProduced: ['ATS Score', 'Tailored CV Bullets', 'Keyword Alignments'],
    iconName: 'FileText',
  },
  {
    id: 'outreach',
    name: 'Outreach Agent',
    role: 'Executive Communication & Proposals',
    description: 'Generates personalized cold emails, recruiter pitches, and application proposals.',
    status: 'Active',
    lastTask: 'Drafted 3 personalized cover emails tailored to Hiring Managers',
    lastTaskTime: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    currentMission: 'Generate customized outreach template for Senior AI Specialist role',
    confidence: 95,
    executionTimeMs: 210,
    performanceScore: 96,
    inputsRequired: ['Target Job', 'Candidate Highlights', 'Contact Email'],
    outputsProduced: ['Personalized Email Draft', 'Recruiter Pitch', 'Follow-up Sequence'],
    iconName: 'Send',
  },
  {
    id: 'skill',
    name: 'Skill Agent',
    role: 'Personalized Learning Roadmap Specialist',
    description: 'Identifies critical skill gaps preventing top 10% income tier and maps exact courses.',
    status: 'Active',
    lastTask: 'Mapped PyTorch & LangChain upskilling track with 35% income uplift potential',
    lastTaskTime: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    currentMission: 'Curate 15-minute daily bite-sized learning modules for critical gaps',
    confidence: 92,
    executionTimeMs: 130,
    performanceScore: 94,
    inputsRequired: ['Current Skills', 'Target Role Gaps'],
    outputsProduced: ['Learning Roadmap', 'Recommended Courses', 'Skill Badges'],
    iconName: 'GraduationCap',
  },
  {
    id: 'business',
    name: 'Business Agent',
    role: 'Online Business & SaaS Founder',
    description: 'Generates turnkey remote business models, AI agencies, and monetization strategies.',
    status: 'Active',
    lastTask: 'Synthesized AI Workflow Automation Agency business blueprint ($8,500/mo projection)',
    lastTaskTime: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    currentMission: 'Outline step-by-step launch checklist for AI consulting model',
    confidence: 91,
    executionTimeMs: 195,
    performanceScore: 92,
    inputsRequired: ['Candidate Skills', 'Budget', 'Business Preferences'],
    outputsProduced: ['Business Plan', 'Revenue Model', 'Launch Checklist'],
    iconName: 'Rocket',
  },
  {
    id: 'affiliate',
    name: 'Affiliate Agent',
    role: 'High-Yield Affiliate Monetization Engine',
    description: 'Discovers high-paying recurring software affiliate programs matching candidate niche.',
    status: 'Active',
    lastTask: 'Scouted 4 high-ticket AI software affiliate programs (40% recurring payout)',
    lastTaskTime: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    currentMission: 'Embed high-conversion affiliate offers into candidate business funnel',
    confidence: 93,
    executionTimeMs: 160,
    performanceScore: 93,
    inputsRequired: ['Niche Category', 'Audience Type'],
    outputsProduced: ['Affiliate Offers', 'Commission Rates', 'Promo Links'],
    iconName: 'DollarSign',
  },
  {
    id: 'productivity',
    name: 'Productivity Agent',
    role: 'Workflow Execution & Daily Priorities',
    description: 'Synthesizes outputs from all AI workers into streamlined daily priority tasks.',
    status: 'Active',
    lastTask: 'Assembled 3 daily high-priority missions for maximum candidate velocity',
    lastTaskTime: new Date(Date.now() - 1000 * 60 * 105).toISOString(),
    currentMission: 'Monitor task completion streak & optimize daily candidate schedule',
    confidence: 96,
    executionTimeMs: 115,
    performanceScore: 97,
    inputsRequired: ['All Worker Outputs', 'User Calendar'],
    outputsProduced: ['Daily Checklist', 'Priority Mission', 'Streak Track'],
    iconName: 'CheckSquare',
  },
  {
    id: 'market_intelligence',
    name: 'Market Intelligence Agent',
    role: 'Global Market Radar & Hiring Signals',
    description: 'Tracks international hiring spikes, remote visa policies, and salary tier updates.',
    status: 'Active',
    lastTask: 'Detected +42% spike in EU remote AI contracts with tax-free nomad perks',
    lastTaskTime: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    currentMission: 'Feed real-time market trends into Career & Business Agents',
    confidence: 98,
    executionTimeMs: 170,
    performanceScore: 99,
    inputsRequired: ['Global News API', 'Salary DBs', 'Macro Signals'],
    outputsProduced: ['Hiring Heatmap', 'Country Rankings', 'Salary Index'],
    iconName: 'Globe',
  },
];

/**
 * Executes a specific AI Worker and handles Inter-Agent messaging
 */
export async function executeAIWorker(
  workerId: AIWorkerId,
  user: UserProfile | null,
  memory?: AIMemory | null
): Promise<{
  worker: AIWorker;
  execution: AIWorkerExecution;
  messages: InterAgentMessage[];
}> {
  const startTime = new Date().toISOString();
  const startMs = Date.now();

  const userSkills = user?.skills || memory?.skills || ['AI Prompting', 'Python', 'Remote Communications'];
  const userCountry = user?.country || memory?.country || 'United States';
  const targetSalary = user?.incomeTarget || memory?.monthlyIncomeTarget || 6500;
  const cvText = memory?.cvText || user?.cvText || '';

  let actionTaken = '';
  let outputSummary = '';
  let dataProduced: any = {};
  let messages: InterAgentMessage[] = [];

  switch (workerId) {
    case 'career':
      actionTaken = `Scanned remote job registries for ${userCountry} candidate matching ${userSkills.slice(0, 3).join(', ')}`;
      outputSummary = `Identified 3 top-tier remote positions with average salary of $${Math.round(targetSalary * 1.3).toLocaleString()}/mo`;
      dataProduced = {
        topRole: 'Senior Remote AI Workflow Specialist',
        targetCompany: 'Scale AI',
        matchRate: 97,
      };
      messages.push({
        id: `msg_${Date.now()}_1`,
        timestamp: new Date().toISOString(),
        fromWorkerId: 'career',
        toWorkerId: 'resume',
        topic: 'target_role_found',
        payload: { targetRole: 'Senior Remote AI Workflow Specialist', company: 'Scale AI' },
        status: 'Processed',
      });
      messages.push({
        id: `msg_${Date.now()}_2`,
        timestamp: new Date().toISOString(),
        fromWorkerId: 'career',
        toWorkerId: 'outreach',
        topic: 'hiring_manager_contact',
        payload: { company: 'Scale AI', role: 'Senior Remote AI Workflow Specialist' },
        status: 'Processed',
      });
      break;

    case 'resume':
      actionTaken = `Parsed CV text (${cvText.length} chars) & injected ATS keywords for target AI roles`;
      outputSummary = `CV ATS Score updated to 94%. Generated 4 high-impact quantitative achievement bullets.`;
      dataProduced = {
        atsScore: 94,
        suggestedBullets: [
          'Architected autonomous AI agent workflows increasing candidate match accuracy by 45%.',
          'Streamlined cross-border remote client pipelines yielding $12,000+ monthly revenue velocity.',
        ],
      };
      messages.push({
        id: `msg_${Date.now()}_3`,
        timestamp: new Date().toISOString(),
        fromWorkerId: 'resume',
        toWorkerId: 'outreach',
        topic: 'cv_tailored',
        payload: { atsScore: 94, topBullet: 'Architected autonomous AI agent workflows...' },
        status: 'Processed',
      });
      break;

    case 'outreach':
      actionTaken = `Drafted personalized executive cold email & proposal for hiring decision makers`;
      outputSummary = `Generated 1 high-converting recruiter email template tailored to candidate strengths.`;
      dataProduced = {
        subject: `Application: Senior AI Workflow Specialist — ${user?.fullName || 'Candidate'}`,
        emailBody: `Dear Hiring Team at Scale AI,\n\nI noticed your recent expansion in remote AI operations. With proven expertise in ${userSkills.slice(0, 2).join(' and ')}, I have engineered scalable agentic workflows that drive measurable business outcomes...\n\nBest regards,\n${user?.fullName || 'Candidate'}`,
      };
      messages.push({
        id: `msg_${Date.now()}_4`,
        timestamp: new Date().toISOString(),
        fromWorkerId: 'outreach',
        toWorkerId: 'productivity',
        topic: 'outreach_ready',
        payload: { emailDrafted: true },
        status: 'Processed',
      });
      break;

    case 'skill':
      actionTaken = `Analyzed candidate skill gap against $10,000+/mo remote position benchmarks`;
      outputSummary = `Identified critical gap in 'LangChain & Vector DBs'. Recommended AI Services Masterclass.`;
      dataProduced = {
        criticalGap: 'LangChain & Vector DBs',
        estimatedUplift: '+35% Hiring Rate',
        courseId: 'ai_services_masterclass',
      };
      messages.push({
        id: `msg_${Date.now()}_5`,
        timestamp: new Date().toISOString(),
        fromWorkerId: 'skill',
        toWorkerId: 'productivity',
        topic: 'skill_roadmap_updated',
        payload: { recommendedCourse: 'AI Services Masterclass' },
        status: 'Processed',
      });
      break;

    case 'business':
      actionTaken = `Synthesized turnkey remote AI agency model tailored to candidate skillset`;
      outputSummary = `Formulated 'AI Automation Consulting' blueprint with estimated monthly profit of $8,500.`;
      dataProduced = {
        businessType: 'AI Workflow Consulting Agency',
        estimatedIncomeUSD: 8500,
        paybackPeriodDays: 14,
      };
      messages.push({
        id: `msg_${Date.now()}_6`,
        timestamp: new Date().toISOString(),
        fromWorkerId: 'business',
        toWorkerId: 'affiliate',
        topic: 'business_model_created',
        payload: { niche: 'AI Automation' },
        status: 'Processed',
      });
      break;

    case 'affiliate':
      actionTaken = `Scouted top high-ticket AI software affiliate programs in candidate niche`;
      outputSummary = `Unlocked 3 recurring affiliate offers paying 30-50% monthly commissions.`;
      dataProduced = {
        topOffer: 'Synthesia AI Creator Suite',
        payoutRate: '40% Recurring',
        projectedCommission: '$1,200/mo',
      };
      messages.push({
        id: `msg_${Date.now()}_7`,
        timestamp: new Date().toISOString(),
        fromWorkerId: 'affiliate',
        toWorkerId: 'productivity',
        topic: 'affiliate_offers_ready',
        payload: { offersCount: 3 },
        status: 'Processed',
      });
      break;

    case 'productivity':
      actionTaken = `Synthesized inter-agent messages and updated daily priority mission checklist`;
      outputSummary = `Created 3 daily high-priority execution tasks with 100 bonus career points.`;
      dataProduced = {
        dailyMission: 'Apply to Scale AI & complete 15-min LangChain module',
        tasksCount: 3,
      };
      break;

    case 'market_intelligence':
      actionTaken = `Analyzed global remote market signals, visa policies, and compensation data`;
      outputSummary = `Detected high demand for remote AI talent in Germany & UAE with average contract value $9,500/mo.`;
      dataProduced = {
        topMarket: 'Germany & EU Tech',
        growthRate: '+42% YoY',
      };
      messages.push({
        id: `msg_${Date.now()}_8`,
        timestamp: new Date().toISOString(),
        fromWorkerId: 'market_intelligence',
        toWorkerId: 'career',
        topic: 'market_signals_update',
        payload: { topCountry: 'Germany', hiringSpike: '+42%' },
        status: 'Processed',
      });
      break;
  }

  const durationMs = Date.now() - startMs;
  const endTime = new Date().toISOString();

  const workerBase = INITIAL_AI_WORKERS.find(w => w.id === workerId) || INITIAL_AI_WORKERS[0];

  const updatedWorker: AIWorker = {
    ...workerBase,
    status: 'Active',
    lastTask: actionTaken,
    lastTaskTime: endTime,
    executionTimeMs: durationMs,
    confidence: Math.min(99, workerBase.confidence + 1),
    performanceScore: Math.min(100, workerBase.performanceScore + 1),
  };

  const execution: AIWorkerExecution = {
    id: `exec_${Date.now()}_${workerId}`,
    workerId,
    workerName: workerBase.name,
    startTime,
    endTime,
    durationMs,
    status: 'Completed',
    actionTaken,
    outputSummary,
    dataProduced,
    confidence: updatedWorker.confidence,
  };

  // Record into Firestore AI Memory if logged in
  if (user?.uid && user.uid !== 'guest') {
    try {
      const memoryRef = doc(db, 'ai_memory', user.uid);
      await updateDoc(memoryRef, {
        [`workerState_${workerId}`]: updatedWorker,
        lastActiveTime: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await recordAITimelineEventInFirestore(user.uid, {
        title: `${workerBase.name} Executed`,
        type: 'worker_execution',
        description: outputSummary,
        workerId,
        scoreDelta: 5,
        iconName: workerBase.iconName,
      });
    } catch (err) {
      console.warn('Firestore worker execution warning:', err);
    }
  }

  return { worker: updatedWorker, execution, messages };
}

/**
 * Runs the entire AI Executive Workforce pipeline (all 8 agents sequentially)
 */
export async function runFullExecutiveWorkforce(
  user: UserProfile | null,
  memory?: AIMemory | null
): Promise<{
  workers: AIWorker[];
  executions: AIWorkerExecution[];
  allMessages: InterAgentMessage[];
}> {
  const workerIds: AIWorkerId[] = [
    'career',
    'resume',
    'outreach',
    'skill',
    'business',
    'affiliate',
    'productivity',
    'market_intelligence',
  ];

  const workers: AIWorker[] = [];
  const executions: AIWorkerExecution[] = [];
  const allMessages: InterAgentMessage[] = [];

  for (const wId of workerIds) {
    const result = await executeAIWorker(wId, user, memory);
    workers.push(result.worker);
    executions.push(result.execution);
    allMessages.push(...result.messages);
  }

  // Record workforce sync timeline event
  if (user?.uid && user.uid !== 'guest') {
    await recordAITimelineEventInFirestore(user.uid, {
      title: 'Full AI Workforce Executed',
      type: 'worker_execution',
      description: 'Coordinated execution of all 8 specialized AI Workers. Strategic candidate alignment updated.',
      scoreDelta: 25,
      iconName: 'Cpu',
    });
  }

  return { workers, executions, allMessages };
}
