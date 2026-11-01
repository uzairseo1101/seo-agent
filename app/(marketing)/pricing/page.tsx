'use client';

import React from 'react';
import Link from 'next/link';
import { Check, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="py-16 sm:py-24 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">Fair & Transparent Plans</span>
        <h1 className="text-3xl sm:text-[48px] font-bold font-head text-text tracking-tight leading-[1.15]">
          Predictable Agency Pricing
        </h1>
        <p className="text-base text-muted leading-relaxed">
          Currently in MVP validation mode. All agency accounts receive complimentary access to test live workflows with zero credit card requirements.
        </p>
      </div>

      {/* Validation Mode Notice */}
      <div className="p-4 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">MVP Validation Notice</p>
          <p className="mt-0.5 text-muted dark:text-amber-300/80">
            During our initial rollout, no payments are collected and no credit cards are charged. Below tiers represent our commercial pricing for pilot agency validation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Freelancer */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-card flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider font-head">Freelancer</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold font-mono text-text">$0</span>
              <span className="text-xs text-muted">/ pilot</span>
            </div>
            <p className="text-xs text-muted">For independent SEO consultants managing individual client websites</p>

            <ul className="space-y-2.5 text-xs text-muted pt-2">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> Up to 3 Monitored Websites</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> 25 Crawled Pages per Audit Run</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> SEO, GEO & AEO Health Scores</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> Search Console OAuth Sync</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> SEO Action Center & Verification</li>
            </ul>
          </div>

          <Link
            href="/register"
            className="w-full h-10 flex items-center justify-center rounded-md border border-border bg-card hover:bg-slate-50 text-text font-medium text-xs transition-colors"
          >
            Start Free Solo Pilot
          </Link>
        </div>

        {/* Agency (Featured - Single Primary CTA) */}
        <div className="bg-card rounded-lg border-2 border-primary p-6 shadow-card flex flex-col justify-between space-y-6 relative">
          <div className="absolute -top-3 right-6 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
            Recommended
          </div>

          <div className="space-y-4">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider font-head">Agency</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold font-mono text-text">$79</span>
              <span className="text-xs text-muted">/ month</span>
            </div>
            <p className="text-xs text-muted">For digital marketing agencies managing multiple client campaigns</p>

            <ul className="space-y-2.5 text-xs text-muted pt-2">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> Up to 15 Monitored Websites</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> 100 Crawled Pages per Audit Run</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> Full SEO, GEO & AEO Health Suite</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> GSC Opportunity Finder & Drops</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> Action Center with Re-Audit Verification</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> Agency-Ready Executive Reports</li>
            </ul>
          </div>

          <Link
            href="/register"
            className="w-full h-10 flex items-center justify-center rounded-md bg-primary hover:bg-primary-hover text-white font-medium text-xs shadow-xs transition-colors"
          >
            Launch Agency Plan
          </Link>
        </div>

        {/* Team */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-card flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider font-head">Team & Enterprise</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold font-mono text-text">$149</span>
              <span className="text-xs text-muted">/ month</span>
            </div>
            <p className="text-xs text-muted">For expanding agencies needing high crawl quotas and multi-user seats</p>

            <ul className="space-y-2.5 text-xs text-muted pt-2">
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> 50 Monitored Websites</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> Dedicated Account Manager</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> Custom Client Subdomains</li>
              <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> Priority Gemini Analysis Engine</li>
            </ul>
          </div>

          <Link
            href="/register"
            className="w-full h-10 flex items-center justify-center rounded-md border border-border bg-card hover:bg-slate-50 text-text font-medium text-xs transition-colors"
          >
            Contact Sales
          </Link>
        </div>
      </div>
    </div>
  );
}
