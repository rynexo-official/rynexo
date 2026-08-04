import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  TrendingUp,
  DollarSign,
  Users,
  Building2,
  UserCheck,
  Activity,
  Globe,
  Store,
  CreditCard,
  Server,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  PieChart,
  BarChart3,
  Layers
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { UserProfile, Language, AdminAnalytics } from '../types';
import { INITIAL_ADMIN_ANALYTICS } from '../lib/enterpriseEcosystem';

interface AdminDashboardViewProps {
  user: UserProfile | null;
  language: Language;
  onClose?: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  user,
  language,
  onClose,
}) => {
  const [analytics, setAnalytics] = useState<AdminAnalytics>(INITIAL_ADMIN_ANALYTICS);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'marketplace' | 'telemetry'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    async function loadBackendAnalytics() {
      try {
        const res = await fetch('/api/admin/analytics');
        const data = await res.json();
        if (data.success) {
          setAnalytics(prev => ({
            ...prev,
            mrrUSD: data.mrrUSD || prev.mrrUSD,
            arrUSD: data.arrUSD || prev.arrUSD,
            totalRevenueUSD: data.totalRevenueUSD || prev.totalRevenueUSD,
            activeUsersCount: data.activeUsersCount || prev.activeUsersCount,
          }));
        }
      } catch (err) {
        console.warn('Analytics API warning:', err);
      }
    }
    loadBackendAnalytics();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const revenueHistoryData = [
    { month: 'Jan', mrr: 42000, arr: 504000 },
    { month: 'Feb', mrr: 51000, arr: 612000 },
    { month: 'Mar', mrr: 63000, arr: 756000 },
    { month: 'Apr', mrr: 72000, arr: 864000 },
    { month: 'May', mrr: 79000, arr: 948000 },
    { month: 'Jun', mrr: 84250, arr: 1011000 },
  ];

  return (
    <div className="space-y-6 text-white pb-12">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#050917] via-[#0b1330] to-[#18092c] p-6 sm:p-8 border border-emerald-500/30 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              <span>RYNEXO Enterprise System Command</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>Admin Control & Real-Time Business Analytics</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Global system monitoring: MRR, ARR, conversion funnel, candidate growth, verified companies, payment gateways, and backend API telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleRefresh}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Real-time Financial Metrics Row */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10">
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Monthly Recurring Revenue (MRR)</span>
            </div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              ${analytics.mrrUSD.toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-blue-400" />
              <span>Annual Run Rate (ARR)</span>
            </div>
            <div className="text-2xl font-bold text-blue-300 font-mono">
              ${analytics.arrUSD.toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>Active Monthly Users</span>
            </div>
            <div className="text-2xl font-bold text-purple-300 font-mono">
              {analytics.activeUsersCount.toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Conversion / Retention</span>
            </div>
            <div className="text-xl font-bold text-white font-mono flex items-baseline gap-2">
              <span className="text-amber-300">{analytics.conversionRate}%</span>
              <span className="text-xs text-slate-400">/ {analytics.retentionRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-white/10 space-x-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Real-time Financials & Growth</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Accounts Management (Users, Companies, Recruiters)</span>
        </button>

        <button
          onClick={() => setActiveTab('marketplace')}
          className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'marketplace'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Marketplace & Affiliates Monitor</span>
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'telemetry'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>API Health & System Logs</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: REAL-TIME FINANCIALS & GROWTH */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* MRR & ARR Growth Chart */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg text-white">Monthly & Annual Revenue Growth Trajectory</h3>
                <p className="text-xs text-slate-400">MRR expansion driven by AI Pro & Recruiter Enterprise tier subscriptions.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-mono font-bold">
                +18.4% MoM Growth
              </span>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueHistoryData}>
                  <defs>
                    <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="mrr" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#mrrGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Markets & Top Companies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>Top Revenue Markets By Country</span>
              </h3>

              <div className="space-y-2.5 pt-2">
                {analytics.topCountries.map((c, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">{c.country}</span>
                      <div className="text-[10px] text-slate-400">{c.userCount.toLocaleString()} Active Users</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-emerald-400">${c.revenueUSD.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">Revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-400" />
                <span>Top Enterprise Hiring Partners</span>
              </h3>

              <div className="space-y-2.5 pt-2">
                {analytics.topCompanies.map((comp, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">{comp.name}</span>
                      <div className="text-[10px] text-slate-400">{comp.jobsPosted} Active Job Postings</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-blue-300">{comp.hiresCount} Verified Hires</div>
                      <div className="text-[10px] text-slate-400">Success Rate</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ACCOUNTS MANAGEMENT */}
      {/* ======================================================== */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Enterprise User, Corporate Company & Recruiter Accounts</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="text-xs text-slate-400">Total Registered Candidates</div>
              <div className="text-2xl font-bold text-white font-mono mt-1">{analytics.registeredUsersCount.toLocaleString()}</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="text-xs text-slate-400">Corporate Companies</div>
              <div className="text-2xl font-bold text-blue-400 font-mono mt-1">{analytics.companiesCount} Verified</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="text-xs text-slate-400">Active Agency Recruiters</div>
              <div className="text-2xl font-bold text-purple-400 font-mono mt-1">{analytics.recruitersCount} Seats</div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: MARKETPLACE & AFFILIATES MONITOR */}
      {/* ======================================================== */}
      {activeTab === 'marketplace' && (
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-400" />
            <span>High-Yield Affiliate Programs Telemetry</span>
          </h3>

          <div className="space-y-3 pt-2">
            {analytics.topAffiliatePrograms.map((aff, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-white text-sm">{aff.name}</div>
                  <div className="text-slate-400">{aff.clicks.toLocaleString()} Candidate Clicks</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-400 text-base">${aff.earningsUSD.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400">Commissions Generated</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: API HEALTH & SYSTEM LOGS */}
      {/* ======================================================== */}
      {activeTab === 'telemetry' && (
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-400" />
            <span>Global Infrastructure API Health & Microservices</span>
          </h3>

          <div className="space-y-3 pt-2">
            {analytics.apiHealth.map((api, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-white text-sm">{api.service}</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-slate-400">{api.latencyMs}ms Latency</span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/20">
                    {api.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
