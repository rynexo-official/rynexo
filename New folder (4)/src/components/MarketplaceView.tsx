import React, { useState } from 'react';
import {
  Store,
  Building2,
  UserCheck,
  Briefcase,
  Sparkles,
  ShoppingBag,
  DollarSign,
  Star,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Calendar,
  Send,
  ExternalLink,
  ShieldCheck,
  Tag,
  Clock,
  Zap,
  Award,
  BookOpen,
  Code,
  FileText,
  Download,
  Users
} from 'lucide-react';
import {
  UserProfile,
  Language,
  CompanyAccount,
  RecruiterAccount,
  FreelanceService,
  AffiliateProgramDetail,
  DigitalProduct,
  CandidateInterview
} from '../types';
import {
  DEFAULT_COMPANIES,
  DEFAULT_FREELANCE_SERVICES,
  DEFAULT_AFFILIATE_PROGRAMS,
  DEFAULT_DIGITAL_PRODUCTS
} from '../lib/enterpriseEcosystem';

interface MarketplaceViewProps {
  user: UserProfile | null;
  language: Language;
  onOpenPayments: (planOrProduct?: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  user,
  language,
  onOpenPayments,
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<'companies' | 'recruiters' | 'freelance' | 'affiliates' | 'products'>('companies');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // State collections
  const [companies, setCompanies] = useState<CompanyAccount[]>(DEFAULT_COMPANIES);
  const [freelanceServices, setFreelanceServices] = useState<FreelanceService[]>(DEFAULT_FREELANCE_SERVICES);
  const [affiliatePrograms] = useState<AffiliateProgramDetail[]>(DEFAULT_AFFILIATE_PROGRAMS);
  const [digitalProducts, setDigitalProducts] = useState<DigitalProduct[]>(DEFAULT_DIGITAL_PRODUCTS);
  const [interviews, setInterviews] = useState<CandidateInterview[]>([]);

  // Modals
  const [showPublishJobModal, setShowPublishJobModal] = useState(false);
  const [showCreateServiceModal, setShowCreateServiceModal] = useState(false);
  const [showScheduleInterviewModal, setShowScheduleInterviewModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  // New Job Form State
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobLocation, setNewJobLocation] = useState('Remote');
  const [newJobSalary, setNewJobSalary] = useState('8,000 - 12,000');

  // New Service Form State
  const [newServiceTitle, setNewServiceTitle] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('AI Engineering');
  const [newServicePrice, setNewServicePrice] = useState<number>(199);

  const handlePublishJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim()) return;

    setCompanies(prev => prev.map(c => c.id === 'comp_openai' ? {
      ...c,
      publishedJobsCount: c.publishedJobsCount + 1
    } : c));

