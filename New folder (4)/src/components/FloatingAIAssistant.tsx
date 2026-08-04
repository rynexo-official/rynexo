import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, X, Send, Zap, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { UserProfile, Language, AIMemory } from '../types';
import { fetchAIMemoryFromFirestore, syncAIMemoryToFirestore, updateAIMemoryRecommendationInFirestore } from '../lib/firebase';

interface FloatingAIAssistantProps {
  user: UserProfile | null;
  language: Language;
}

interface Message {
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const FloatingAIAssistant: React.FC<FloatingAIAssistantProps> = ({ user, language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [aiMemory, setAiMemory] = useState<AIMemory | null>(null);
  const [memorySynced, setMemorySynced] = useState<boolean>(false);

  useEffect(() => {
    async function loadMemory() {
      if (user?.uid) {
        const mem = await syncAIMemoryToFirestore(user);
        setAiMemory(mem);
        setMemorySynced(true);
      }
    }
    loadMemory();
  }, [user]);

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: user
        ? `Hello ${user.fullName.split(' ')[0]}! I am your RYNEXO AI OS. Permanent AI Memory is synced with Firestore (${user.country || 'Global'}, ${user.experienceLevel || 'Intermediate'}, Target: $${user.incomeTarget || user.monthlyGoalUSD || 0}/mo). How can I accelerate your goals today?`
        : "Hello! I am RYNEXO AI OS. Sign in to sync your personalized career & business intelligence.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      sender: 'user',
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentQuery = input.trim();
    setInput('');
    setLoading(true);

    try {
      let currentMem = aiMemory;
      if (user?.uid && !currentMem) {
        currentMem = await syncAIMemoryToFirestore(user);
        setAiMemory(currentMem);
        setMemorySynced(true);
      }

      const response = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentQuery,
          userProfile: user,
          aiMemory: currentMem,
          language,
        }),
      });

      const data = await response.json();
      if (data.success && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);

        if (user?.uid) {
          updateAIMemoryRecommendationInFirestore(user.uid, data.reply).catch(e =>
            console.warn('AI memory update error:', e)
          );
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: "I analyzed your AI Memory. Focus on completing today's high-priority daily success missions to increase your streak and unlock income milestones.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "I am currently syncing with your Firebase AI Memory. Please try again in a moment.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "What's my top action today?",
    "Recommend a business for my budget",
    "How do I reach $5k/mo?",
  ];

  return (
    <>
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 sm:bottom-6 right-5 z-50 group flex items-center gap-2.5 p-1 rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-600 shadow-2xl hover:scale-105 transition-all duration-300"
          title="Open RYNEXO AI OS"
        >
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#080811] text-white text-xs font-bold border border-white/10">
            <div className="relative">
              <Bot className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="bg-gradient-to-r from-white via-purple-200 to-blue-300 bg-clip-text text-transparent font-extrabold tracking-tight">
              AI Assistant
            </span>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
              OS 2.0
            </span>
          </div>
        </button>
      )}

      {/* Floating Slide-over Chat Box */}
      {isOpen && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px] h-[520px] z-50 rounded-3xl bg-[#090914]/95 border border-white/15 backdrop-blur-2xl shadow-2xl shadow-black/90 flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-white/[0.03] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 p-0.5 shadow-lg shadow-purple-500/20">
                <div className="w-full h-full rounded-[14px] bg-[#090914] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white tracking-wide">RYNEXO AI Assistant</h3>
                  <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                    AI Memory Synced
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Contextual Firestore Memory Engine</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-tr-none shadow-md'
                      : 'bg-white/[0.05] border border-white/10 text-slate-200 rounded-tl-none leading-relaxed'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-purple-300 text-xs w-fit">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Thinking using your profile...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 border-t border-white/5 bg-white/[0.02] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => setInput(p)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-slate-300 transition whitespace-nowrap"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-white/10 bg-[#06060c] flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask AI OS anything..."
              className="flex-1 bg-white/[0.05] border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white disabled:opacity-40 hover:opacity-90 transition shadow-lg shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
