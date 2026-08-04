import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Zap,
  Briefcase,
  FileText,
  Send,
  GraduationCap,
  Rocket,
  DollarSign,
  CheckSquare,
  Globe,
  Play,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { UserProfile, AIMemory, AIWorker, AIWorkerId, AIWorkerExecution, InterAgentMessage, AITimelineEvent, Language } from '../types';
import {
  INITIAL_AI_WORKERS,
  executeAIWorker,
  runFullExecutiveWorkforce
} from '../lib/aiExecutiveAgent';
import { fetchAIMemoryFromFirestore } from '../lib/firebase';
import { recordAITimelineEventInFirestore } from '../lib/aiCareerAgent';

interface AIExecutiveCommandCenterViewProps {
  user: UserProfile | null;
  language: Language;
  onNavigateTab: (tab: any) => void;
  onClose?: () => void;
}

export const AIExecutiveCommandCenterView: React.FC<AIExecutiveCommandCenterViewProps> = ({
  user,
  language,
  onNavigateTab,
  onClose,
}) => {
  const [workers, setWorkers] = useState<AIWorker[]>(INITIAL_AI_WORKERS);
  const [memory, setMemory] = useState<AIMemory | null>(null);
  const [isRunningAll, setIsRunningAll] = useState<boolean>(false);
  const [runningWorkerId, setRunningWorkerId] = useState<string | null>(null);
  const [executionLogs, setExecutionLogs] = useState<AIWorkerExecution[]>([]);
  const [messages, setMessages] = useState<InterAgentMessage[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<AIWorker | null>(null);
  const [activeTab, setActiveTab] = useState<'workforce' | 'pipeline' | 'timeline' | 'logs'>('workforce');

  useEffect(() => {
    async function loadData() {
      if (user?.uid) {
        const mem = await fetchAIMemoryFromFirestore(user.uid);
        if (mem) {
          setMemory(mem);
        }
      }
    }
    loadData();
  }, [user]);

  const handleRunFullWorkforce = async () => {
    setIsRunningAll(true);

    // Call server endpoint
    try {
      await fetch('/api/ai/executive/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId: 'all', userProfile: user }),
      });
    } catch (err) {
      console.warn('Backend executive route warning:', err);
    }

    const result = await runFullExecutiveWorkforce(user, memory);
    setWorkers(result.workers);
    setExecutionLogs(prev => [...result.executions, ...prev]);
    setMessages(prev => [...result.allMessages, ...prev]);

    if (user?.uid) {
      const mem = await fetchAIMemoryFromFirestore(user.uid);
      if (mem) setMemory(mem);
    }

    setIsRunningAll(false);
  };

  const handleRunSingleWorker = async (workerId: AIWorkerId) => {
    setRunningWorkerId(workerId);

    try {
      await fetch('/api/ai/executive/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId, userProfile: user }),
      });
    } catch (err) {
      console.warn('Backend worker execution route warning:', err);
    }

    const result = await executeAIWorker(workerId, user, memory);
    setWorkers(prev => prev.map(w => w.id === workerId ? result.worker : w));
    setExecutionLogs(prev => [result.execution, ...prev]);
    setMessages(prev => [...result.messages, ...prev]);

    if (user?.uid) {
      const mem = await fetchAIMemoryFromFirestore(user.uid);
      if (mem) setMemory(mem);
    }

    setRunningWorkerId(null);
  };

  const getWorkerIcon = (iconName: string) => {
    switch (iconName) {
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-blue-400" />;
      case 'FileText': return <FileText className="w-5 h-5 text-indigo-400" />;
      case 'Send': return <Send className="w-5 h-5 text-purple-400" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5 text-amber-400" />;
      case 'Rocket': return <Rocket className="w-5 h-5 text-emerald-400" />;
      case 'DollarSign': return <DollarSign className="w-5 h-5 text-teal-400" />;
      case 'CheckSquare': return <CheckSquare className="w-5 h-5 text-rose-400" />;
      case 'Globe': return <Globe className="w-5 h-5 text-cyan-400" />;
      default: return <Cpu className="w-5 h-5 text-blue-400" />;
    }
  };

  const avgConfidence = Math.round(workers.reduce((acc, w) => acc + w.confidence, 0) / workers.length);
  const avgPerformance = Math.round(workers.reduce((acc, w) => acc + w.performanceScore, 0) / workers.length);

  return (
    <div className="space-y-6 text-white pb-12">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#060814] via-[#0d102b] to-[#150a2b] p-6 sm:p-8 border border-indigo-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>RYNEXO Autonomous AI Workforce</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>RYNEXO AI Executive Command Center</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Enterprise-grade multi-agent autonomous workforce. 8 specialized AI Workers executing, communicating, and storing decisions inside Firestore long-term memory.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
            <button
              onClick={handleRunFullWorkforce}
              disabled={isRunningAll}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs tracking-wide shadow-xl shadow-indigo-600/30 transition flex items-center gap-2.5 disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 ${isRunningAll ? 'animate-bounce' : ''}`} />
              <span>{isRunningAll ? 'Executing 8 AI Workers...' : 'Execute Full AI Workforce'}</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Telemetry Bar */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10">
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Active Workers</span>
            </div>
            <div className="text-2xl font-bold text-white flex items-baseline gap-2">
              <span>8 / 8</span>
              <span className="text-xs font-normal text-emerald-400">100% Operational</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Avg Confidence</span>
            </div>
            <div className="text-2xl font-bold text-emerald-300">
              {avgConfidence}%
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Workforce Velocity</span>
            </div>
            <div className="text-2xl font-bold text-amber-300">
              {avgPerformance} / 100
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span>Firestore Long-Term Memory</span>
            </div>
            <div className="text-2xl font-bold text-purple-300 text-xs sm:text-sm font-mono mt-1 truncate">
              ai_memory / {user?.uid ? user.uid.substring(0, 8) : 'guest'}...
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-white/10 space-x-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('workforce')}
          className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'workforce'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>8 AI Workers Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'pipeline'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Inter-Agent Automation Pipeline</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'timeline'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Permanent AI Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'logs'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Execution Telemetry Logs ({executionLogs.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: 8 AI WORKERS MATRIX */}
      {/* ======================================================== */}
      {activeTab === 'workforce' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {workers.map((worker) => {
            const isRunningThis = runningWorkerId === worker.id || isRunningAll;

            return (
              <div
                key={worker.id}
                className="p-5 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-indigo-500/40 backdrop-blur-xl transition flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
                      {getWorkerIcon(worker.iconName)}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      worker.status === 'Executing' || isRunningThis
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                        : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    }`}>
                      {isRunningThis ? 'Executing' : worker.status}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-white tracking-tight">{worker.name}</h3>
                  <p className="text-xs text-indigo-300 font-medium mb-2">{worker.role}</p>
                  <p className="text-[11px] text-slate-300 leading-relaxed mb-3 line-clamp-2">
                    {worker.description}
                  </p>

                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1.5 mb-3">
                    <div className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Last Mission:</span>
                      <span className="font-mono text-indigo-300">{worker.executionTimeMs}ms</span>
                    </div>
                    <p className="text-[11px] text-slate-200 font-mono line-clamp-2">
                      {worker.lastTask}
                    </p>
                  </div>

                  {/* Confidence & Score Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-400">Confidence</span>
                      <span className="text-emerald-400 font-bold">{worker.confidence}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                        style={{ width: `${worker.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                  <button
                    onClick={() => handleRunSingleWorker(worker.id)}
                    disabled={isRunningThis}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-indigo-600 hover:text-white text-slate-300 font-bold text-xs transition border border-white/10 flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Play className={`w-3.5 h-3.5 ${isRunningThis ? 'animate-spin' : ''}`} />
                    <span>{isRunningThis ? 'Running...' : 'Run Agent'}</span>
                  </button>

                  <button
                    onClick={() => setSelectedWorker(worker)}
                    className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold transition border border-white/10"
                    title="Inspect Worker Details"
                  >
                    Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: INTER-AGENT AUTOMATION PIPELINE */}
      {/* ======================================================== */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  <span>Autonomous Communication & Signal Pipeline</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  How RYNEXO AI Workers pass telemetry, signals, and outputs to each other in real-time.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/20">
                8 Inter-Connected Nodes
              </span>
            </div>

            {/* Pipeline Step Diagram */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-blue-500/30 relative">
                <div className="text-[10px] font-mono text-blue-400 uppercase font-bold mb-1">Node 1: Scouter</div>
                <div className="font-bold text-sm text-white">Career Agent</div>
                <p className="text-[11px] text-slate-300 mt-1">Discovers target job roles & salary benchmarks.</p>
                <div className="mt-3 text-[10px] text-indigo-300 font-mono flex items-center gap-1">
                  <span>Emits to: Resume & Outreach</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-indigo-500/30 relative">
                <div className="text-[10px] font-mono text-indigo-400 uppercase font-bold mb-1">Node 2: ATS Optimizer</div>
                <div className="font-bold text-sm text-white">Resume Agent</div>
                <p className="text-[11px] text-slate-300 mt-1">Synthesizes tailored CV bullets for target jobs.</p>
                <div className="mt-3 text-[10px] text-indigo-300 font-mono flex items-center gap-1">
                  <span>Emits to: Outreach</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-purple-500/30 relative">
                <div className="text-[10px] font-mono text-purple-400 uppercase font-bold mb-1">Node 3: Diplomat</div>
                <div className="font-bold text-sm text-white">Outreach Agent</div>
                <p className="text-[11px] text-slate-300 mt-1">Generates cold email proposals & recruiter pitches.</p>
                <div className="mt-3 text-[10px] text-indigo-300 font-mono flex items-center gap-1">
                  <span>Emits to: Productivity</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-amber-500/30 relative">
                <div className="text-[10px] font-mono text-amber-400 uppercase font-bold mb-1">Node 4: Educator</div>
                <div className="font-bold text-sm text-white">Skill Agent</div>
                <p className="text-[11px] text-slate-300 mt-1">Calculates missing skills for top 10% income tier.</p>
                <div className="mt-3 text-[10px] text-indigo-300 font-mono flex items-center gap-1">
                  <span>Emits to: Productivity</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>

          {/* Inter-Agent Message Log Stream */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>Streamed Inter-Agent Signal Bus</span>
            </h3>

            {messages.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                Click "Execute Full AI Workforce" above to generate inter-agent signals across all 8 workers!
              </div>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                {messages.map((msg) => (
                  <div key={msg.id} className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                        {msg.fromWorkerId.toUpperCase()} &rarr; {msg.toWorkerId.toUpperCase()}
                      </span>
                      <span className="text-white font-semibold">{msg.topic}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Payload: {JSON.stringify(msg.payload)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: PERMANENT AI TIMELINE */}
      {/* ======================================================== */}
      {activeTab === 'timeline' && (
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <span>Firestore Permanent AI Workforce Memory Timeline</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Syncing Firestore `ai_memory`</span>
          </div>

          {(!memory?.timelineEvents || memory.timelineEvents.length === 0) ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No timeline events recorded in Firestore yet. Trigger AI workers to write execution logs to memory!
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-500/20">
              {memory.timelineEvents.map((evt) => (
                <div key={evt.id} className="relative group">
                  <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-slate-900 shadow" />
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 transition">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-white text-sm">{evt.title}</span>
                      <span className="text-slate-400 font-mono">{new Date(evt.timestamp).toLocaleDateString()} {new Date(evt.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-slate-300">{evt.description}</p>
                    {evt.scoreDelta && (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 text-[10px] font-mono font-bold">
                        +{evt.scoreDelta} Career Points
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: EXECUTION TELEMETRY LOGS */}
      {/* ======================================================== */}
      {activeTab === 'logs' && (
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <span>Worker Execution Telemetry & Latency Logs</span>
          </h3>

          {executionLogs.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              No execution telemetry logs captured yet. Execute any worker to generate latency and throughput logs.
            </div>
          ) : (
            <div className="space-y-3 font-mono text-xs">
              {executionLogs.map((log) => (
                <div key={log.id} className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-300 text-sm">{log.workerName}</span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      {log.durationMs}ms &bull; Confidence {log.confidence}%
                    </span>
                  </div>
                  <div className="text-slate-300 text-xs">{log.actionTaken}</div>
                  <div className="text-slate-400 text-[11px] font-sans">{log.outputSummary}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Worker Details Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-indigo-500/30 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  {getWorkerIcon(selectedWorker.iconName)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{selectedWorker.name}</h3>
                  <p className="text-xs text-indigo-300 font-mono">{selectedWorker.role}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedWorker(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg bg-white/5"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedWorker.description}
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                <div className="text-slate-400 mb-1 text-[10px]">Inputs Required:</div>
                <div className="text-white flex flex-wrap gap-1.5">
                  {selectedWorker.inputsRequired.map((inp, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 text-slate-200 text-[10px]">
                      {inp}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                <div className="text-slate-400 mb-1 text-[10px]">Outputs Produced:</div>
                <div className="text-white flex flex-wrap gap-1.5">
                  {selectedWorker.outputsProduced.map((out, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 text-[10px]">
                      {out}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                handleRunSingleWorker(selectedWorker.id);
                setSelectedWorker(null);
              }}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
            >
              Trigger Execution Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