    setShowPublishJobModal(false);
    setNewJobTitle('');
    alert(`Successfully published '${newJobTitle}' to RYNEXO Global Job Feed!`);
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceTitle.trim()) return;

    const service: FreelanceService = {
      id: `fl_${Date.now()}`,
      sellerId: user?.uid || 'guest',
      sellerName: user?.fullName || 'RYNEXO Freelancer',
      title: newServiceTitle,
      category: newServiceCategory,
      shortDescription: 'Custom freelance service offering verified on RYNEXO Marketplace.',
      priceUSD: newServicePrice,
      deliveryDays: 3,
      rating: 5.0,
      reviewsCount: 1,
      aiRecommendationScore: 97,
      tags: ['Verified', newServiceCategory],
      featured: true,
      createdAt: new Date().toISOString(),
    };

    setFreelanceServices(prev => [service, ...prev]);
    setShowCreateServiceModal(false);
    setNewServiceTitle('');
    alert('Your Freelance Service profile listing is live!');
  };

  const handleScheduleInterview = (candidateName: string) => {
    const newInterview: CandidateInterview = {
      id: `int_${Date.now()}`,
      candidateId: `usr_${Date.now()}`,
      candidateName,
      jobTitle: 'Senior AI Workflow Engineer',
      companyName: 'Scale AI',
      scheduledTime: new Date(Date.now() + 86400000 * 2).toLocaleString(),
      status: 'Scheduled',
      meetingUrl: 'https://meet.google.com/rynexo-interview-ai',
    };
    setInterviews(prev => [newInterview, ...prev]);
    setSelectedCandidate(null);
    setShowScheduleInterviewModal(false);
    alert(`Interview successfully scheduled with ${candidateName}!`);
  };

  return (
    <div className="space-y-6 text-white pb-12">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#08091a] via-[#0d1236] to-[#1c0e3d] p-6 sm:p-8 border border-blue-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
              <Store className="w-3.5 h-3.5 text-blue-400" />
              <span>Global Enterprise Marketplace</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>RYNEXO Global Marketplace</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              5 Integrated Business Ecosystems: Verified Corporate Hiring, AI Recruiter Portals, Freelance Services, High-Yield Affiliates & Digital Product Creators.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenPayments('Enterprise')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-xl shadow-blue-600/30 transition flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Enterprise Subscription Plans</span>
            </button>
          </div>
        </div>

        {/* Ecosystem Sub-Nav Bar */}
        <div className="mt-8 flex border-b border-white/10 space-x-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'companies'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>1. Companies (Hiring)</span>
          </button>

          <button
            onClick={() => setActiveTab('recruiters')}
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'recruiters'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>2. Recruiters Portal</span>
          </button>

          <button
            onClick={() => setActiveTab('freelance')}
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'freelance'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>3. Freelancers Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('affiliates')}
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'affiliates'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>4. Affiliate Marketplace</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>5. Digital Products</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {activeTab === 'companies' && (
            <button
              onClick={() => setShowPublishJobModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Job Posting</span>
            </button>
          )}

          {activeTab === 'freelance' && (
            <button
              onClick={() => setShowCreateServiceModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Sell a Service</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* ECOSYSTEM 1: COMPANIES (CORPORATE RECRUITMENT DASHBOARD) */}
      {/* ======================================================== */}
      {activeTab === 'companies' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {companies.map((company) => (
              <div
                key={company.id}
                className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-blue-500/40 backdrop-blur-xl transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <img
                      src={company.logoUrl}
                      alt={company.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-white/10"
                    />
                    {company.verified && (
                      <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 text-[10px] font-bold border border-blue-500/20 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-blue-400" />
                        <span>Verified Account</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-lg text-white">{company.name}</h3>
                  <p className="text-xs text-blue-300 font-medium">{company.industry}</p>
                  <p className="text-xs text-slate-400 mt-1">{company.location}</p>
                  <p className="text-xs text-slate-300 mt-3 leading-relaxed line-clamp-3">
                    {company.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-white/[0.03]">
                      <div className="text-lg font-bold text-white">{company.publishedJobsCount}</div>
                      <div className="text-[10px] text-slate-400">Published Jobs</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/[0.03]">
                      <div className="text-lg font-bold text-emerald-400">{company.activeRecruitersCount}</div>
                      <div className="text-[10px] text-slate-400">Active Recruiters</div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => alert(`Opening ${company.name} recruitment dashboard...`)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-blue-600 hover:text-white text-slate-200 font-bold text-xs transition border border-white/10"
                  >
                    Manage Dashboard
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ECOSYSTEM 2: RECRUITERS PORTAL */}
      {/* ======================================================== */}
      {activeTab === 'recruiters' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-400" />
                  <span>AI-Ranked Candidates Search & Interview Scheduler</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Access pre-vetted AI candidates matching top 10% skills benchmarks.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-bold border border-emerald-500/20">
                14,280 Verified Candidates Available
              </span>
            </div>

            {/* Candidates List */}
            <div className="space-y-3 pt-3">
              {[
                { name: 'Dr. Evelyn Vance', role: 'Senior AI Research Scientist', score: 98, country: 'Germany', skills: ['PyTorch', 'Transformers', 'LLM Alignment'] },
                { name: 'Tariq Al-Hassan', role: 'Lead Autonomous Agent Engineer', score: 96, country: 'United Arab Emirates', skills: ['LangChain', 'Python', 'FastAPI'] },
                { name: 'Chloe Montgomery', role: 'Full-Stack React & AI Systems Lead', score: 94, country: 'United States', skills: ['React', 'TypeScript', 'VectorDB'] },
              ].map((cand, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-300 font-bold text-sm">
                      {cand.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white">{cand.name}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-mono font-bold">
                          {cand.score}% AI Match
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{cand.role} &bull; {cand.country}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {cand.skills.map((sk, sIdx) => (
                          <span key={sIdx} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-300">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setSelectedCandidate(cand.name);
                        setShowScheduleInterviewModal(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Schedule Interview</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scheduled Interviews */}
          {interviews.length > 0 && (
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-3">
              <h3 className="font-bold text-base text-white">Scheduled Candidate Interviews</h3>
              <div className="space-y-2">
                {interviews.map(i => (
                  <div key={i.id} className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">{i.candidateName}</span> &bull; <span className="text-blue-300">{i.jobTitle}</span>
                    </div>
                    <div className="text-slate-400 font-mono">{i.scheduledTime}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* ECOSYSTEM 3: FREELANCERS HUB */}
      {/* ======================================================== */}
      {activeTab === 'freelance' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {freelanceServices.map((service) => (
            <div
              key={service.id}
              className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-blue-500/40 backdrop-blur-xl transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 text-[10px] font-bold">
                    {service.category}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{service.rating} ({service.reviewsCount})</span>
                  </div>
                </div>

                <h3 className="font-extrabold text-base text-white line-clamp-2">{service.title}</h3>

                <div className="flex items-center gap-2 mt-3 mb-2">
                  {service.sellerAvatar && (
                    <img src={service.sellerAvatar} alt={service.sellerName} className="w-6 h-6 rounded-full object-cover" />
                  )}
                  <span className="text-xs text-slate-300 font-medium">{service.sellerName}</span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-3">{service.shortDescription}</p>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400">Starting Price</div>
                    <div className="text-xl font-bold text-emerald-400 font-mono">${service.priceUSD}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Delivery</div>
                    <div className="text-xs font-bold text-white">{service.deliveryDays} Days</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onOpenPayments(`Service: ${service.title}`)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-lg shadow-blue-600/20"
              >
                Hire & Order Service (${service.priceUSD})
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* ECOSYSTEM 4: AFFILIATE MARKETPLACE */}
      {/* ======================================================== */}
      {activeTab === 'affiliates' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {affiliatePrograms.map((aff) => (
            <div
              key={aff.id}
              className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/40 backdrop-blur-xl transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-bold border border-emerald-500/20">
                    {aff.commissionRate}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 text-[10px] font-bold">
                    {aff.aiScore}% AI Score
                  </span>
                </div>

                <h3 className="font-extrabold text-lg text-white">{aff.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{aff.companyName} &bull; {aff.category}</p>
                <p className="text-xs text-slate-300 mt-3 line-clamp-3 leading-relaxed">{aff.description}</p>

                <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cookie Duration:</span>
                    <span className="text-white font-bold">{aff.cookieDurationDays} Days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payout Frequency:</span>
                    <span className="text-white font-bold">{aff.payoutFrequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg Monthly Earning:</span>
                    <span className="text-emerald-400 font-bold">${aff.avgMonthlyEarningsUSD.toLocaleString()}/mo</span>
                  </div>
                </div>
              </div>

              <a
                href={aff.affiliateUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition text-center flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20"
              >
                <span>Generate Affiliate Promo Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* ECOSYSTEM 5: DIGITAL PRODUCTS MARKETPLACE */}
      {/* ======================================================== */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {digitalProducts.map((prod) => (
            <div
              key={prod.id}
              className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-purple-500/40 backdrop-blur-xl transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 text-[10px] font-bold">
                    {prod.category}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{prod.rating} ({prod.salesCount} Sales)</span>
                  </div>
                </div>

                <h3 className="font-extrabold text-base text-white">{prod.title}</h3>
                <p className="text-xs text-slate-400 mt-1">By {prod.creatorName}</p>
                <p className="text-xs text-slate-300 mt-3 line-clamp-3 leading-relaxed">{prod.description}</p>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400">Format</div>
                    <div className="text-xs font-mono text-purple-300">{prod.fileFormat}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Instant Download</div>
                    <div className="text-xl font-bold text-white font-mono">${prod.priceUSD}</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onOpenPayments(`Product: ${prod.title}`)}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-lg shadow-purple-600/20 flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Buy & Instant Download (${prod.priceUSD})</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Publish Job Posting */}
      {showPublishJobModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handlePublishJob} className="w-full max-w-md rounded-3xl bg-slate-900 border border-blue-500/30 p-6 space-y-4">
            <h3 className="font-bold text-lg text-white">Publish Corporate Job Posting</h3>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">Job Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Remote AI Specialist"
                value={newJobTitle}
                onChange={(e) => setNewJobTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">Target Salary Range (USD/mo)</label>
              <input
                type="text"
                value={newJobSalary}
                onChange={(e) => setNewJobSalary(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPublishJobModal(false)}
                className="flex-1 py-2 rounded-xl bg-white/5 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Publish Job
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Create Service */}
      {showCreateServiceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateService} className="w-full max-w-md rounded-3xl bg-slate-900 border border-blue-500/30 p-6 space-y-4">
            <h3 className="font-bold text-lg text-white">List Service on Freelance Marketplace</h3>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">Service Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Custom AI Agent Deployment"
                value={newServiceTitle}
                onChange={(e) => setNewServiceTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">Price (USD)</label>
              <input
                type="number"
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateServiceModal(false)}
                className="flex-1 py-2 rounded-xl bg-white/5 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Publish Service
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Schedule Interview */}
      {showScheduleInterviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-blue-500/30 p-6 space-y-4">
            <h3 className="font-bold text-lg text-white">Schedule Candidate Interview</h3>
            <p className="text-xs text-slate-300">
              Confirm interview slot for <span className="font-bold text-blue-300">{selectedCandidate}</span>. An automated calendar invite will be issued via RYNEXO Recruiter API.
            </p>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-xs font-mono space-y-1">
              <div>Candidate: {selectedCandidate}</div>
              <div>Position: Senior AI Specialist</div>
              <div>Meeting Link: Auto-generated Google Meet</div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowScheduleInterviewModal(false)}
                className="flex-1 py-2 rounded-xl bg-white/5 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleScheduleInterview(selectedCandidate || 'Candidate')}
                className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Confirm & Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
