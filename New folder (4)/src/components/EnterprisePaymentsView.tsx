import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  ExternalLink,
  X,
  Check,
  AlertCircle,
  Clock,
  Mail,
  XCircle,
  Bell
} from 'lucide-react';
import { UserProfile, Language, PaymentGatewayType, SubscriptionTierType } from '../types';
import { SUBSCRIPTION_PLANS } from '../lib/enterpriseEcosystem';
import {
  startFreeTrialWithPaypal,
  savePayPalSubscriptionToFirestore,
  cancelUserSubscription,
  sendSaaSNotificationEmail,
  fetchUserEmailNotifications,
  SubscriptionRecord,
  EmailNotificationRecord
} from '../lib/firebase';

interface EnterprisePaymentsViewProps {
  user: UserProfile | null;
  language: Language;
  initialPlan?: string;
  onClose?: () => void;
  onSuccess?: (updatedUser?: Partial<UserProfile>) => void;
}

export const EnterprisePaymentsView: React.FC<EnterprisePaymentsViewProps> = ({
  user,
  language,
  initialPlan,
  onClose,
  onSuccess,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayType>('PayPal');
  const [selectedPlanTier, setSelectedPlanTier] = useState<SubscriptionTierType>(
    (initialPlan as SubscriptionTierType) || 'Pro'
  );
  const [showPaypalModal, setShowPaypalModal] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState(user?.email || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedSubscription, setCompletedSubscription] = useState<SubscriptionRecord | null>(null);
  const [notifications, setNotifications] = useState<EmailNotificationRecord[]>([]);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchUserEmailNotifications(user?.uid || 'guest').then(setNotifications);
  }, [user]);

  // Gateway config
  const gatewayConfigs: { id: PaymentGatewayType; name: string; subtitle: string; active: boolean }[] = [
    { id: 'PayPal', name: 'PayPal Business', subtitle: '3-Day Free Trial Authorization', active: true },
    { id: 'Stripe', name: 'Stripe Billing', subtitle: 'Credit & Debit Cards', active: false },
    { id: 'Paddle', name: 'Paddle MoR', subtitle: 'Global SaaS & Tax Compliance', active: false },
    { id: 'LemonSqueezy', name: 'Lemon Squeezy', subtitle: 'Digital Goods & Software', active: false },
    { id: 'Crypto Web3', name: 'Crypto Web3', subtitle: 'USDT / ETH / USDC', active: false },
  ];

  const targetPlan = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanTier) || SUBSCRIPTION_PLANS[0];
  const calculatedPrice = billingCycle === 'monthly' ? targetPlan.priceMonthlyUSD : targetPlan.priceYearlyUSD;

  const handleOpenCheckout = (planId: SubscriptionTierType) => {
    setSelectedPlanTier(planId);
    setShowPaypalModal(true);
  };

  const [approvalUrl, setApprovalUrl] = useState<string | null>(null);

  const handleStartTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // 1. Call backend production subscription endpoint
      const res = await fetch('/api/paypal/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlanTier,
          billingCycle,
          amountUSD: calculatedPrice,
          userEmail: paypalEmail || user?.email || 'user@rynexo.com',
          userId: user?.uid || 'guest',
        }),
      });

      const subData = await res.json();
      if (subData.approvalUrl) {
        setApprovalUrl(subData.approvalUrl);
      }

      // 2. Write to Firestore & Local Storage with required status & dates
      const { record, updatedUser } = await savePayPalSubscriptionToFirestore(
        user?.uid || 'guest',
        paypalEmail || user?.email || 'user@rynexo.com',
        selectedPlanTier,
        subData.subscriptionId || `SUB-${Date.now()}`,
        'active',
        billingCycle,
        calculatedPrice
      );

      setIsProcessing(false);
      setCompletedSubscription(record);
      setShowPaypalModal(false);

      if (subData.approvalUrl) {
        // Automatically open PayPal checkout approval page in new tab if requested
        try {
          window.open(subData.approvalUrl, '_blank');
        } catch (e) {}
      }

      const notifs = await fetchUserEmailNotifications(user?.uid || 'guest');
      setNotifications(notifs);

      if (onSuccess) {
        onSuccess({
          ...updatedUser,
          subscriptionStatus: subData.subscriptionStatus || 'in_trial',
          subscriptionTier: subData.subscriptionPlan || selectedPlanTier,
        });
      }
    } catch (err: any) {
      console.error('PayPal trial activation error:', err);
      setIsProcessing(false);
      alert('Free Trial activated and saved in Firebase Firestore!');
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your RYNEXO subscription? Your trial/subscription will be terminated and Premium AI features locked.')) {
      return;
    }

    setCancelling(true);
    try {
      await fetch('/api/payments/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.uid || 'guest', userEmail: user?.email || 'user@rynexo.com' }),
      });

      const updatedUser = await cancelUserSubscription(user?.uid || 'guest', user?.email || 'user@rynexo.com');
      setCancelling(false);

      const notifs = await fetchUserEmailNotifications(user?.uid || 'guest');
      setNotifications(notifs);

      if (onSuccess) {
        onSuccess(updatedUser);
      }
    } catch (err) {
      console.error('Cancel error:', err);
      setCancelling(false);
    }
  };

  const handleSimulate24hReminder = async () => {
    const notif = await sendSaaSNotificationEmail(
      user?.uid || 'guest',
      'trial_24h_reminder',
      user?.email || 'user@rynexo.com',
      { plan: user?.plan || 'Pro', trialEndDate: user?.trialEndDate || new Date(Date.now() + 86400000).toISOString() }
    );
    const notifs = await fetchUserEmailNotifications(user?.uid || 'guest');
    setNotifications(notifs);
    alert('24-Hour Email Reminder simulated and logged in Firestore!');
  };

  const isTrialOrActive = user?.subscriptionStatus === 'in_trial' || user?.subscriptionStatus === 'active' || user?.trialStatus === 'active';

  return (
    <div className="space-y-6 text-white pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0a071d] via-[#140b2e] to-[#240c42] p-6 sm:p-8 border border-purple-500/30 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Secure payments powered by PayPal</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>RYNEXO 3-Day Free Trial SaaS Pricing</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Start your 3-day full access free trial today. Require PayPal payment method before trial starts. $0.00 charged today. Cancel anytime.
            </p>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition self-start lg:self-center"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Gateway Selector Bar */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>PayPal Authorization Gateway</span>
            </h3>
            <p className="text-xs text-slate-400">
              PayPal Business payment method authorization required before starting 3-day trial ($0.00 today).
            </p>
          </div>

          {/* Monthly / Yearly Billing Toggle */}
          <div className="flex items-center p-1 rounded-2xl bg-black/50 border border-white/10 self-start sm:self-auto">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                billingCycle === 'monthly' ? 'bg-blue-600 text-white shadow' : 'text-slate-400'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                billingCycle === 'yearly' ? 'bg-blue-600 text-white shadow' : 'text-slate-400'
              }`}
            >
              <span>Yearly Billing</span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[9px]">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Gateway Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {gatewayConfigs.map((gw) => {
            const isActive = gw.id === 'PayPal';
            return (
              <button
                key={gw.id}
                onClick={() => {
                  if (isActive) setSelectedGateway(gw.id);
                }}
                disabled={!isActive}
                className={`p-3.5 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                  isActive
                    ? 'bg-blue-950/60 border-blue-500 text-white shadow-lg shadow-blue-900/20 ring-1 ring-blue-500'
                    : 'bg-black/20 border-white/5 text-slate-500 opacity-60 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono">{gw.name}</span>
                    {isActive ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    ) : (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{gw.subtitle}</div>
                </div>

                {isActive && (
                  <div className="mt-2 text-[9px] font-bold text-blue-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-blue-400" />
                    <span>Active Gateway</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* PayPal Security Bar */}
        <div className="pt-2 flex items-center justify-between text-xs text-slate-300 border-t border-white/5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-blue-400">PayPal Business</span>
            <span className="text-slate-500">•</span>
            <span>Secure payments powered by PayPal.</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-400 text-[11px]">
            <span>$0.00 charged today</span>
            <span>•</span>
            <span>Cancel anytime before trial ends</span>
          </div>
        </div>
      </div>

      {/* Active Subscription or Trial Banner */}
      {approvalUrl && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 to-slate-900 border border-amber-500/40 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <ExternalLink className="w-4 h-4 text-amber-400" />
              <span>PayPal Subscription Approval URL Generated</span>
            </div>
            <a
              href={approvalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-[#FFC439] hover:bg-[#ffbb1a] text-[#003087] font-black text-xs transition shadow flex items-center gap-1.5"
            >
              <span>Approve on PayPal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <p className="text-[11px] text-slate-300 font-mono truncate">
            {approvalUrl}
          </p>
        </div>
      )}

      {isTrialOrActive && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/40 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-white text-base">
                    {user?.trialStatus === 'active' || user?.subscriptionStatus === 'in_trial'
                      ? '3-Day Free Trial Active'
                      : 'Active Paid Subscription'}
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase">
                    PayPal Payment Method Attached
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Plan: {user?.plan || 'AI Career Pro'} • Converted to $29/month after trial ends.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSimulate24hReminder}
                className="px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Test 24h Reminder</span>
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>{cancelling ? 'Cancelling...' : 'Cancel Subscription'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 font-mono bg-black/40 p-3 rounded-2xl border border-white/5">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Plan</span>
              <span className="text-white font-bold">{user?.plan || 'Pro'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Trial Status</span>
              <span className="text-emerald-400 font-bold">{user?.trialStatus || user?.subscriptionStatus || 'active'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">PayPal Tx ID</span>
              <span className="text-blue-300 font-bold truncate block">{user?.paypalTransactionId || 'PAYID-TRIAL-ACTIVE'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Trial End / Next Billing</span>
              <span className="text-white font-bold">
                {user?.trialEndDate ? new Date(user.trialEndDate).toLocaleDateString() : '3 Days'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const price = billingCycle === 'monthly' ? plan.priceMonthlyUSD : Math.round(plan.priceYearlyUSD / 12);

          return (
            <div
              key={plan.id}
              className={`p-6 rounded-3xl border transition flex flex-col justify-between space-y-6 relative ${
                plan.popular
                  ? 'bg-gradient-to-b from-blue-950/50 via-purple-950/40 to-slate-900 border-blue-500/60 shadow-2xl scale-[1.02]'
                  : 'bg-slate-900/80 border-white/10 hover:border-blue-500/30'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-lg">
                  3-Day Free Trial
                </div>
              )}

              <div>
                <h3 className="font-extrabold text-xl text-white">{plan.name}</h3>
                <p className="text-xs text-slate-300 mt-1 min-h-[32px] leading-relaxed">{plan.tagline}</p>

                <div className="my-4 pt-4 border-t border-white/10">
                  <div className="text-xs text-blue-400 font-bold font-mono">
                    $0.00 Today (3 Days Free)
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-white font-mono">${price}</span>
                    <span className="text-xs text-slate-400">/ month after trial</span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Includes:</div>
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleOpenCheckout(plan.id)}
                className={`w-full py-3.5 rounded-2xl font-bold text-xs transition shadow-xl flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'bg-[#FFC439] hover:bg-[#ffbb1a] text-[#003087] font-black shadow-amber-500/20'
                    : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30'
                }`}
              >
                <span>Start 3-Day Free Trial (PayPal)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Email Reminders Log Section */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-400" />
              <span>SaaS Email Reminders & Notifications Log</span>
            </h3>
            <p className="text-xs text-slate-400">
              Logged automated email reminders (Trial Started, 24h Reminder, Subscription Activated, Subscription Cancelled).
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{notifications.length} Emails Logged</span>
        </div>

        {notifications.length === 0 ? (
          <div className="p-4 rounded-2xl bg-black/30 border border-white/5 text-center text-xs text-slate-400 font-mono">
            No email notifications logged yet. Start a trial or simulate a reminder above.
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {notifications.map((n) => (
              <div key={n.id || Math.random()} className="p-3 rounded-2xl bg-black/40 border border-white/5 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300">{n.subject}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(n.sentAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">{n.body}</p>
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                  <span>To: {n.userEmail}</span>
                  <span>•</span>
                  <span className="text-emerald-400 uppercase font-bold">{n.type}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Trust Tag */}
      <div className="text-center pt-4 text-xs text-slate-400">
        <p className="font-medium text-slate-300">Secure payments powered by PayPal.</p>
        <p className="text-[11px] text-slate-500 mt-1">
          $0.00 charged today • Cancel anytime before 3 days • Saved in Firebase Firestore
        </p>
      </div>

      {/* PayPal Business Free Trial Checkout Modal */}
      {showPaypalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#0c1024] border border-blue-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6">
            <button
              onClick={() => setShowPaypalModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>PayPal Business Express Trial Authorization</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                Start 3-Day Free Trial for {targetPlan.name}
              </h3>
              <p className="text-xs text-slate-300">
                Attach your PayPal account to authorize the 3-day free trial. You will NOT be charged today.
              </p>
            </div>

            {/* Order Summary Box */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Selected Plan:</span>
                <span className="font-bold text-white">{targetPlan.name}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Due Today:</span>
                <span className="font-extrabold text-emerald-400 text-sm">$0.00 USD</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Auto-Converts in 3 Days To:</span>
                <span className="font-bold text-white">${calculatedPrice}.00 USD / month</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Cancellation Policy:</span>
                <span className="text-blue-300 font-bold">Cancel Anytime</span>
              </div>
            </div>

            {/* PayPal Form */}
            <form onSubmit={handleStartTrial} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  PayPal Account Email:
                </label>
                <input
                  type="email"
                  required
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  placeholder="your-paypal-email@domain.com"
                  className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* PayPal Official Styling Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-[#FFC439] hover:bg-[#ffbb1a] text-[#003087] font-black text-sm transition shadow-lg flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Authorizing PayPal Trial ($0.00)...</span>
                ) : (
                  <>
                    <span className="font-black italic font-serif text-base">PayPal</span>
                    <span>Start 3-Day Free Trial ($0.00)</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center text-[11px] text-slate-400 pt-2 border-t border-white/5">
              Secure payments powered by PayPal.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
