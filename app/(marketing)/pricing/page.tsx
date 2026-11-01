'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, X, ShieldCheck, ArrowRight, ChevronDown, HelpCircle, AlertCircle } from 'lucide-react';
import { PRICING_CONFIG } from '@/lib/pricing-config';
import { BreadcrumbsJsonLd, FaqJsonLd } from '@/components/seo/json-ld';

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const pricingFaqs = [
    {
      q: 'Can I try RankPilot AI for free?',
      a: 'Yes. You can start with our free starter tier to audit your website, inspect technical health scores, and connect Google Search Console with no credit card required.',
    },
    {
      q: 'How do audit credits and page crawl limits work?',
      a: 'Crawl limits determine how many unique internal pages our crawler analyzes per audit run. For example, the Agency tier crawls up to 100 pages per domain pass, checking metadata, speed, schemas, and links on every page.',
    },
    {
      q: 'Can I switch between plans at any time?',
      a: 'Yes. You can upgrade, downgrade, or switch between monthly and annual billing cycles whenever your agency needs change. Upgrades take effect immediately with pro-rated billing.',
    },
    {
      q: 'Are client reports truly white-label for agencies?',
      a: 'Yes. On the Agency and Team tiers, you can upload your agency logo, customize primary accent colors, and remove all RankPilot AI branding from generated PDF reports and client-facing summaries.',
    },
    {
      q: 'What is the cancellation and refund policy?',
      a: '[confirm policy] You can cancel your subscription at any time directly from your billing settings. We offer a 14-day money-back satisfaction guarantee on all first-time agency plans if you are unsatisfied with our automated verification.',
    },
    {
      q: 'Which payment methods are accepted?',
      a: 'We accept all major credit and debit cards (Visa, Mastercard, American Express). Enterprise team invoices with wire transfers are available upon request.',
    },
  ];

  return (
    <div className="py-12 sm:py-20 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <BreadcrumbsJsonLd
        items={[
          { name: 'Home', url: 'https://rankpilot.ai' },
          { name: 'Pricing', url: 'https://rankpilot.ai/pricing' },
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
          No hidden fees, no per-keyword gouging. Choose the right plan to scale your agency's SEO operations.
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
            <span className="text-[10px] font-mono font-bold text-primary bg-primary-tint border border-emerald-200/80 px-2 py-0.5 rounded-full">
              Save {PRICING_CONFIG.annualDiscountPercentage}% [confirm]
            </span>
          </span>
        </div>
      </div>

      {/* 2. Three Plan Cards (Driven by PRICING_CONFIG) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {PRICING_CONFIG.tiers.map((tier) => {
          const price = isAnnual ? tier.annualMonthlyPrice : tier.monthlyPrice;
          return (
            <div
              key={tier.id}
              className={`bg-card rounded-lg p-6 sm:p-7 shadow-card flex flex-col justify-between relative transition-all ${
                tier.popular
                  ? 'border-2 border-primary shadow-pop'
                  : 'border border-border'
              }`}
            >
              {tier.popular && tier.badge && (
                <div className="absolute -top-3 right-6 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
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
                    <span className="text-4xl font-bold font-mono text-text tnum">
                      ${price}
                    </span>
                    <span className="text-xs text-muted font-mono">/ month</span>
                  </div>
                  {isAnnual && (
                    <span className="text-[11px] font-mono text-primary block mt-0.5">
                      Billed annually (${price * 12}/yr)
                    </span>
                  )}
                  <p className="mt-2 text-xs text-muted leading-relaxed">
                    {tier.tagline}
                  </p>
                </div>

                <div className="pt-2 border-t border-border">
                  <span className="text-[11px] font-semibold text-text uppercase tracking-wider block mb-3 font-head">
                    What is included:
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

              {/* Single Primary Button rule: only Agency card has primary CTA */}
              <div className="pt-6">
                <Link
                  href={tier.ctaHref}
                  className={`w-full h-10 flex items-center justify-center rounded-md text-xs font-medium transition-colors ${
                    tier.primaryCta
                      ? 'bg-primary hover:bg-primary-hover text-white shadow-xs'
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

      {/* 3. Cancel-anytime / refund note */}
      <div className="p-4 rounded-md bg-card border border-border text-xs text-muted flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <span>
            <strong>Zero risk commitment:</strong> Cancel anytime with one click. 14-day refund policy [confirm policy].
          </span>
        </div>
        <span className="font-mono text-[11px] text-muted">
          Last updated: {PRICING_CONFIG.lastUpdated}
        </span>
      </div>

      {/* 4. Full Feature Comparison Table with Sticky Header */}
      <div className="space-y-6 pt-4">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl font-bold font-head text-text">
            Compare all features across plans
          </h2>
          <p className="text-xs text-muted">
            Detailed breakdown of crawling quotas, keyword intelligence, and agency deliverables.
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border shadow-card overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            {/* Sticky Table Header */}
            <thead className="sticky top-16 z-10 bg-slate-50 dark:bg-slate-800/90 border-b border-border">
              <tr className="h-12 text-[11px] font-mono text-muted uppercase">
                <th className="py-3 px-4 font-semibold w-1/3">Capability</th>
                <th className="py-3 px-4 font-semibold text-center">Freelancer</th>
                <th className="py-3 px-4 font-semibold text-center text-primary">Agency (Popular)</th>
                <th className="py-3 px-4 font-semibold text-center">Team</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-sans">
              {PRICING_CONFIG.comparisonRows.map((row, rIdx) => (
                <tr key={rIdx} className="h-12 hover:bg-bg/60 transition-colors">
                  <td className="py-2.5 px-4 font-medium text-text">
                    {row.feature}
                  </td>
                  <td className="py-2.5 px-4 text-center font-mono text-muted">
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
                  <td className="py-2.5 px-4 text-center font-mono font-medium text-text bg-primary-tint/20">
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
                  <td className="py-2.5 px-4 text-center font-mono text-muted">
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

      {/* 5. Pricing FAQ (6 Questions) */}
      <div className="space-y-6 pt-8 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold font-head text-text">
            Pricing questions & answers
          </h2>
        </div>

        <div className="space-y-3">
          {pricingFaqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-card rounded-md border border-border shadow-xs overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 text-sm font-semibold font-head text-text hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-muted leading-relaxed border-t border-border pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Final CTA */}
      <div className="bg-card rounded-lg border border-border p-8 sm:p-12 text-center space-y-6 shadow-pop">
        <div className="max-w-xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold font-head text-text">
            Ready to automate your agency's SEO workflows?
          </h2>
          <p className="text-xs sm:text-sm text-muted">
            Start with the free pilot today or choose an agency plan for high-volume client delivery.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 h-10 px-6 bg-primary hover:bg-primary-hover text-white text-xs font-medium rounded-md shadow-xs transition-colors"
          >
            Start free
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
