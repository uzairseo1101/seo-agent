'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, X, ShieldCheck, ArrowRight, ChevronDown, HelpCircle, AlertCircle, Sparkles } from 'lucide-react';
import { PRICING_CONFIG } from '@/lib/pricing-config';
import { BreadcrumbsJsonLd, FaqJsonLd } from '@/components/seo/json-ld';

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const pricingFaqs = [
    {
      q: 'Can I start using RankPilot AI completely for free?',
      a: 'Yes. Our Free plan gives you 1 monitored website, up to 10 crawled pages per audit, and complete SEO, GEO and AEO health scores with zero credit card required.',
    },
    {
      q: 'How do audit credits and page crawl limits work?',
      a: 'Crawl limits determine how many unique internal pages our crawler analyzes per audit run. For example, Freelancer crawls up to 25 pages, Agency crawls up to 100 pages, and Team crawls up to 500 pages per domain pass.',
    },
    {
      q: 'How much do I save with annual billing?',
      a: 'Annual billing gives you 12 months for the price of 10 months (approximately 17% savings). Freelancer saves $78/year, Agency saves $198/year, and Team saves $298/year.',
    },
    {
      q: 'Which payment methods are accepted internationally?',
      a: 'Through our secure global Merchant of Record billing, we accept all major international credit and debit cards (Visa, Mastercard, American Express), Apple Pay, and Google Pay from 135+ countries.',
    },
    {
      q: 'Are client reports truly white-label for agencies?',
      a: 'Yes. On the Agency and Team tiers, you can export branded executive PDF client reports with your own agency name, logo, custom findings, and verification proof.',
    },
    {
      q: 'Can I change plans or cancel at any time?',
      a: 'Yes. You can upgrade, downgrade, or cancel your subscription at any time with a single click in your account settings. There are no lock-in contracts.',
    },
  ];

  return (
    <div className="py-12 sm:py-20 max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <BreadcrumbsJsonLd
        items={[
          { name: 'Home', url: 'https://seoagent.uzairseo.com' },
          { name: 'Pricing', url: 'https://seoagent.uzairseo.com/pricing' },
        ]}
      />
      <FaqJsonLd faqs={pricingFaqs} />

      {/* 1. Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
          Transparent & Predictable
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold font-head text-text tracking-tight leading-[1.15]">
          Simple pricing for freelancers, agencies and teams
        </h1>
        <p className="text-sm sm:text-base text-muted leading-relaxed">
          From solo SEO consultants to high-scale digital marketing agencies. Select the plan that matches your client portfolio.
        </p>

        {/* Monthly / Annual Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3 text-xs font-medium">
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

      {/* 2. Four Plan Cards (Free, Freelancer, Agency, Team) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {PRICING_CONFIG.tiers.map((tier) => {
          const displayPrice = isAnnual ? tier.annualMonthlyEquivalent : tier.monthlyPrice;
          return (
            <div
              key={tier.id}
              className={`bg-card rounded-xl p-6 shadow-card flex flex-col justify-between relative transition-all ${
                tier.popular
                  ? 'border-2 border-primary shadow-pop'
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
                    <span className="text-3xl sm:text-4xl font-bold font-mono text-text tnum">
                      ${displayPrice === 0 ? '0' : displayPrice.toFixed(displayPrice % 1 === 0 ? 0 : 2)}
                    </span>
                    <span className="text-xs text-muted font-mono">/ month</span>
                  </div>

                  {tier.id !== 'free' && isAnnual && (
                    <div className="mt-1 space-y-0.5">
                      <span className="text-[11px] font-mono text-primary block font-medium">
                        Billed annually (${tier.annualPrice}/year)
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 block">
                        Save ${tier.annualSavings}/year
                      </span>
                    </div>
                  )}

                  {tier.id !== 'free' && !isAnnual && (
                    <span className="text-[11px] font-mono text-muted block mt-1">
                      Billed monthly (${tier.monthlyPrice}/month)
                    </span>
                  )}

                  {tier.id === 'free' && (
                    <span className="text-[11px] font-mono text-muted block mt-1">
                      Free forever, no credit card
                    </span>
                  )}

                  <p className="mt-3 text-xs text-muted leading-relaxed min-h-[36px]">
                    {tier.tagline}
                  </p>
                </div>

                <div className="pt-3 border-t border-border">
                  <span className="text-[11px] font-semibold text-text uppercase tracking-wider block mb-3 font-head">
                    Included capabilities:
                  </span>
                  <ul className="space-y-2.5 text-xs text-muted">
                    {tier.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="text-text">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                <Link
                  href={`${tier.ctaHref}${isAnnual ? '&billing=annual' : '&billing=monthly'}`}
                  className={`w-full h-10 flex items-center justify-center rounded-md text-xs font-medium transition-colors ${
                    tier.primaryCta
                      ? 'bg-primary hover:bg-primary-hover text-white shadow-xs font-semibold'
                      : 'border border-border bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-text shadow-xs'
                  }`}
                >
                  {tier.ctaText}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Reassurance Banner */}
      <div className="p-4 rounded-lg bg-card border border-border text-xs text-muted flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <span>
            <strong>Predictable SaaS Billing:</strong> All plans include automated SSRF protection, clean exports, and zero unexpected overage charges.
          </span>
        </div>
        <span className="font-mono text-[11px] text-muted">
          Last updated: {PRICING_CONFIG.lastUpdated}
        </span>
      </div>

      {/* 4. Full Feature Comparison Table */}
      <div className="space-y-6 pt-4">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl font-bold font-head text-text">
            Compare all features across plans
          </h2>
          <p className="text-xs text-muted">
            Detailed breakdown of crawling allowances, keyword intelligence, and agency deliverables.
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border shadow-card overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="sticky top-16 z-10 bg-slate-50 dark:bg-slate-800/90 border-b border-border">
              <tr className="h-12 text-[11px] font-mono text-muted uppercase">
                <th className="py-3 px-4 font-semibold w-1/4">Capability</th>
                <th className="py-3 px-3 font-semibold text-center">Free</th>
                <th className="py-3 px-3 font-semibold text-center">Freelancer</th>
                <th className="py-3 px-3 font-semibold text-center text-primary">Agency (Popular)</th>
                <th className="py-3 px-3 font-semibold text-center">Team</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-sans">
              {PRICING_CONFIG.comparisonRows.map((row, rIdx) => (
                <tr key={rIdx} className="h-11 hover:bg-bg/60 transition-colors">
                  <td className="py-2 px-4 font-medium text-text">
                    {row.feature}
                  </td>
                  <td className="py-2 px-3 text-center font-mono text-muted">
                    {typeof row.free === 'boolean' ? (
                      row.free ? (
                        <Check className="w-4 h-4 text-primary mx-auto" />
                      ) : (
                        <span className="text-muted/40 font-bold">—</span>
                      )
                    ) : (
                      row.free
                    )}
                  </td>
                  <td className="py-2 px-3 text-center font-mono text-muted">
                    {typeof row.freelancer === 'boolean' ? (
                      row.freelancer ? (
                        <Check className="w-4 h-4 text-primary mx-auto" />
                      ) : (
                        <span className="text-muted/40 font-bold">—</span>
                      )
                    ) : (
                      row.freelancer
                    )}
                  </td>
                  <td className="py-2 px-3 text-center font-mono font-medium text-text bg-primary-tint/20">
                    {typeof row.agency === 'boolean' ? (
                      row.agency ? (
                        <Check className="w-4 h-4 text-primary mx-auto" />
                      ) : (
                        <span className="text-muted/40 font-bold">—</span>
                      )
                    ) : (
                      row.agency
                    )}
                  </td>
                  <td className="py-2 px-3 text-center font-mono text-muted">
                    {typeof row.team === 'boolean' ? (
                      row.team ? (
                        <Check className="w-4 h-4 text-primary mx-auto" />
                      ) : (
                        <span className="text-muted/40 font-bold">—</span>
                      )
                    ) : (
                      row.team
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Pricing FAQs */}
      <div className="space-y-6 pt-8 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold font-head text-text">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-3">
          {pricingFaqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-card rounded-lg border border-border p-4 shadow-card cursor-pointer transition-all"
                onClick={() => setOpenFaq(isOpen ? null : idx)}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-semibold text-text font-head">
                    {faq.q}
                  </h3>
                  <ChevronDown
                    className={`w-4 h-4 text-muted transition-transform shrink-0 ${
                      isOpen ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </div>
                {isOpen && (
                  <p className="mt-2.5 text-xs text-muted leading-relaxed animate-in fade-in pt-2 border-t border-border">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
