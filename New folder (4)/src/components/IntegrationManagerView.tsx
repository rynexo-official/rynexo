import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Zap,
  Globe,
  Radio,
  FileText,
  ExternalLink,
  AlertTriangle,
  Server,
  Key,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Language, UserProfile } from '../types';

export interface IntegrationService {
  id: string;
  name: string;
  provider: string;
  category: string;
  connected: boolean;
  details: string;
  lastSync: string;
  docsUrl: string;
  envVar: string;
}

interface IntegrationManagerViewProps {
  user?: UserProfile | null;
  language: Language;
}

export const IntegrationManagerView: React.FC<IntegrationManagerViewProps> = ({ user, language }) => {
  const [integrations, setIntegrations] = useState<IntegrationService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{ [key: string]: { success: boolean; message: string; latencyMs?: number } }>({});

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/integrations/status');
      const data = await res.json();
      if (data.success && Array.isArray(data.integrations)) {
        setIntegrations(data.integrations);
      }
    } catch (err) {
      console.error('Failed to fetch integration status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    try {
      const res = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: id }),
      });
      const data = await res.json();
      setTestResults((prev) => ({
        ...prev,
        [id]: {
          success: data.success,
          message: data.message || (data.success ? 'Connection verified successfully.' : 'Connection test failed.'),
          latencyMs: data.latencyMs,
        },
      }));
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [id]: {
          success: false,
          message: err.message || 'Failed to ping integration endpoint.',
        },
      }));
    } finally {
      setTestingId(null);
    }
  };

  const connectedCount = integrations.filter((i) => i.connected).length;
  const totalCount = integrations.length || 6;

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-slate-950/90 border border-white/10 p-8 sm:p-12 backdrop-blur-2xl shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px] font-bold tracking-widest uppercase mb-4 shadow-sm">
              <Server className="w-3.5 h-3.5 text-purple-400" />
              <span>Enterprise API Infrastructure</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Integration Manager
            </h1>
            <p className="text-slate-300/90 text-xs sm:text-sm font-normal max-w-2xl mt-3 leading-relaxed">
              Real-time telemetry and API key auto-detection engine for RYNEXO AI OS services.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/[0.04] border border-white/10 rounded-3xl p-4 sm:p-5 shrink-0 backdrop-blur-xl">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">
                {connectedCount} <span className="text-slate-500 text-lg font-normal">/ {totalCount}</span>
              </div>
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mt-0.5">
                {connectedCount === totalCount ? 'All Services Live' : `${connectedCount} Active Services`}
              </div>
            </div>
            <button
              onClick={fetchStatus}
              disabled={isLoading}
              className="ml-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Integrations Status Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              Registered API Connectors
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Auto-detected via process.env
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 rounded-[32px] bg-white/[0.03] border border-white/10 text-center text-slate-400 flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
            <p className="text-xs font-semibold">Detecting environment credentials...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((service) => {
              const testRes = testResults[service.id];
              const isTesting = testingId === service.id;

              return (
                <div
                  key={service.id}
                  className={`relative p-6 rounded-[32px] bg-white/[0.03] border ${
                    service.connected
                      ? 'border-emerald-500/30 hover:border-emerald-500/50'
                      : 'border-white/10 hover:border-white/20'
                  } backdrop-blur-2xl transition-all duration-300 shadow-xl flex flex-col justify-between overflow-hidden group`}
                >
                  <div>
                    {/* Header Row: Provider & Status Badge */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {service.category}
                        </span>
                        <h3 className="text-xl font-bold text-white mt-0.5 group-hover:text-purple-300 transition-colors">
                          {service.name}
                        </h3>
                      </div>

                      {/* Status Indicator */}
                      {service.connected ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide flex items-center gap-1.5 shrink-0 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Connected
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-400 text-xs font-bold tracking-wide flex items-center gap-1.5 shrink-0">
                          <XCircle className="w-3.5 h-3.5 text-slate-500" />
                          Missing
                        </span>
                      )}
                    </div>

                    {/* Service Details & Environment Variable info */}
                    <div className="space-y-2 mb-6 text-xs">
                      <div className="p-3 rounded-2xl bg-black/40 border border-white/5 font-mono text-[11px] text-slate-300 flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <Key className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span className="truncate">{service.envVar}</span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${service.connected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                          {service.connected ? 'CONFIGURED' : 'UNSET'}
                        </span>
                      </div>

                      <p className="text-slate-300/80 leading-relaxed text-xs">
                        {service.details}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Last Sync:</span>
                        <span className="font-semibold text-slate-200">{service.lastSync}</span>
                      </div>
                    </div>

                    {/* Test result alert if present */}
                    {testRes && (
                      <div
                        className={`mb-4 p-3 rounded-2xl text-xs border ${
                          testRes.success
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        }`}
                      >
                        <div className="font-bold flex items-center justify-between mb-0.5">
                          <span>{testRes.success ? 'Ping Successful' : 'Ping Failed'}</span>
                          {testRes.latencyMs && <span>{testRes.latencyMs}ms</span>}
                        </div>
                        <p className="text-[11px] opacity-90">{testRes.message}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <button
                      onClick={() => handleTestConnection(service.id)}
                      disabled={isTesting}
                      className="flex-1 py-2.5 px-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isTesting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-300" />
                          <span>Testing...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>Test Connection</span>
                        </>
                      )}
                    </button>

                    <a
                      href={service.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition"
                      title="View API Docs"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Helper Card for Unconfigured Services */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-r from-purple-950/20 via-blue-950/20 to-slate-950/80 border border-white/10 backdrop-blur-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Key className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                How to Connect Missing API Keys
              </h3>
              <p className="text-xs text-slate-300/90 leading-relaxed mt-1 max-w-xl">
                Missing integrations (News API, CJ, Impact, PartnerStack) fall back gracefully to internal verified datasets. To connect live keys, update <code className="text-purple-300 font-mono">.env.example</code> or use the AI Studio Settings menu.
              </p>
            </div>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono text-purple-300 flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <span>.env.example</span>
          </div>
        </div>
      </div>
    </div>
  );
};
