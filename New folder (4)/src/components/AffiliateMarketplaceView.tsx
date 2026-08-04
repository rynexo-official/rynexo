import React, { useState, useEffect } from 'react';
import { ExternalLink, Sparkles, ShieldCheck, DollarSign, Rocket, Layers, Key, AlertCircle, Server } from 'lucide-react';
import { Language, UserProfile, AffiliateOffer } from '../types';
import { getTranslation } from '../i18n/translations';
import { INITIAL_AFFILIATE_OFFERS } from '../data/mockData';
import { ExternalLinkModal } from './ExternalLinkModal';
import { recordAffiliateJoinedInFirestore, fetchAIMemoryFromFirestore } from '../lib/firebase';

interface AffiliateMarketplaceViewProps {
  user?: UserProfile | null;
  offers?: AffiliateOffer[];
  onOfferAdded?: (newOffer: AffiliateOffer) => void;
  language: Language;
  onOpenIntegrations?: () => void;
}

export const AffiliateMarketplaceView: React.FC<AffiliateMarketplaceViewProps> = ({
  user,
  offers = INITIAL_AFFILIATE_OFFERS,
  language,
  onOpenIntegrations,
}) => {
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [aiPlan, setAiPlan] = useState<{ userNiche?: string; monetizationPlan?: string; programs?: any[] } | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<'All' | 'SaaS' | 'CJ' | 'Impact' | 'PartnerStack'>('All');
  const [integrationStatus, setIntegrationStatus] = useState<{ [key: string]: boolean }>({
    cj: false,
    impact: false,
    partnerstack: false,
  });

  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await fetch('/api/integrations/status');
        const data = await res.json();
        if (data.success && Array.isArray(data.integrations)) {
          const map: { [key: string]: boolean } = {};
          data.integrations.forEach((item: any) => {
            map[item.id] = item.connected;
          });
          setIntegrationStatus(map);
        }
      } catch (e) {
        console.warn('Failed to load integration status in Affiliate view:', e);
      }
    }
    loadStatus();
  }, []);

  useEffect(() => {
    async function loadAIAffiliatePlan() {
      if (!user) return;
      try {
        const mem = await fetchAIMemoryFromFirestore(user.uid);
        const res = await fetch('/api/ai/affiliate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userProfile: user,
            aiMemory: mem,
            language,
          }),
        });
        const data = await res.json();
        if (data.success && data.affiliateData) {
          setAiPlan(data.affiliateData);
        }
      } catch (err) {
        console.warn('AI Affiliate Coach load error:', err);
      }
    }
    loadAIAffiliatePlan();
  }, [user, language]);

  const handleExploreOffer = (offer: AffiliateOffer) => {
    if (user?.uid) {
      recordAffiliateJoinedInFirestore(offer.name, user.uid);
    }
    setPendingUrl(offer.joinUrl);
  };

  const aiRecommendedOffers: AffiliateOffer[] = (aiPlan?.programs || []).map((p: any) => ({
    id: p.id || 'aff_ai_' + Math.random().toString(36).substring(7),
    name: p.name,
    category: p.category || 'AI Partner',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    description: p.description || p.whyFits,
    commission: p.commission || 'Up to 50%',
    avgEarnings: p.avgEarnings || '$1,000 / mo',
    joinUrl: p.joinUrl || 'https://google.com',
  }));

  const combinedOffers = [...aiRecommendedOffers, ...offers];
  const displayOffers = combinedOffers.length > 0 ? combinedOffers : INITIAL_AFFILIATE_OFFERS;

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-slate-950/80 border border-white/10 p-8 sm:p-12 text-center flex flex-col items-center justify-center backdrop-blur-2xl shadow-2xl">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-r from-blue-600/15 via-purple-600/15 to-indigo-600/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[11px] font-semibold tracking-widest uppercase mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Curated Partner Ecosystem</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
            {getTranslation(language, 'affiliateTitle')}
          </h1>

          <p className="text-slate-300/90 text-sm sm:text-base font-normal max-w-2xl mt-4 leading-relaxed tracking-wide">
            {getTranslation(language, 'affiliateSubtitle')}
          </p>

          {/* Network Filter Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8 p-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
            {[
              { id: 'All', label: 'All Offers' },
              { id: 'SaaS', label: 'Verified SaaS' },
              { id: 'CJ', label: 'CJ Affiliate', key: 'cj' },
              { id: 'Impact', label: 'Impact Network', key: 'impact' },
              { id: 'PartnerStack', label: 'PartnerStack', key: 'partnerstack' },
            ].map((tab) => {
              const keyName = tab.key;
              const isConnected = keyName ? integrationStatus[keyName] : true;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedNetwork(tab.id as any)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 ${
                    selectedNetwork === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                  {keyName && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isConnected ? 'bg-emerald-400' : 'bg-slate-500'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Network Missing API Key Placeholder Handling */}
      {selectedNetwork === 'CJ' && !integrationStatus.cj && (
        <div className="p-8 sm:p-12 rounded-[32px] bg-white/[0.03] border border-amber-500/30 backdrop-blur-2xl text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
            <Key className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Connect CJ API</h3>
          <p className="text-slate-300 text-xs sm:text-sm max-w-md leading-relaxed mb-6">
            <code className="text-amber-300 font-mono">CJ_DEVELOPER_KEY</code> is not configured in your environment. RYNEXO automatically protects the application and serves internal verified offers without runtime errors.
          </p>
          {onOpenIntegrations && (
            <button
              onClick={onOpenIntegrations}
              className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs tracking-wide shadow-lg transition flex items-center gap-2"
            >
              <Server className="w-4 h-4" />
              <span>Configure in Integration Manager</span>
            </button>
          )}
        </div>
      )}

      {selectedNetwork === 'Impact' && !integrationStatus.impact && (
        <div className="p-8 sm:p-12 rounded-[32px] bg-white/[0.03] border border-blue-500/30 backdrop-blur-2xl text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4">
            <Key className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Connect Impact Network API</h3>
          <p className="text-slate-300 text-xs sm:text-sm max-w-md leading-relaxed mb-6">
            <code className="text-blue-300 font-mono">IMPACT_ACCOUNT_SID</code> is not configured. Telemetry engine has safely disabled live Impact API synchronization.
          </p>
          {onOpenIntegrations && (
            <button
              onClick={onOpenIntegrations}
              className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide shadow-lg transition flex items-center gap-2"
            >
              <Server className="w-4 h-4" />
              <span>Configure in Integration Manager</span>
            </button>
          )}
        </div>
      )}

      {selectedNetwork === 'PartnerStack' && !integrationStatus.partnerstack && (
        <div className="p-8 sm:p-12 rounded-[32px] bg-white/[0.03] border border-purple-500/30 backdrop-blur-2xl text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-4">
            <Key className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Connect PartnerStack API</h3>
          <p className="text-slate-300 text-xs sm:text-sm max-w-md leading-relaxed mb-6">
            <code className="text-purple-300 font-mono">PARTNERSTACK_PUBLIC_KEY</code> is disabled. System is active with fallback SaaS partner catalog.
          </p>
          {onOpenIntegrations && (
            <button
              onClick={onOpenIntegrations}
              className="px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs tracking-wide shadow-lg transition flex items-center gap-2"
            >
              <Server className="w-4 h-4" />
              <span>Configure in Integration Manager</span>
            </button>
          )}
        </div>
      )}

      {/* Modern Marketplace Cards Grid */}
      {(selectedNetwork === 'All' || selectedNetwork === 'SaaS' || (selectedNetwork === 'CJ' && integrationStatus.cj) || (selectedNetwork === 'Impact' && integrationStatus.impact) || (selectedNetwork === 'PartnerStack' && integrationStatus.partnerstack)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayOffers.map((offer) => (
            <div
              key={offer.id}
              className="group relative p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] bg-white/[0.03] border border-white/10 hover:border-white/25 hover:bg-white/[0.06] backdrop-blur-2xl transition-all duration-300 shadow-xl flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/15 bg-white/5 p-1 shadow-md shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={offer.logo}
                      alt={offer.name}
                      className="w-full h-full rounded-xl object-cover"
                    />
                  </div>

                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[11px] font-semibold tracking-wider">
                    {offer.category}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2 group-hover:text-blue-300 transition-colors">
                  {offer.name}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed font-normal">
                  {offer.description}
                </p>
              </div>

              <div className="relative z-10 mt-8">
                <button
                  onClick={() => handleExploreOffer(offer)}
                  className="w-full py-3.5 px-6 rounded-full bg-white text-black font-bold text-xs tracking-wide shadow-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-2 group/btn"
                >
                  <span>{getTranslation(language, 'exploreProgram')}</span>
                  <ExternalLink className="w-4 h-4 text-slate-700 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog before leaving RYNEXO */}
      <ExternalLinkModal
        isOpen={!!pendingUrl}
        targetUrl={pendingUrl}
        onClose={() => setPendingUrl(null)}
        language={language}
      />
    </div>
  );
};
