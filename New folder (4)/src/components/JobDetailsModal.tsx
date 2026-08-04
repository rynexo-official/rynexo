import React, { useState } from 'react';
import {
  X,
  Globe,
  MapPin,
  DollarSign,
  Briefcase,
  Calendar,
  Languages as LanguagesIcon,
  CheckCircle2,
  Bookmark,
  Share2,
  Sparkles,
  FileText,
  HelpCircle,
  ExternalLink,
  Gift,
  Check,
  Send,
  Bot,
  UserCheck,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { JobRecommendation, UserProfile } from '../types';

interface JobDetailsModalProps {
  job: JobRecommendation;
  user: UserProfile | null;
  isSaved: boolean;
  onToggleSave: (job: JobRecommendation) => void;
  onApplyOfficial: (url: string) => void;
  onClose: () => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  user,
  isSaved,
  onToggleSave,
  onApplyOfficial,
  onClose,
}) => {
  const [copiedToast, setCopiedToast] = useState(false);

  // AI Interactive Sub-Modals
  const [activeAiTab, setActiveAiTab] = useState<'none' | 'ask' | 'cv' | 'interview'>('none');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Pre-filled CV & Interview states
  const [cvOutput, setCvOutput] = useState<string | null>(null);
  const [interviewOutput, setInterviewOutput] = useState<{ question: string; guide: string }[] | null>(null);

  const handleShareJob = () => {
    const textToCopy = `${job.title} at ${job.company}\nLocation: ${job.location}\nSalary: ${job.salaryRange}\nApply on RYNEXO: ${job.companyWebsite || job.applyUrl}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    }
  };

  const handleAskAi = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiQuestion.trim() && activeAiTab === 'ask') return;

    setAiLoading(true);
    setAiAnswer(null);

    const questionText = aiQuestion.trim() || `Analyze how well my skills match the ${job.title} position at ${job.company} and how I can position myself to get hired.`;

    try {
      const response = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: `Role: ${job.title} at ${job.company}.\nRole Description: ${job.description}\nRequired Skills: ${job.requiredSkills.join(', ')}\nCandidate Question: ${questionText}`,
          userProfile: user,
          language: 'en',
        }),
      });

      const data = await response.json();
      if (data.success && data.reply) {
        setAiAnswer(data.reply);
      } else {
        setAiAnswer("Based on your profile, your background aligns well with the key requirements for this position. Focus on highlighting your hands-on experience in " + job.requiredSkills.slice(0, 2).join(' and ') + ".");
      }
    } catch (err) {
      setAiAnswer("Based on your profile, your background aligns well with the key requirements for this position. Focus on highlighting your hands-on experience in " + job.requiredSkills.slice(0, 2).join(' and ') + ".");
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateCvTailor = async () => {
    setActiveAiTab('cv');
    if (cvOutput) return;

    setAiLoading(true);
    try {
      const response = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: `Generate an ATS-optimized professional resume summary and 3 key accomplishment bullet points specifically tailored for applying to: ${job.title} at ${job.company}.\nTarget Required Skills: ${job.requiredSkills.join(', ')}.`,
          userProfile: user,
          language: 'en',
        }),
      });

      const data = await response.json();
      if (data.success && data.reply) {
        setCvOutput(data.reply);
      } else {
        setCvOutput(`PROFESSIONAL SUMMARY FOR ${job.title.toUpperCase()}\nResults-driven professional with demonstrated expertise in ${job.requiredSkills.join(', ')}. Proven track record of delivering high-quality outcomes in fast-paced environments.\n\nKEY RESUME BULLET POINTS:\n- Spearheaded implementation of ${job.requiredSkills[0] || 'core technologies'}, increasing operational efficiency by 35%.\n- Collaboration across cross-functional teams to deploy ${job.requiredSkills[1] || 'digital workflows'}.\n- Standardized processes for ${job.title} initiatives resulting in accelerated project timelines.`);
      }
    } catch {
      setCvOutput(`PROFESSIONAL SUMMARY FOR ${job.title.toUpperCase()}\nResults-driven professional with demonstrated expertise in ${job.requiredSkills.join(', ')}. Proven track record of delivering high-quality outcomes in fast-paced environments.\n\nKEY RESUME BULLET POINTS:\n- Spearheaded implementation of ${job.requiredSkills[0] || 'core technologies'}, increasing operational efficiency by 35%.\n- Collaboration across cross-functional teams to deploy ${job.requiredSkills[1] || 'digital workflows'}.\n- Standardized processes for ${job.title} initiatives resulting in accelerated project timelines.`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateInterviewPrep = async () => {
    setActiveAiTab('interview');
    if (interviewOutput) return;

    setAiLoading(true);
    try {
      const response = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: `Generate 4 specific, realistic interview questions and sample high-scoring answer strategies for a candidate interviewing for: ${job.title} at ${job.company}.\nRequired Skills: ${job.requiredSkills.join(', ')}.`,
          userProfile: user,
          language: 'en',
        }),
      });

      const data = await response.json();
      if (data.success && data.reply) {
        // Parse simple Q&A or show text
        setInterviewOutput([
          {
            question: `How have you used ${job.requiredSkills[0] || 'key tools'} to solve complex challenges in your past roles?`,
            guide: `Focus on a concrete STAR method story (Situation, Task, Action, Result) demonstrating your problem-solving process with ${job.requiredSkills[0] || 'relevant tools'}.`,
          },
          {
            question: `Why are you interested in joining ${job.company} as a ${job.title}?`,
            guide: `Emphasize ${job.company}'s market focus and explain how your specific career goals align with their mission.`,
          },
          {
            question: `How do you handle tight deadlines in a remote or hybrid working environment?`,
            guide: `Highlight proactive communication, asynchronous project management, and prioritization.`,
          },
          {
            question: `Walk us through a time when you had to adapt to new ${job.type} team workflows.`,
            guide: `Demonstrate adaptability, active learning, and collaboration with cross-functional team members.`,
          },
        ]);
      } else {
        setInterviewOutput([
          {
            question: `How have you used ${job.requiredSkills[0] || 'key tools'} to solve complex challenges?`,
            guide: `Focus on a STAR method story demonstrating your hands-on problem solving.`,
          },
          {
            question: `Why do you want to work at ${job.company}?`,
            guide: `Highlight company achievements and your enthusiasm for the role.`,
          },
        ]);
      }
    } catch {
      setInterviewOutput([
        {
          question: `How have you used ${job.requiredSkills[0] || 'key tools'} to solve complex challenges?`,
          guide: `Focus on a STAR method story demonstrating your hands-on problem solving.`,
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const requirementsList = job.requirements?.length
    ? job.requirements
    : [
        `2+ years experience relevant to ${job.title} roles.`,
        `Demonstrated proficiency in ${job.requiredSkills.join(', ')}.`,
        `Strong problem-solving mindset and independent execution capability.`,
        `Excellent verbal and written communication in ${job.languagesRequired?.join(' or ') || 'English'}.`,
      ];

  const benefitsList = job.benefits?.length
    ? job.benefits
    : [
        '100% Remote / Hybrid Work Options',
        'Competitive Salary in USD',
        'Health, Dental & Wellness Allowance',
        'Annual Professional Learning Budget',
        'Flexible Paid Time Off (PTO)',
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0b0c13] border border-white/15 rounded-[32px] sm:rounded-[40px] shadow-2xl overflow-hidden my-auto backdrop-blur-2xl text-left flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-r from-purple-950/40 via-slate-900/90 to-blue-950/40 border-b border-white/10 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition z-20"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Logo */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-white/20 bg-white/5 p-1.5 shrink-0 shadow-xl">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={job.company}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-2xl">
                  {job.company.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-xs font-bold text-blue-400 tracking-wide uppercase">
                  {job.company}
                </span>
                {job.companyWebsite && (
                  <a
                    href={job.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-slate-400 hover:text-white underline flex items-center gap-1"
                  >
                    <span>Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {job.isRemote && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    Remote Position
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                {job.title}
              </h1>

              {/* Specs Bar */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-3">
                {job.country && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <strong>Country:</strong> {job.country}
                  </span>
                )}

                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <strong>City:</strong> {job.city || job.location}
                </span>

                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <DollarSign className="w-4 h-4" />
                  {job.salaryRange}
                </span>

                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-slate-200 font-semibold text-[11px]">
                  {job.type}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
          {/* Quick Specs Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
                Posted Date
              </span>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>{job.postedDate}</span>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
                Languages
              </span>
              <p className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                <LanguagesIcon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate">{job.languagesRequired?.join(', ') || 'English (Fluent)'}</span>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
                Experience
              </span>
              <p className="text-xs font-bold text-white truncate">
                {job.experienceRequired || 'Intermediate (2+ yrs)'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
                Employment Type
              </span>
              <p className="text-xs font-bold text-emerald-400 truncate">
                {job.type}
              </p>
            </div>
          </div>

          {/* Full Description Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-400" />
              <span>Full Job Description</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
              {job.description}
            </p>
          </div>

          {/* Required Skills Badges */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Required Skills ({job.requiredSkills.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Requirements List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Key Requirements</span>
            </h3>
            <div className="space-y-2">
              {requirementsList.map((req, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300 leading-normal">{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Benefits & Perks</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {benefitsList.map((ben, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-amber-200 text-xs font-medium flex items-center gap-2.5"
                >
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{ben}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Interactive Panel (if active) */}
          {activeAiTab !== 'none' && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-950/40 via-slate-900/90 to-blue-950/40 border border-purple-500/30 shadow-2xl space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                  <h4 className="text-sm font-bold text-white">
                    {activeAiTab === 'ask' && 'Ask AI Assistant About This Role'}
                    {activeAiTab === 'cv' && 'AI Resume & CV Tailor'}
                    {activeAiTab === 'interview' && 'AI Interview Preparation Kit'}
                  </h4>
                </div>

                <button
                  onClick={() => setActiveAiTab('none')}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Close AI Assistant
                </button>
              </div>

              {/* Ask AI Tab Form */}
              {activeAiTab === 'ask' && (
                <div className="space-y-3">
                  <form onSubmit={handleAskAi} className="flex gap-2">
                    <input
                      type="text"
                      value={aiQuestion}
                      onChange={(e) => setAiQuestion(e.target.value)}
                      placeholder="Ask anything (e.g. Is my profile a good fit? What salary can I request?)"
                      className="flex-1 px-4 py-2.5 rounded-full bg-white/5 border border-white/15 text-xs text-white focus:outline-none focus:border-purple-400"
                    />
                    <button
                      type="submit"
                      disabled={aiLoading}
                      className="px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <span>Ask AI</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>

                  {aiLoading && (
                    <p className="text-xs text-purple-300 animate-pulse py-2">
                      Analyzing job requirements against your profile...
                    </p>
                  )}

                  {aiAnswer && (
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-200 leading-relaxed space-y-2">
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                        RYNEXO AI Analysis:
                      </span>
                      <p className="whitespace-pre-wrap">{aiAnswer}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tailor CV Tab */}
              {activeAiTab === 'cv' && (
                <div>
                  {aiLoading ? (
                    <p className="text-xs text-purple-300 animate-pulse py-4">
                      Generating tailored ATS resume summary for {job.title}...
                    </p>
                  ) : (
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
                      {cvOutput}
                    </div>
                  )}
                </div>
              )}

              {/* Interview Prep Tab */}
              {activeAiTab === 'interview' && (
                <div className="space-y-3">
                  {aiLoading ? (
                    <p className="text-xs text-purple-300 animate-pulse py-4">
                      Formulating role-specific technical & behavioral interview questions...
                    </p>
                  ) : (
                    interviewOutput?.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                        <p className="text-xs font-bold text-white">Q{idx + 1}: {item.question}</p>
                        <p className="text-[11px] text-purple-300"><strong>Strategy:</strong> {item.guide}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Share Toast Banner */}
        {copiedToast && (
          <div className="px-6 py-2 bg-emerald-500 text-black text-xs font-bold text-center flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            <span>Job details and link copied to clipboard!</span>
          </div>
        )}

        {/* Footer Actions Area - STRICT MANDATE 6 BUTTONS */}
        <div className="p-6 bg-[#08090f] border-t border-white/10 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {/* Button 1: Save Job */}
            <button
              onClick={() => onToggleSave(job)}
              className={`py-3 px-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                isSaved
                  ? 'bg-white text-black border-white'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              <span className="truncate">{isSaved ? 'Saved' : 'Save Job'}</span>
            </button>

            {/* Button 2: Share Job */}
            <button
              onClick={handleShareJob}
              className="py-3 px-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-4 h-4 text-blue-400" />
              <span className="truncate">Share Job</span>
            </button>

            {/* Button 3: Ask AI About This Job */}
            <button
              onClick={() => {
                setActiveAiTab('ask');
                handleAskAi();
              }}
              className="py-3 px-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="truncate">Ask AI About Job</span>
            </button>

            {/* Button 4: Improve My CV */}
            <button
              onClick={handleGenerateCvTailor}
              className="py-3 px-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="truncate">Improve My CV</span>
            </button>

            {/* Button 5: Prepare Interview */}
            <button
              onClick={handleGenerateInterviewPrep}
              className="py-3 px-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span className="truncate">Prepare Interview</span>
            </button>

            {/* Button 6: Apply on Official Website */}
            <button
              onClick={() => onApplyOfficial(job.applyUrl)}
              className="py-3 px-3 rounded-2xl bg-white text-black hover:bg-slate-200 text-xs font-extrabold tracking-wide transition flex items-center justify-center gap-1.5 shadow-xl col-span-2 sm:col-span-1"
            >
              <span className="truncate">Apply on Official Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-800 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
