import {
  UserProfile,
  CompanyAccount,
  RecruiterAccount,
  CandidateInterview,
  FreelanceService,
  AffiliateProgramDetail,
  DigitalProduct,
  PaymentGatewayType,
  PaymentTransaction,
  SubscriptionPlan,
  SubscriptionTierType,
  AdminAnalytics
} from '../types';
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, addDoc } from 'firebase/firestore';

// -------------------------------------------------------------
// SEED & DEFAULT DATA FOR ENTERPRISE MARKETPLACE
// -------------------------------------------------------------

export const DEFAULT_COMPANIES: CompanyAccount[] = [
  {
    id: 'comp_openai',
    name: 'OpenAI Enterprise Labs',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    verified: true,
    industry: 'Artificial Intelligence & Large Scale ML',
    companySize: '1,000 - 5,000 employees',
    website: 'https://openai.com',
    location: 'San Francisco, CA (Remote Friendly)',
    description: 'Pioneering artificial general intelligence research and building transformative AI agent platforms.',
    publishedJobsCount: 14,
    activeRecruitersCount: 6,
    savedCandidateIds: ['usr_1', 'usr_2'],
    invitedCandidateIds: ['usr_1'],
    joinedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'comp_scaleai',
    name: 'Scale AI Global',
    logoUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&auto=format&fit=crop&q=80',
    verified: true,
    industry: 'AI Data Infrastructure & Synthetic Datasets',
    companySize: '500 - 1,000 employees',
    website: 'https://scale.com',
    location: 'San Francisco, CA & Global Remote',
    description: 'Providing data infrastructure for AI applications and autonomous machine learning workflows.',
    publishedJobsCount: 22,
    activeRecruitersCount: 9,
    savedCandidateIds: ['usr_3'],
    invitedCandidateIds: [],
    joinedAt: '2025-02-01T00:00:00Z',
  },
  {
    id: 'comp_stripe',
    name: 'Stripe Global Financial Technologies',
    logoUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=120&auto=format&fit=crop&q=80',
    verified: true,
    industry: 'FinTech & Payment Systems',
    companySize: '5,000+ employees',
    website: 'https://stripe.com',
    location: 'Dublin & San Francisco (Remote)',
    description: 'Financial infrastructure for the internet. Millions of companies use Stripe to accept payments and manage revenue.',
    publishedJobsCount: 35,
    activeRecruitersCount: 12,
    savedCandidateIds: [],
    invitedCandidateIds: [],
    joinedAt: '2024-11-10T00:00:00Z',
  },
];

