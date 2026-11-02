'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PRICING_CONFIG, PlanId } from '@/lib/pricing-config';
import {
  Check,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Compass,
  CreditCard,
  Lock,
  Loader2,
  X,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

function PlanSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlan = (searchParams.get('plan') as PlanId) || 'agency';
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>(initialPlan);
  const [isAnnual, setIsAnnual] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const selectedTier = PRICING_CONFIG.tiers.find((t) => t.id === selectedPlanId) || PRICING_CONFIG.tiers[1];

  const handlePlanClick = async (planId: PlanId) => {
    setSelectedPlanId(planId);
    if (planId === 'free') {
      // Free plan requires no checkout modal - instant activation
      await activateSubscription('free', 'monthly');
    } else {
      // Paid plan requires explicit confirmation & checkout review
      setShowCheckoutModal(true);
    }
  };

  const activateSubscription = async (plan: PlanId, cycle: 'monthly' | 'annual') => {
    setIsLoading(true);
    setCheckoutError('');

    try {
      const { data: { session } } = (await supabase?.auth.getSession()) || { data: { session: null } };
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          plan,
          billingCycle: cycle,
          provider: plan === 'free' ? 'free' : 'manual',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to activate plan subscription.');
      }

      setCheckoutSuccess(true);
      setTimeout(() => {
        router.push('/onboarding');
      }, 1200);
    } catch (err: any) {
      setCheckoutError(err.message || 'Subscription activation error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header / Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center text-white shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <span className="font-head font-bold text-2xl text-text tracking-tight">
              RankPilot <span className="text-primary font-semibold">AI</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold font-head text-text tracking-tight">
            Select your SEO workspace plan
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-xl mx-auto">
            Choose a package to configure your website crawler allowances, keyword intelligence suite, and reporting permissions.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="pt-2 flex items-center justify-center gap-3 text-xs font-medium">
            <span className={!isAnnual ? 'text-text font-bold' : 'text-muted'}>Monthly billing</span>
            <button
              type="button"
              role="switch"
              aria-checked={isAnnual}
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-12 h-6 rounded-full bg-slate-200 dark:bg-slate-700 p-0.5 transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white dark:bg-slate-900 shadow-xs transition-transform ${
                  isAnnual ? 'translate-x-6 bg-primary' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={isAnnual ? 'text-text font-bold flex items-center gap-1.5' : 'text-muted flex items-center gap-1.5'}>
              <span>Annual billing</span>
              <span className="text-[10px] font-mono font-bold text-primary bg-primary-tint border border-emerald-200 px-2 py-0.5 rounded-full">
                Save ~17% (2 months free)
              </span>
            </span>
          </div>
        </div>

        {/* 4 Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {PRICING_CONFIG.tiers.map((tier) => {
            const displayPrice = isAnnual ? tier.annualMonthlyEquivalent : tier.monthlyPrice;
            const isSelected = selectedPlanId === tier.id;

            return (
              <div
                key={tier.id}
                className={`bg-card rounded-xl p-6 shadow-card flex flex-col justify-between relative transition-all ${
                  tier.popular
                    ? 'border-2 border-primary shadow-pop'
                    : isSelected
                    ? 'border-2 border-slate-400 dark:border-slate-500'
                    : 'border border-border hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {tier.popular && tier.badge && (
                  <div className="absolute -top-3 right-6 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    {tier.badge}
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <span className={`text-xs font-bold uppercase tracking-wider font-head ${
                      tier.popular ? 'text-primary' : 'text-muted'
                    }`}>
                      {tier.name}
                    </span>

                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-bold font-mono text-text tnum">
                        ${displayPrice === 0 ? '0' : displayPrice.toFixed(displayPrice % 1 === 0 ? 0 : 2)}
                      </span>
                      <span className="text-xs text-muted font-mono">/ month</span>
                    </div>

                    {tier.id !== 'free' && isAnnual && (
                      <div className="mt-1 space-y-0.5">
                        <span className="text-[11px] font-mono text-primary block font-medium">
                          Billed annually (${tier.annualPrice}/yr)
                        </span>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 block">
                          Save ${tier.annualSavings}/year
                        </span>
                      </div>
                    )}

                    {tier.id !== 'free' && !isAnnual && (
                      <span className="text-[11px] font-mono text-muted block mt-1">
                        Billed monthly (${tier.monthlyPrice}/mo)
                      </span>
                    )}

                    {tier.id === 'free' && (
                      <span className="text-[11px] font-mono text-muted block mt-1">
                        Free tier, no card required
                      </span>
                    )}

                    <p className="mt-2.5 text-xs text-muted leading-relaxed min-h-[36px]">
                      {tier.tagline}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border">
                    <span className="text-[11px] font-semibold text-text uppercase tracking-wider block mb-2.5 font-head">
                      Key limits & capabilities:
                    </span>
                    <ul className="space-y-2 text-xs text-muted">
                      {tier.features.slice(0, 6).map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span className="text-text">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handlePlanClick(tier.id)}
                    className={`w-full h-10 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs ${
                      tier.primaryCta
                        ? 'bg-primary hover:bg-primary-hover text-white'
                        : tier.id === 'free'
                        ? 'bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-text border border-border'
                        : 'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20'
                    }`}
                  >
                    {isLoading && selectedPlanId === tier.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>{tier.id === 'free' ? 'Activate Free' : `Choose ${tier.name}`}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Reassurance */}
        <div className="p-4 rounded-lg bg-card border border-border text-xs text-muted flex items-center justify-between shadow-xs max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <span>
              All plans include SSL data encryption, safe server-side rate limits, and zero locked contracts.
            </span>
          </div>
          <span className="text-[11px] font-mono text-muted">
            Bank-Grade Security
          </span>
        </div>
      </div>

      {/* Checkout / Subscription Confirmation Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-pop p-6 space-y-5 relative">
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute right-4 top-4 text-muted hover:text-text p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-primary">
              <CreditCard className="w-5 h-5" />
              <h3 className="font-head font-bold text-base text-text">
                Confirm Subscription Checkout
              </h3>
            </div>

            {checkoutError && (
              <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-error flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{checkoutError}</span>
              </div>
            )}

            {checkoutSuccess ? (
              <div className="text-center py-6 space-y-2 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-primary-tint text-primary mx-auto flex items-center justify-center border border-emerald-200">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-head font-bold text-base text-text">Plan Activated!</h4>
                <p className="text-xs text-muted">Redirecting you to complete your agency profile...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-bg border border-border space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-text">{selectedTier.name} Plan</span>
                    <span className="font-mono font-bold text-text">
                      ${isAnnual ? selectedTier.annualPrice : selectedTier.monthlyPrice}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-muted">
                    <span>Billing Interval</span>
                    <span className="capitalize">{isAnnual ? 'Annual (12 Months)' : 'Monthly'}</span>
                  </div>
                  {isAnnual && (
                    <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-medium pt-1 border-t border-border/50">
                      <span>Annual Discount (~17%)</span>
                      <span>-${selectedTier.annualSavings}/year</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-text font-bold pt-2 border-t border-border">
                    <span>Total Due Today</span>
                    <span className="font-mono text-sm text-primary">
                      ${isAnnual ? selectedTier.annualPrice : selectedTier.monthlyPrice}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-md bg-primary-tint/40 border border-emerald-200/50 text-[11px] text-muted space-y-1">
                  <div className="flex items-center gap-1.5 font-medium text-text">
                    <Lock className="w-3 h-3 text-primary" />
                    <span>Global Merchant of Record Checkout</span>
                  </div>
                  <p>
                    International credit cards, Apple Pay, and Google Pay supported. Automatic sales tax/VAT compliance.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => activateSubscription(selectedPlanId, isAnnual ? 'annual' : 'monthly')}
                    className="w-full h-11 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Confirm & Activate {selectedTier.name} (${isAnnual ? selectedTier.annualPrice : selectedTier.monthlyPrice})</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCheckoutModal(false)}
                    className="w-full h-9 text-xs text-muted hover:text-text"
                  >
                    Choose a different plan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlanSelectionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <PlanSelectionContent />
    </Suspense>
  );
}
