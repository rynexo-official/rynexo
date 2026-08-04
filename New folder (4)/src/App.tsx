/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, getStoredUserSession, logoutUserFromFirebase, fetchUserProfileFromFirestore, fetchAIMemoryFromFirestore, isUserSubscriptionActive, updateUserProfileInFirestore } from './lib/firebase';
import { Language, UserProfile, AffiliateOffer, AIMemory } from './types';
import { INITIAL_AFFILIATE_OFFERS } from './data/mockData';
import { Sidebar, ExtendedNavView } from './components/Sidebar';
import { FloatingAIAssistant } from './components/FloatingAIAssistant';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { AuthModal } from './components/AuthModal';
import { WelcomeModal } from './components/WelcomeModal';
import { DashboardView } from './components/DashboardView';
import { FindJobView } from './components/FindJobView';
import { StartBusinessView } from './components/StartBusinessView';
import { AffiliateMarketplaceView } from './components/AffiliateMarketplaceView';
import { CommunityView } from './components/CommunityView';
import { AICoachView } from './components/AICoachView';
import { LearningCenterView } from './components/LearningCenterView';
import { ProfileView } from './components/ProfileView';
import { AIReadinessView } from './components/AIReadinessView';
import { IntegrationManagerView } from './components/IntegrationManagerView';
import { AIAgentAutopilotView } from './components/AIAgentAutopilotView';
import { AIExecutiveCommandCenterView } from './components/AIExecutiveCommandCenterView';
import { MarketplaceView } from './components/MarketplaceView';
import { EnterprisePaymentsView } from './components/EnterprisePaymentsView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { GlobalAIONotificationEngine } from './components/GlobalAIONotificationEngine';
import { AIBrainMemoryDrawer } from './components/AIBrainMemoryDrawer';
import { SubscriptionPaywallModal } from './components/SubscriptionPaywallModal';
import { TrialCountdownBanner } from './components/TrialCountdownBanner';
import { subscribeToAIBrainOS, setAIOperatingSystemContext } from './lib/aiBrainOS';
import { Lock, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(getStoredUserSession());
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('language');
      if (saved === 'fr' || saved === 'ar' || saved === 'en') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en';
  });
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLanguageChange = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('language', newLang);
    } catch (e) {
      console.warn('Failed to save language in localStorage:', e);
    }
    if (user && user.uid) {
      setUser((prev) => (prev ? { ...prev, language: newLang } : null));
      updateUserProfileInFirestore({ language: newLang }, user.uid).catch((err) => {
        console.warn('Failed to sync language to Firestore user profile:', err);
      });
    }
  };

  // AI OS Global Brain Memory & Notification States
  const [aiMemory, setAIMemory] = useState<AIMemory | null>(null);
  const [showBrainDrawer, setShowBrainDrawer] = useState(false);
  const [activeLearningSignals, setActiveLearningSignals] = useState<{ source: string; insight: string; timestamp: string }[]>([]);

  // Modal Overlay States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [activeModalView, setActiveModalView] = useState<'none' | 'community' | 'learning' | 'affiliates' | 'readiness' | 'integrations' | 'ai-agent' | 'ai-executive' | 'marketplace' | 'payments' | 'admin'>('none');
  const [paymentPlanSelection, setPaymentPlanSelection] = useState<string | undefined>(undefined);

  // Custom Affiliate Offers State
  const [affiliateOffers, setAffiliateOffers] = useState<AffiliateOffer[]>(INITIAL_AFFILIATE_OFFERS);

  // Sync Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await fetchUserProfileFromFirestore(firebaseUser.uid);
          if (profile) {
            setUser(profile);
            if (profile.language && ['en', 'fr', 'ar'].includes(profile.language)) {
              handleLanguageChange(profile.language as Language);
            }
          }
        } catch (err) {
          console.warn('Failed to load user profile from Firestore:', err);
        }
      } else if (!getStoredUserSession()) {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch AI Memory from Firestore when user logs in
  useEffect(() => {
    if (user?.uid) {
      fetchAIMemoryFromFirestore(user.uid).then((mem) => {
        setAIMemory(mem);
        setAIOperatingSystemContext({
          profile: user,
          memory: mem,
          dailySuccess: null,
          proactiveRecommendations: [],
          activeLearningSignals: [],
          isLearning: false,
          lastSyncTime: new Date().toISOString(),
        });
      });
    } else {
      setAIMemory(null);
    }
  }, [user?.uid]);

  // Subscribe to AI OS Central Brain Updates
  useEffect(() => {
    const unsub = subscribeToAIBrainOS((ctx) => {
      if (ctx.memory) setAIMemory(ctx.memory);
      if (ctx.activeLearningSignals) setActiveLearningSignals(ctx.activeLearningSignals);
    });
    return unsub;
  }, []);

  // Update HTML dir attribute for RTL support when language is Arabic
  useEffect(() => {
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = language;
    }
  }, [language]);

  const handleAuthSuccess = (authUser: UserProfile, isNewRegistration: boolean) => {
    setUser(authUser);
    setShowAuthModal(false);
    if (isNewRegistration) {
      setShowWelcomeModal(true);
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleSignOut = async () => {
    await logoutUserFromFirebase();
    setUser(null);
    setActiveTab('dashboard');
    setActiveModalView('none');
  };

  const handleOfferAdded = (newOffer: AffiliateOffer) => {
    setAffiliateOffers((prev) => [newOffer, ...prev]);
  };

  const handleSidebarNavigate = (view: ExtendedNavView) => {
    if (['dashboard', 'coach', 'jobs', 'business', 'profile'].includes(view)) {
      setActiveModalView('none');
      setActiveTab(view as TabType);
    } else {
      setActiveModalView(view as 'community' | 'learning' | 'affiliates' | 'readiness' | 'integrations' | 'ai-agent' | 'ai-executive' | 'marketplace' | 'payments' | 'admin');
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-slate-200 font-sans selection:bg-purple-500 selection:text-white relative overflow-x-hidden flex">
      {/* Immersive UI Ambient Radial Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[45%] h-[45%] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Desktop & Mobile Drawer Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        activeModalView={activeModalView}
        onNavigate={handleSidebarNavigate}
        user={user}
        language={language}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Container Area (pushed right or left on desktop depending on LTR/RTL) */}
      <div className={`flex-1 min-w-0 flex flex-col min-h-screen ${language === 'ar' ? 'lg:pr-64 xl:pr-72 lg:pl-0' : 'lg:pl-64 xl:pl-72 lg:pr-0'}`}>
        {/* Sticky Glassmorphism Header */}
        <Header
          currentLanguage={language}
          onLanguageChange={handleLanguageChange}
          user={user}
          onOpenProfile={() => {
            setActiveModalView('none');
            setActiveTab('profile');
          }}
          onOpenAuth={() => setShowAuthModal(true)}
          onSignOut={handleSignOut}
          onOpenBrainDrawer={() => setShowBrainDrawer(true)}
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        />

        {/* 3-Day Free Trial SaaS Countdown Timer Banner */}
        <TrialCountdownBanner
          user={user}
          language={language}
          onOpenPayments={() => setActiveModalView('payments')}
        />

        {/* Global AI OS Proactive Notification Engine Bar */}
        <GlobalAIONotificationEngine
          userProfile={user}
          aiMemory={aiMemory}
          onNavigateTab={(tab) => {
            setActiveModalView('none');
            if (['dashboard', 'coach', 'jobs', 'business', 'profile'].includes(tab)) {
              setActiveTab(tab as TabType);
            } else if (tab === 'learning') {
              setActiveModalView('learning');
            } else if (tab === 'affiliates') {
              setActiveModalView('affiliates');
            } else if (tab === 'marketplace') {
              setActiveModalView('marketplace');
            }
          }}
          onOpenBrainDrawer={() => setShowBrainDrawer(true)}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-28 sm:pb-32 w-full flex-1 overflow-x-hidden">
          {activeModalView === 'community' && (
            <div>
              <button
                onClick={() => setActiveModalView('none')}
                className="mb-4 text-xs text-violet-400 font-semibold hover:underline"
              >
                Back to Dashboard
              </button>
              <CommunityView language={language} />
            </div>
          )}

          {activeModalView === 'learning' && (
            <div>
              <button
                onClick={() => setActiveModalView('none')}
                className="mb-4 text-xs text-violet-400 font-semibold hover:underline"
              >
                Back to Dashboard
              </button>
              <LearningCenterView
                language={language}
                onOpenIntegrations={() => setActiveModalView('integrations')}
              />
            </div>
          )}

          {activeModalView === 'affiliates' && (
            <div>
              <button
                onClick={() => setActiveModalView('none')}
                className="mb-4 text-xs text-violet-400 font-semibold hover:underline"
              >
                Back to Dashboard
              </button>
              <AffiliateMarketplaceView
                user={user}
                offers={affiliateOffers}
                onOfferAdded={handleOfferAdded}
                language={language}
                onOpenIntegrations={() => setActiveModalView('integrations')}
              />
            </div>
          )}

          {activeModalView === 'integrations' && (
            <div>
              <button
                onClick={() => setActiveModalView('none')}
                className="mb-4 text-xs text-violet-400 font-semibold hover:underline flex items-center gap-1"
              >
                ← Back to Dashboard
              </button>
              <IntegrationManagerView
                user={user}
                language={language}
              />
            </div>
          )}

          {activeModalView === 'readiness' && (
            <div>
              <button
                onClick={() => setActiveModalView('none')}
                className="mb-4 text-xs text-violet-400 font-semibold hover:underline flex items-center gap-1"
              >
                ← Back to Dashboard
              </button>
              <AIReadinessView
                user={user}
                language={language}
                onOpenProfile={() => {
                  setActiveModalView('none');
                  setActiveTab('profile');
                }}
                onNavigateTab={(tab) => {
                  setActiveModalView('none');
                  setActiveTab(tab);
                }}
              />
            </div>
          )}

          {activeModalView === 'ai-agent' && (
            <div>
              <button
                onClick={() => setActiveModalView('none')}
                className="mb-4 text-xs text-violet-400 font-semibold hover:underline flex items-center gap-1"
              >
                ← Back to Dashboard
              </button>
              {isUserSubscriptionActive(user) ? (
                <AIAgentAutopilotView
                  user={user}
                  language={language}
                  onNavigateTab={(tab) => {
                    setActiveModalView('none');
                    setActiveTab(tab);
                  }}
                  onClose={() => setActiveModalView('none')}
                />
              ) : (
                <div className="p-8 rounded-3xl bg-slate-900/90 border border-blue-500/30 text-center space-y-4 max-w-xl mx-auto my-12">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-blue-400 mx-auto">
                    <Lock className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">3-Day Free Trial Required</h3>
                  <p className="text-sm text-slate-300">
                    Users without an active trial or subscription cannot access Premium AI Autopilot. Attach your PayPal account to activate your 3-day free trial ($0.00 today). Cancel anytime.
                  </p>
                  <button
                    onClick={() => setActiveModalView('payments')}
                    className="px-6 py-3.5 rounded-2xl bg-[#FFC439] text-[#003087] font-black text-sm transition shadow-lg hover:bg-[#ffbb1a] flex items-center justify-center gap-2 mx-auto"
                  >
                    <span>Start 3-Day Free Trial (PayPal $0.00)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-slate-400">Secure payments powered by PayPal.</p>
                </div>
              )}
            </div>
          )}

          {activeModalView === 'ai-executive' && (
            <div>
              <button
                onClick={() => setActiveModalView('none')}
                className="mb-4 text-xs text-indigo-400 font-semibold hover:underline flex items-center gap-1"
              >
                ← Back to Dashboard
              </button>
              {isUserSubscriptionActive(user) ? (
                <AIExecutiveCommandCenterView
                  user={user}
                  language={language}
                  onNavigateTab={(tab) => {
                    setActiveModalView('none');
                    setActiveTab(tab);
                  }}
                  onClose={() => setActiveModalView('none')}
                />
              ) : (
                <div className="p-8 rounded-3xl bg-slate-900/90 border border-indigo-500/30 text-center space-y-4 max-w-xl mx-auto my-12">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-400/30 flex items-center justify-center text-indigo-400 mx-auto">
                    <Lock className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">3-Day Free Trial Required</h3>
                  <p className="text-sm text-slate-300">
                    Users without an active trial or subscription cannot access the AI Executive Command Center. Attach your PayPal account to activate your 3-day free trial ($0.00 today). Cancel anytime.
                  </p>
                  <button
                    onClick={() => setActiveModalView('payments')}
                    className="px-6 py-3.5 rounded-2xl bg-[#FFC439] text-[#003087] font-black text-sm transition shadow-lg hover:bg-[#ffbb1a] flex items-center justify-center gap-2 mx-auto"
                  >
                    <span>Start 3-Day Free Trial (PayPal $0.00)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-slate-400">Secure payments powered by PayPal.</p>
                </div>
              )}
            </div>
          )}

          {activeModalView === 'marketplace' && (
            <div>
              <button
                onClick={() => setActiveModalView('none')}
                className="mb-4 text-xs text-blue-400 font-semibold hover:underline flex items-center gap-1"
              >
                ← Back to Dashboard
              </button>
              <MarketplaceView
                user={user}
                language={language}
                onOpenPayments={(planOrProduct) => {
                  setPaymentPlanSelection(planOrProduct);
                  setActiveModalView('payments');
                }}
                onNavigateTab={(tab) => {
                  setActiveModalView('none');
                  setActiveTab(tab);
                }}
              />
            </div>
          )}

          {activeModalView === 'payments' && (
            <div>
              <button
                onClick={() => setActiveModalView('none')}
                className="mb-4 text-xs text-purple-400 font-semibold hover:underline flex items-center gap-1"
              >
                ← Back to Dashboard
              </button>
              <EnterprisePaymentsView
                user={user}
                language={language}
                initialPlan={paymentPlanSelection}
                onClose={() => setActiveModalView('none')}
                onSuccess={(updatedUser) => {
                  if (updatedUser) {
                    setUser((prev) => (prev ? { ...prev, ...updatedUser } : ({ ...updatedUser, uid: 'guest', fullName: 'Candidate', email: 'user@rynexo.com', country: '', city: '', language: 'en', skills: [] } as UserProfile)));
                  }
                  setActiveModalView('none');
                }}
              />
            </div>
          )}

          {activeModalView === 'admin' && (
            <div>
              <button
                onClick={() => setActiveModalView('none')}
                className="mb-4 text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1"
              >
                ← Back to Dashboard
              </button>
              <AdminDashboardView
                user={user}
                language={language}
                onClose={() => setActiveModalView('none')}
              />
            </div>
          )}

          {activeModalView === 'none' && (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  user={user}
                  language={language}
                  onNavigateTab={setActiveTab}
                  affiliateOffers={affiliateOffers}
                  onOpenCommunity={() => setActiveModalView('community')}
                  onOpenLearning={() => setActiveModalView('learning')}
                  onOpenAffiliateMarketplace={() => setActiveModalView('affiliates')}
                  onOpenReadinessReport={() => setActiveModalView('readiness')}
                  onOpenAIAgent={() => setActiveModalView('ai-agent')}
                  onOpenAIExecutive={() => setActiveModalView('ai-executive')}
                  onOpenMarketplace={() => setActiveModalView('marketplace')}
                  onOpenPayments={() => setActiveModalView('payments')}
                  onOpenAdmin={() => setActiveModalView('admin')}
                />
              )}

              {activeTab === 'coach' && (
                <AICoachView user={user} language={language} />
              )}

              {activeTab === 'jobs' && (
                <FindJobView user={user} language={language} />
              )}

              {activeTab === 'business' && (
                <StartBusinessView user={user} language={language} />
              )}

              {activeTab === 'profile' && (
                <ProfileView
                  user={user}
                  language={language}
                  onLanguageChange={handleLanguageChange}
                  onSignOut={handleSignOut}
                  onUpdateUser={(updated) => setUser(updated)}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Floating Interactive AI Assistant */}
      <FloatingAIAssistant user={user} language={language} />

      {/* Fixed Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        activeModalView={activeModalView}
        onTabChange={(tab) => {
          setActiveModalView('none');
          setActiveTab(tab);
        }}
        onOpenMarketplace={() => setActiveModalView('marketplace')}
        language={language}
      />

      {/* Registration / Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        language={language}
        onSuccess={handleAuthSuccess}
      />

      {/* Welcome Modal On Account Creation */}
      {user && (
        <WelcomeModal
          user={user}
          isOpen={showWelcomeModal}
          onProceedToDashboard={() => {
            setShowWelcomeModal(false);
            setActiveTab('dashboard');
          }}
          language={language}
        />
      )}

      {/* Central AI Brain Memory Drawer */}
      <AIBrainMemoryDrawer
        isOpen={showBrainDrawer}
        onClose={() => setShowBrainDrawer(false)}
        userProfile={user}
        aiMemory={aiMemory}
        activeLearningSignals={activeLearningSignals}
        onNavigateTab={(tab) => {
          setShowBrainDrawer(false);
          setActiveModalView('none');
          if (['dashboard', 'coach', 'jobs', 'business', 'profile'].includes(tab)) {
            setActiveTab(tab as TabType);
          } else if (tab === 'learning') {
            setActiveModalView('learning');
          } else if (tab === 'affiliates') {
            setActiveModalView('affiliates');
          } else if (tab === 'marketplace') {
            setActiveModalView('marketplace');
          }
        }}
      />
    </div>
  );
}