export const DEFAULT_FREELANCE_SERVICES: FreelanceService[] = [
  {
    id: 'fl_service_1',
    sellerId: 'usr_freelance_1',
    sellerName: 'Elena Rostova',
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    title: 'Custom LangChain & AutoGPT Agentic System Architecture',
    category: 'AI Engineering',
    shortDescription: 'I will design and deploy production autonomous AI agent workflows with vector memory DB integration.',
    priceUSD: 450,
    deliveryDays: 3,
    rating: 4.98,
    reviewsCount: 84,
    aiRecommendationScore: 98,
    tags: ['LangChain', 'Python', 'VectorDB', 'Autonomous Agents'],
    featured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'fl_service_2',
    sellerId: 'usr_freelance_2',
    sellerName: 'Marcus Vance',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    title: 'Executive ATS Resume Rewrite & LinkedIn Profile Optimization',
    category: 'Career Branding',
    shortDescription: 'High-converting CV rewriting guaranteed to pass 95%+ ATS scanner filters for top Silicon Valley tech roles.',
    priceUSD: 125,
    deliveryDays: 2,
    rating: 4.95,
    reviewsCount: 142,
    aiRecommendationScore: 96,
    tags: ['ATS Resume', 'LinkedIn', 'Career Coaching'],
    featured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'fl_service_3',
    sellerId: 'usr_freelance_3',
    sellerName: 'Aisha Al-Mansoor',
    sellerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    title: 'Turnkey SaaS Web Application Blueprint & Full-Stack Deployment',
    category: 'Full-Stack Development',
    shortDescription: 'I will build a modern React + TypeScript + Firebase enterprise full-stack portal ready for user signup.',
    priceUSD: 890,
    deliveryDays: 5,
    rating: 5.0,
    reviewsCount: 61,
    aiRecommendationScore: 99,
    tags: ['React', 'TypeScript', 'Firebase', 'SaaS'],
    featured: false,
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_AFFILIATE_PROGRAMS: AffiliateProgramDetail[] = [
  {
    id: 'aff_synthesia',
    title: 'Synthesia AI Video Generator',
    companyName: 'Synthesia Ltd',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    category: 'AI Video & Avatars',
    commissionRate: '40% Lifetime Recurring',
    cookieDurationDays: 90,
    payoutFrequency: 'Monthly',
    difficulty: 'Easy',
    aiScore: 97,
    avgMonthlyEarningsUSD: 1450,
    affiliateUrl: 'https://synthesia.io',
    description: 'Top-converting AI avatar video platform for corporate training, marketing, and YouTube channels.',
    tags: ['AI Video', 'High Commission', 'Recurring'],
  },
  {
    id: 'aff_semrush',
    title: 'Semrush SEO & Market Radar',
    companyName: 'Semrush Inc',
    logoUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=120&auto=format&fit=crop&q=80',
    category: 'Marketing & SEO',
    commissionRate: '$200 Per Sale + $10 Per Trial',
    cookieDurationDays: 120,
    payoutFrequency: 'Bi-Weekly',
    difficulty: 'Medium',
    aiScore: 95,
    avgMonthlyEarningsUSD: 2800,
    affiliateUrl: 'https://semrush.com',
    description: 'Industry-standard competitive research tool suite used by top agency founders and growth hackers.',
    tags: ['SEO', 'High Payout', 'Trial Bonus'],
  },
  {
    id: 'aff_midjourney_tools',
    title: 'Midjourney Prompt Master Vault',
    companyName: 'PromptEngine Labs',
    category: 'Design & Generative AI',
    commissionRate: '50% Instant Payout',
    cookieDurationDays: 60,
    payoutFrequency: 'Weekly',
    difficulty: 'Easy',
    aiScore: 92,
    avgMonthlyEarningsUSD: 980,
    affiliateUrl: 'https://midjourney.com',
    description: 'Commercial license generative image prompt packages and automated style preset toolkits.',
    tags: ['Prompts', 'Digital Asset', 'Instant'],
  },
];

export const DEFAULT_DIGITAL_PRODUCTS: DigitalProduct[] = [
  {
    id: 'prod_ai_agency_kit',
    title: 'Turnkey AI Automation Agency OS (Notion + Scripts)',
    creatorId: 'creator_1',
    creatorName: 'David Chen',
    category: 'Software',
    priceUSD: 79,
    rating: 4.97,
    salesCount: 384,
    description: 'Complete operating system for launching a $10,000/mo AI workflow consulting agency. Includes client intake forms, proposal templates, and automation code.',
    fileFormat: '.ZIP (Notion Template + Python Scripts)',
    tags: ['Agency OS', 'Automation', 'Notion'],
    featured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod_executive_cv_template',
    title: 'Silicon Valley Executive ATS Resume Template Pack',
    creatorId: 'creator_2',
    creatorName: 'Sarah Jenkins',
    category: 'CV Template',
    priceUSD: 29,
    rating: 4.92,
    salesCount: 1240,
    description: 'Clean Microsoft Word & Figma resume templates optimized for high-salary tech applications with 98% ATS parse rate.',
    fileFormat: '.DOCX / .FIG',
    tags: ['Resume', 'ATS Friendly', 'Executive'],
    featured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod_gemini_master_prompts',
    title: 'Gemini 1.5 Pro 500+ Enterprise Engineering Prompts',
    creatorId: 'creator_3',
    creatorName: 'Alex Rivera',
    category: 'AI Prompt',
    priceUSD: 19,
    rating: 4.99,
    salesCount: 2150,
    description: 'Battle-tested system instructions and prompts for complex code generation, data analysis, and workflow automation.',
    fileFormat: '.JSON / .PDF',
    tags: ['Prompts', 'Gemini', 'Code Gen'],
    featured: false,
    createdAt: new Date().toISOString(),
  },
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'Standard',
    name: 'Standard Candidate',
    priceMonthlyUSD: 9,
    priceYearlyUSD: 90,
    tagline: 'Essential AI matching, job scouting, & standard tools.',
    features: [
      '3-Day Free Trial included ($0.00 charged today)',
      'Access to RYNEXO Global Job Scouting Feed',
      'Standard AI Career Score Calculation',
      '15 AI Agent Executions per day',
      'Standard Affiliate Marketplace access',
      'Community Network membership',
    ],
    limits: {
      jobApplicationsPerMonth: 25,
      aiWorkerExecutionsPerDay: 15,
      recruiterSeats: 0,
      customAffiliateOffers: 1,
      apiAccess: false,
      dedicatedAccountManager: false,
    },
  },
  {
    id: 'Pro',
    name: 'AI Career Pro',
    priceMonthlyUSD: 29,
    priceYearlyUSD: 290,
    tagline: '3 Days Free, then $29/mo. Cancel anytime before trial ends.',
    features: [
      '3-Day Full Access Free Trial ($0.00 charged today)',
      'Unlimited AI Worker Autopilot Executions',
      'ATS Resume Optimization & Automated Bullet Rewriting',
      'Personalized Recruiter Email Generation',
      'AI Executive Command Center & Strategic Advisory',
      'Full Digital Products Marketplace discounts (20% off)',
      'High-Yield Affiliate Monetization Engine',
      'Priority Job Matching Algorithms',
    ],
    limits: {
      jobApplicationsPerMonth: 100,
      aiWorkerExecutionsPerDay: 'Unlimited',
      recruiterSeats: 1,
      customAffiliateOffers: 10,
      apiAccess: true,
      dedicatedAccountManager: false,
    },
    popular: true,
  },
  {
    id: 'Business',
    name: 'Recruiter & Agency',
    priceMonthlyUSD: 149,
    priceYearlyUSD: 1490,
    tagline: 'Manage corporate hiring & candidate search at scale.',
    features: [
      '3-Day Free Trial included with PayPal authorization',
      'Verified Company Account badge',
      'Publish unlimited Remote & On-Site Job Postings',
      'AI-Ranked Candidate Search Database',
      'Instant Interview Scheduler & Candidate Outreach',
      '5 Recruiter Team Seats included',
      'Advanced Hiring Velocity Analytics',
    ],
    limits: {
      jobApplicationsPerMonth: 'Unlimited',
      aiWorkerExecutionsPerDay: 'Unlimited',
      recruiterSeats: 5,
      customAffiliateOffers: 'Unlimited',
      apiAccess: true,
      dedicatedAccountManager: false,
    },
  },
  {
    id: 'Enterprise',
    name: 'Enterprise Workforce',
    priceMonthlyUSD: 499,
    priceYearlyUSD: 4990,
    tagline: 'Custom enterprise integration, API access, & dedicated support.',
    features: [
      '3-Day Free Trial included with PayPal authorization',
      'Unlimited Company & Recruiter Accounts',
      'Custom AI Autonomous Agents & Custom Workflows',
      'Dedicated Account Manager & 24/7 SLA Support',
      'Full Admin Analytics & Telemetry Export',
      'White-label Marketplace solutions',
    ],
    limits: {
      jobApplicationsPerMonth: 'Unlimited',
      aiWorkerExecutionsPerDay: 'Unlimited',
      recruiterSeats: 50,
      customAffiliateOffers: 'Unlimited',
      apiAccess: true,
      dedicatedAccountManager: true,
    },
  },
];

export const INITIAL_ADMIN_ANALYTICS: AdminAnalytics = {
  mrrUSD: 84250,
  arrUSD: 1011000,
  totalRevenueUSD: 342000,
  conversionRate: 4.8,
  retentionRate: 92.4,
  activeUsersCount: 14280,
  registeredUsersCount: 48500,
  companiesCount: 320,
  recruitersCount: 890,
  digitalProductsCount: 145,
  freelanceServicesCount: 260,
  topCountries: [
    { country: 'United States', userCount: 18400, revenueUSD: 142000 },
    { country: 'Germany', userCount: 6200, revenueUSD: 58000 },
    { country: 'United Kingdom', userCount: 5100, revenueUSD: 44000 },
    { country: 'United Arab Emirates', userCount: 3900, revenueUSD: 38000 },
    { country: 'Canada', userCount: 3400, revenueUSD: 29000 },
  ],
  topCompanies: [
    { name: 'Scale AI', jobsPosted: 22, hiresCount: 14 },
    { name: 'OpenAI Enterprise Labs', jobsPosted: 14, hiresCount: 11 },
    { name: 'Stripe Global', jobsPosted: 35, hiresCount: 18 },
  ],
  topAffiliatePrograms: [
    { name: 'Synthesia AI Video Generator', clicks: 12400, earningsUSD: 42500 },
    { name: 'Semrush SEO Suite', clicks: 8900, earningsUSD: 38200 },
    { name: 'Midjourney Prompt Master', clicks: 15100, earningsUSD: 24800 },
  ],
  apiHealth: [
    { service: 'Firebase Firestore DB', status: 'Operational', latencyMs: 24 },
    { service: 'Gemini AI Executive Engine', status: 'Operational', latencyMs: 140 },
    { service: 'Stripe Payment Gateway API', status: 'Operational', latencyMs: 45 },
    { service: 'Global Job Ingestion Crawler', status: 'Operational', latencyMs: 88 },
  ],
};

// -------------------------------------------------------------
// HELPER FUNCTIONS & FIRESTORE SYNCRONIZATION
// -------------------------------------------------------------

export async function processPaymentCheckout(
  userId: string,
  userEmail: string,
  gateway: PaymentGatewayType,
  amountUSD: number,
  planId?: SubscriptionTierType,
  productId?: string
): Promise<PaymentTransaction> {
  const transaction: PaymentTransaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    userEmail,
    gateway,
    amountUSD,
    currency: 'USD',
    status: 'Succeeded',
    planId,
    productId,
    createdAt: new Date().toISOString(),
  };

  if (userId && userId !== 'guest') {
    try {
      // Save payment transaction in Firestore
      const txRef = doc(db, 'payment_transactions', transaction.id);
      await setDoc(txRef, transaction);

      // If subscription plan upgrade, update user profile
      if (planId) {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          subscriptionTier: planId,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Firestore payment save warning:', err);
    }
  }

  return transaction;
}
