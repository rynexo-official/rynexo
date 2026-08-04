import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  MapPin,
  Building,
  DollarSign,
  Bookmark,
  ExternalLink,
  Briefcase,
  X,
  Globe,
  SlidersHorizontal,
  ChevronRight,
  Clock,
  Flame,
  Star,
  CheckCircle2,
  Calendar,
  Languages as LanguagesIcon,
  Award,
  ArrowRight,
  Building2,
  History,
  TrendingUp,
  Tag,
  Loader2,
} from 'lucide-react';
import { Language, UserProfile, JobRecommendation } from '../types';
import { SAMPLE_JOBS } from '../data/mockData';
import { JobDetailsModal } from './JobDetailsModal';
import {
  saveJobToFirestore,
  removeSavedJobFromFirestore,
  fetchSavedJobsFromFirestore,
  recordJobViewInFirestore,
  recordJobApplyInFirestore,
} from '../lib/firebase';
import { recordAIOSEvent } from '../lib/aiBrainOS';

interface FindJobViewProps {
  user: UserProfile | null;
  language: Language;
}

export const FindJobView: React.FC<FindJobViewProps> = ({ user, language }) => {
  const [jobs, setJobs] = useState<JobRecommendation[]>(SAMPLE_JOBS);
  const [savedJobs, setSavedJobs] = useState<JobRecommendation[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'saved' | 'trending'>('all');
  const [selectedJobForModal, setSelectedJobForModal] = useState<JobRecommendation | null>(null);

  // Search & Filter state
  const [titleSearch, setTitleSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedJobType, setSelectedJobType] = useState('All'); // Remote, On-site, Hybrid
  const [selectedEmploymentType, setSelectedEmploymentType] = useState('All'); // Full Time, Part Time, Contract, Internship
  const [selectedSalaryRange, setSelectedSalaryRange] = useState('All');

  // Recent Searches
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'AI Specialist',
    'Growth Marketer',
    'TypeScript Remote',
    'E-commerce Dubai',
  ]);

  // AI Job Match Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiForm, setAiForm] = useState({
    country: user?.country || 'United States',
    city: user?.city || 'New York',
    profession: 'Software Engineer / Digital Marketer',
    skills: user?.skills?.join(', ') || 'TypeScript, React, AI Automation, Digital Marketing',
    languages: 'English, French',
    experience: user?.experienceLevel || 'Intermediate',
    careerGoal: 'Build sustainable remote income',
    desiredSalary: '$85,000 / yr',
  });

  // Security External Link Confirmation Modal State
  const [pendingExternalUrl, setPendingExternalUrl] = useState<string | null>(null);

  // Adzuna Live Search state
  const [isAdzunaLoading, setIsAdzunaLoading] = useState(false);

  // Sync user profile changes to AI form
  useEffect(() => {
    if (user) {
      setAiForm((prev) => ({
        ...prev,
        country: user.country || prev.country,
        city: user.city || prev.city,
        skills: user.skills?.length ? user.skills.join(', ') : prev.skills,
        experience: user.experienceLevel || prev.experience,
      }));
    }
  }, [user]);

  // Load saved jobs from Firestore / LocalStorage and fetch AI job recommendations tailored to user profile
  useEffect(() => {
    const userId = user?.uid || 'guest_user';
    fetchSavedJobsFromFirestore(userId).then((fetched) => {
      if (fetched) {
        setSavedJobs(fetched);
      }
    });

    if (user) {
      // Auto-load personalized job recommendations from AI matching user profile stored in Firebase
      fetch('/api/ai/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: user.country || 'United States',
          city: user.city || 'New York',
          profession: user.profession || 'Digital Specialist',
          skills: user.skills?.length ? user.skills.join(', ') : 'TypeScript, React, AI Automation, Digital Marketing',
          languages: Array.isArray(user.languages) ? user.languages.join(', ') : 'English',
          experience: user.experienceLevel || 'Intermediate',
          careerGoal: user.careerGoal || 'Build sustainable remote income',
          desiredSalary: `$${user.monthlyGoalUSD ? user.monthlyGoalUSD * 12 : 85000} / yr`,
          language,
          userProfile: user,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.jobs) && data.jobs.length > 0) {
            setJobs(data.jobs);
          }
        })
        .catch((err) => console.warn('AI Jobs load error:', err));
    }
  }, [user, language]);

  const handleLiveAdzunaSearch = async () => {
    setIsAdzunaLoading(true);
    let minSalaryVal = 0;
    if (selectedSalaryRange.includes('$30,000')) minSalaryVal = 30000;
    if (selectedSalaryRange.includes('$60,000')) minSalaryVal = 60000;
    if (selectedSalaryRange.includes('$90,000')) minSalaryVal = 90000;
    if (selectedSalaryRange.includes('$130,000')) minSalaryVal = 130000;

    try {
      const response = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: titleSearch || user?.skills?.join(' ') || 'AI Software Operations',
          country: selectedCountry,
          city: selectedCity,
          salaryMin: minSalaryVal,
          employmentType: selectedEmploymentType,
          isRemote: selectedJobType === 'Remote',
          page: 1,
        }),
      });

      const data = await response.json();
      if (data.success && Array.isArray(data.jobs) && data.jobs.length > 0) {
        setJobs(data.jobs);
      }
    } catch (err) {
      console.error('Error fetching live Adzuna jobs:', err);
    } finally {
      setIsAdzunaLoading(false);
    }
  };

  const countriesList = [
    'All',
    'United States',
    'United Kingdom',
    'Canada',
    'Germany',
    'France',
    'Australia',
    'India',
    'Brazil',
    'South Africa',
    'Spain',
    'Italy',
    'Mexico',
    'Singapore',
    'Netherlands',
    'New Zealand',
    'Poland',
    'Austria',
    'Switzerland',
    'Belgium',
  ];

  const citiesList = [
    'All',
    'New York',
    'London',
    'Toronto',
    'Dubai',
    'Berlin',
    'Worldwide Remote',
  ];

  const jobTypes = ['All', 'Remote', 'On-site', 'Hybrid'];
  const employmentTypes = ['All', 'Full Time', 'Part Time', 'Contract', 'Internship'];
  const salaryRanges = [
    'All',
    '$30,000 - $60,000 / yr',
    '$60,000 - $90,000 / yr',
    '$90,000 - $130,000 / yr',
    '$130,000+ / yr',
  ];

  const featuredCompanies = [
    { name: 'Aetheria Labs', logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80', jobsCount: 12, category: 'AI & Data' },
    { name: 'Apex Digital Global', logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=120&auto=format&fit=crop&q=80', jobsCount: 8, category: 'Growth Marketing' },
    { name: 'Nexus Software', logo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120&auto=format&fit=crop&q=80', jobsCount: 15, category: 'Engineering' },
    { name: 'Vanguard Brand Co.', logo: 'https://images.unsplash.com/photo-1556742049-0a670f4a4587?w=120&auto=format&fit=crop&q=80', jobsCount: 6, category: 'E-commerce' },
  ];

  const toggleSaveJob = async (job: JobRecommendation, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const userId = user?.uid || 'guest_user';
    const isSaved = savedJobs.some((j) => j.id === job.id);

    if (isSaved) {
      setSavedJobs((prev) => prev.filter((j) => j.id !== job.id));
      await removeSavedJobFromFirestore(job.id, userId);
    } else {
      setSavedJobs((prev) => [job, ...prev]);
      await saveJobToFirestore(job, userId);
      if (user?.uid) {
        recordAIOSEvent(user.uid, 'job_saved', job, user);
      }
    }
  };

  const handleOpenExternal = (url: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPendingExternalUrl(url);
  };

  const handleExecuteAiMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiLoading(true);

    try {
      const response = await fetch('/api/ai/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...aiForm,
          language,
        }),
      });

      const data = await response.json();
      if (data.success && Array.isArray(data.jobs) && data.jobs.length > 0) {
        setJobs(data.jobs);
        setIsAiModalOpen(false);
      }
    } catch (err) {
      console.error('Error generating AI job recommendations:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const addRecentSearch = (term: string) => {
    setTitleSearch(term);
    if (term && !recentSearches.includes(term)) {
      setRecentSearches((prev) => [term, ...prev.slice(0, 3)]);
    }
  };

  // Filtering logic
  const sourceList = activeTab === 'saved' ? savedJobs : jobs;

  const filteredJobs = sourceList.filter((job) => {
    if (activeTab === 'trending' && !job.isTrending) return false;

    const matchesTitle =
      !titleSearch.trim() ||
      job.title.toLowerCase().includes(titleSearch.toLowerCase()) ||
      job.company.toLowerCase().includes(titleSearch.toLowerCase()) ||
      job.requiredSkills.some((s) => s.toLowerCase().includes(titleSearch.toLowerCase()));

    const matchesCountry =
      selectedCountry === 'All' ||
      (job.country && job.country.toLowerCase().includes(selectedCountry.toLowerCase())) ||
      (selectedCountry === 'Global Remote' && job.isRemote);

    const matchesCity =
      selectedCity === 'All' ||
      job.location.toLowerCase().includes(selectedCity.toLowerCase()) ||
      (job.city && job.city.toLowerCase().includes(selectedCity.toLowerCase())) ||
      (selectedCity === 'Worldwide Remote' && job.isRemote);

    const matchesJobType =
      selectedJobType === 'All' ||
      (selectedJobType === 'Remote' && job.isRemote) ||
      (selectedJobType === 'On-site' && !job.isRemote && !job.location.toLowerCase().includes('hybrid')) ||
      (selectedJobType === 'Hybrid' && job.location.toLowerCase().includes('hybrid'));

    const matchesEmploymentType =
      selectedEmploymentType === 'All' ||
      job.type.toLowerCase().replace('-', ' ') === selectedEmploymentType.toLowerCase();

    return (
      matchesTitle &&
      matchesCountry &&
      matchesCity &&
      matchesJobType &&
      matchesEmploymentType
    );
  });

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* 1. Header Hero Banner */}
      <div className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-slate-950/80 border border-white/10 p-8 sm:p-12 text-center flex flex-col items-center justify-center backdrop-blur-2xl shadow-2xl">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 rounded-full blur-[110px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-blue-300 text-[11px] font-semibold tracking-widest uppercase mb-4 shadow-sm">
            <Briefcase className="w-3.5 h-3.5 text-blue-400" />
            <span>RYNEXO Smart Placement Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
            Find Your Next Opportunity
          </h1>

          <p className="text-slate-300/90 text-sm sm:text-base font-normal max-w-2xl mt-3 leading-relaxed tracking-wide">
            Discover verified remote & regional positions matched precisely to your profile, skills, and financial targets.
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Powered by AI</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium backdrop-blur-md">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Updated Every 24 Hours</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium backdrop-blur-md">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Verified Opportunities</span>
            </span>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="relative group overflow-hidden px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-sm tracking-wide shadow-2xl hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300 flex items-center gap-3 border border-white/20"
            >
              <Sparkles className="w-4 h-4 text-blue-200 group-hover:rotate-12 transition-transform" />
              <span>Find Jobs with AI</span>
              <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs (All Jobs / Saved Jobs / Trending Jobs) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 px-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-white text-black shadow-lg'
                : 'bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>All Opportunities ({jobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'saved'
                ? 'bg-white text-black shadow-lg'
                : 'bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Positions ({savedJobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('trending')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'trending'
                ? 'bg-white text-black shadow-lg'
                : 'bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Trending Roles</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
          Showing {filteredJobs.length} matches
        </span>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-2xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm tracking-wide">
            <SlidersHorizontal className="w-4 h-4 text-blue-400" />
            <span>Search & Filter Positions</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLiveAdzunaSearch}
              disabled={isAdzunaLoading}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border border-white/20 text-white text-xs font-bold tracking-wide transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              {isAdzunaLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Searching Adzuna Live...</span>
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5 text-blue-200" />
                  <span>Search Live Adzuna API</span>
                </>
              )}
            </button>
            {(titleSearch || selectedCountry !== 'All' || selectedCity !== 'All' || selectedJobType !== 'All' || selectedEmploymentType !== 'All') && (
              <button
                onClick={() => {
                  setTitleSearch('');
                  setSelectedCountry('All');
                  setSelectedCity('All');
                  setSelectedJobType('All');
                  setSelectedEmploymentType('All');
                  setSelectedSalaryRange('All');
                }}
                className="text-xs text-slate-400 hover:text-white underline font-medium"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Search Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search Keywords */}
          <div className="space-y-1 sm:col-span-2 lg:col-span-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 block">
              Search Keywords
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Job title, company, or skills..."
                value={titleSearch}
                onChange={(e) => setTitleSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-white/30 transition-all"
              />
              {titleSearch && (
                <button
                  onClick={() => setTitleSearch('')}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Country */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 block">
              Country
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-4 py-3 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-white/30 cursor-pointer"
            >
              {countriesList.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 block">
              City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-4 py-3 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-white/30 cursor-pointer"
            >
              {citiesList.map((city) => (
                <option key={city} value={city} className="bg-slate-900 text-white">
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Job Type (Remote/On-site/Hybrid) */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 block">
              Workplace Type
            </label>
            <select
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
              className="w-full px-4 py-3 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-white/30 cursor-pointer"
            >
              {jobTypes.map((type) => (
                <option key={type} value={type} className="bg-slate-900 text-white">
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Employment Type */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 block">
              Employment Type
            </label>
            <select
              value={selectedEmploymentType}
              onChange={(e) => setSelectedEmploymentType(e.target.value)}
              className="w-full px-4 py-3 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-white/30 cursor-pointer"
            >
              {employmentTypes.map((emp) => (
                <option key={emp} value={emp} className="bg-slate-900 text-white">
                  {emp}
                </option>
              ))}
            </select>
          </div>

          {/* Salary Range */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 block">
              Salary Range
            </label>
            <select
              value={selectedSalaryRange}
              onChange={(e) => setSelectedSalaryRange(e.target.value)}
              className="w-full px-4 py-3 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-white/30 cursor-pointer"
            >
              {salaryRanges.map((sal) => (
                <option key={sal} value={sal} className="bg-slate-900 text-white">
                  {sal}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Recent Searches Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
          <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-blue-400" />
            Recent Searches:
          </span>
          {recentSearches.map((term, i) => (
            <button
              key={i}
              onClick={() => addRecentSearch(term)}
              className="px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-[11px] transition-all"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Featured Companies Strip */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 px-2 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-400" />
          <span>Featured Hiring Partners</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {featuredCompanies.map((comp, idx) => (
            <div
              key={idx}
              onClick={() => addRecentSearch(comp.name)}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition cursor-pointer flex items-center gap-3"
            >
              <img
                src={comp.logo}
                alt={comp.name}
                className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{comp.name}</h4>
                <p className="text-[10px] text-slate-400 truncate">{comp.jobsCount} open roles</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Main Jobs Listing Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight px-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-400" />
            <span>
              {activeTab === 'saved'
                ? 'Your Saved Positions'
                : activeTab === 'trending'
                ? 'Trending Positions'
                : 'Recommended Positions'}
            </span>
          </div>
        </h2>

        {/* NO RESULTS STATE */}
        {filteredJobs.length === 0 ? (
          <div className="p-12 text-center rounded-[32px] bg-white/[0.03] border border-white/10 backdrop-blur-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white tracking-tight">
              No Matching Jobs Found
            </h3>

            <div className="space-y-1 max-w-md mx-auto">
              <p className="text-sm font-medium text-slate-300">
                We couldn't find suitable jobs based on your current filters.
              </p>
              <p className="text-xs text-slate-400">
                Try changing your search or let the AI recommend better opportunities.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsAiModalOpen(true)}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs tracking-wide shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2 border border-white/20"
              >
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>Find Better Jobs with AI</span>
              </button>
            </div>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const isSaved = savedJobs.some((j) => j.id === job.id);

            return (
              <div
                key={job.id}
                onClick={() => setSelectedJobForModal(job)}
                className="group relative cursor-pointer p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] bg-white/[0.03] border border-white/10 hover:border-white/25 hover:bg-white/[0.06] backdrop-blur-2xl transition-all duration-300 shadow-xl overflow-hidden"
              >
                {/* Ambient Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-4">
                  <div className="flex items-start gap-4">
                    {/* Logo */}
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/15 bg-white/5 p-1 shrink-0 shadow-md group-hover:scale-105 transition-transform">
                      {job.companyLogo ? (
                        <img
                          src={job.companyLogo}
                          alt={job.company}
                          className="w-full h-full rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-xl bg-white/10 flex items-center justify-center text-white font-bold text-lg">
                          {job.company.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div>
                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        {job.provider && (
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-sm">
                            <Globe className="w-3 h-3 text-blue-400" />
                            {job.provider}
                          </span>
                        )}
                        {job.isUpdatedToday && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Updated Today
                          </span>
                        )}
                        {job.isTrending && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                            <Flame className="w-3 h-3 fill-amber-300" />
                            Trending Role
                          </span>
                        )}
                        {job.isFeaturedCompany && (
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                            <Star className="w-3 h-3 fill-purple-300" />
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight group-hover:text-blue-300 transition-colors">
                        {job.title}
                      </h3>

                      {/* Company Name */}
                      <p className="text-xs font-bold text-blue-400 mt-0.5 tracking-wide">
                        {job.company}
                      </p>

                      {/* Meta Pills */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300/90 mt-2">
                        {/* AI Match Badge */}
                        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/40 text-purple-300 text-xs font-black flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                          <span>{job.matchPercentage || 94}% AI Match</span>
                        </span>

                        {job.experienceRequired && (
                          <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-slate-200 text-[11px] font-semibold">
                            Exp: {job.experienceRequired}
                          </span>
                        )}

                        {job.country && (
                          <span className="flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5 text-slate-400" />
                            {job.country}
                          </span>
                        )}

                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.location}
                        </span>

                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <DollarSign className="w-3.5 h-3.5" />
                          {job.salaryRange}
                        </span>

                        <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-slate-200 text-[11px] font-semibold">
                          {job.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Recommendation Reason Banner */}
                {job.whyFits && (
                  <div className="relative z-10 my-3 p-3 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-purple-300">Why AI Recommends This: </span>
                      <span>{job.whyFits}</span>
                    </div>
                  </div>
                )}

                {/* Short Description */}
                <p className="relative z-10 text-xs sm:text-sm text-slate-300/90 leading-relaxed my-3 line-clamp-2">
                  {job.description}
                </p>

                {/* Required Skills */}
                <div className="relative z-10 flex flex-wrap items-center gap-1.5 my-4">
                  {job.requiredSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[11px] font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Footer Buttons */}
                <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4 mt-2">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Posted: {job.postedDate}
                  </span>

                  <div className="flex items-center gap-2.5">
                    {/* Save Button */}
                    <button
                      onClick={(e) => toggleSaveJob(job, e)}
                      className={`px-4 py-2 rounded-full border text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isSaved
                          ? 'bg-white text-black border-white'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                      <span>{isSaved ? 'Saved' : 'Save'}</span>
                    </button>

                    {/* View Job Details Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedJobForModal(job);
                      }}
                      className="px-5 py-2 rounded-full bg-white text-black hover:bg-slate-200 text-xs font-bold tracking-wide transition flex items-center gap-1.5 shadow-md group/btn"
                    >
                      <span>View Job Details</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-700 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 6. AI Job Recommendation Dialog Form */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl bg-[#0c0d14] border border-white/15 rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-2xl overflow-y-auto max-h-[90vh] text-left backdrop-blur-2xl">
            <button
              onClick={() => setIsAiModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Find Jobs with AI
              </h2>
              <p className="text-xs text-slate-300/90 mt-1 max-w-md mx-auto">
                AI analyzes your candidate profile to curate high-paying, realistic opportunities.
              </p>
            </div>

            <form onSubmit={handleExecuteAiMatch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 px-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={aiForm.country}
                    onChange={(e) => setAiForm({ ...aiForm, country: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 px-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={aiForm.city}
                    onChange={(e) => setAiForm({ ...aiForm, city: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 px-1">
                  Current Profession / Role Title
                </label>
                <input
                  type="text"
                  value={aiForm.profession}
                  onChange={(e) => setAiForm({ ...aiForm, profession: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 px-1">
                  Skills (Comma separated)
                </label>
                <input
                  type="text"
                  value={aiForm.skills}
                  onChange={(e) => setAiForm({ ...aiForm, skills: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 px-1">
                    Languages Spoken
                  </label>
                  <input
                    type="text"
                    value={aiForm.languages}
                    onChange={(e) => setAiForm({ ...aiForm, languages: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 px-1">
                    Experience Level
                  </label>
                  <select
                    value={aiForm.experience}
                    onChange={(e) => setAiForm({ ...aiForm, experience: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30 cursor-pointer"
                  >
                    <option value="beginner" className="bg-slate-900 text-white">Beginner</option>
                    <option value="intermediate" className="bg-slate-900 text-white">Intermediate</option>
                    <option value="advanced" className="bg-slate-900 text-white">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 px-1">
                  Career Goal
                </label>
                <input
                  type="text"
                  value={aiForm.careerGoal}
                  onChange={(e) => setAiForm({ ...aiForm, careerGoal: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 px-1">
                  Desired Salary Range
                </label>
                <input
                  type="text"
                  value={aiForm.desiredSalary}
                  onChange={(e) => setAiForm({ ...aiForm, desiredSalary: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="w-full py-3.5 px-6 rounded-full bg-white text-black font-bold text-xs tracking-wide shadow-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>
                    {aiLoading ? 'Analyzing Candidate Profile...' : 'Generate AI Job Recommendations'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Detailed Job Modal */}
      {selectedJobForModal && (
        <JobDetailsModal
          job={selectedJobForModal}
          user={user}
          isSaved={savedJobs.some((j) => j.id === selectedJobForModal.id)}
          onToggleSave={toggleSaveJob}
          onApplyOfficial={(url) => {
            if (user?.uid) {
              recordJobApplyInFirestore(selectedJobForModal.title, user.uid);
            }
            setSelectedJobForModal(null);
            setPendingExternalUrl(url);
          }}
          onClose={() => setSelectedJobForModal(null)}
        />
      )}

      {/* 8. SECURITY: External Website Redirection Modal */}
      {pendingExternalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0c0d14] border border-white/15 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 shadow-2xl overflow-hidden text-center backdrop-blur-2xl">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-48 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 rounded-full blur-[80px] pointer-events-none" />

            <button
              onClick={() => setPendingExternalUrl(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center mb-5 text-blue-400 shadow-md">
                <ExternalLink className="w-6 h-6" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white tracking-tight mb-3">
                Leaving RYNEXO
              </h2>

              {/* Text */}
              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed font-normal mb-2 max-w-xs">
                You are about to apply on one of our trusted partner platforms.
              </p>

              <p className="text-xs font-semibold text-blue-400 mb-8">
                Continue?
              </p>

              {/* Action Buttons: Continue & Cancel */}
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => setPendingExternalUrl(null)}
                  className="flex-1 py-3.5 px-5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 font-bold text-xs tracking-wide transition-all"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    if (pendingExternalUrl) {
                      if (user?.uid && selectedJobForModal) {
                        recordJobApplyInFirestore(selectedJobForModal.title, user.uid);
                      }
                      window.open(pendingExternalUrl, '_blank', 'noopener,noreferrer');
                    }
                    setPendingExternalUrl(null);
                  }}
                  className="flex-1 py-3.5 px-5 rounded-full bg-white text-black hover:bg-slate-200 font-bold text-xs tracking-wide shadow-xl transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Continue</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
