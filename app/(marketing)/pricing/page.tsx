import React from 'react';
import Link from 'next/link';
import { Check, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Fair & Transparent Plans</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-navy tracking-tight">
          Simple, Predictable Agency Pricing
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-surface-muted leading-relaxed">
          Currently in MVP validation mode. All agency accounts receive complimentary access to test live workflows with zero credit card requirements.
        </p>
      </div>

      {/* Validation Mode Notice */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">MVP Beta & Validation Notice</p>
          <p className="mt-0.5">
            During our zero-budget initial rollout, no payments are collected and no credit cards are charged. Below tiers represent our planned commercial pricing hypotheses for agency validation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Solo Plan */}
        <div className="bg-white rounded-2xl border border-surface-border p-8 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-surface-muted">Consultant / Solo</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-navy">$29</span>
                <span className="text-xs text-surface-muted">/ month (Planned)</span>
              </div>
              <p className="text-xs text-surface-muted mt-1">For independent SEO consultants managing individual clients</p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Up to 3 Monitored Websites</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> 25 Crawled Pages per Audit Run</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> SEO, GEO & AEO Health Scores</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Search Console OAuth Sync</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> SEO Action Center & Verification</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Basic Client PDF Reports</li>
            </ul>
          </div>

          <Link
            href="/register"
            className="w-full py-3 text-center rounded-xl bg-slate-100 hover:bg-slate-200 text-navy font-semibold text-xs transition-colors block"
          >
            Start Free Solo Trial
          </Link>
        </div>

        {/* Agency Plan */}
        <div className="bg-white rounded-2xl border-2 border-brand-600 p-8 shadow-md flex flex-col justify-between space-y-6 relative">
          <div className="absolute -top-3 right-6 bg-brand-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-sm">
            Recommended for Agencies
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Digital Marketing Agency</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-navy">$59</span>
                <span className="text-xs text-surface-muted">/ month (Planned)</span>
              </div>
              <p className="text-xs text-surface-muted mt-1">For digital agencies managing multiple client campaigns</p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Up to 15 Monitored Websites</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> 100 Crawled Pages per Audit Run</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Full SEO, GEO & AEO Health Suite</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> GSC Opportunity Finder & Drops</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Action Center with Re-Audit Verification</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Agency-Ready Executive Reports</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Priority In-App Alerts</li>
            </ul>
          </div>

          <Link
            href="/register"
            className="w-full py-3 text-center rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition-all block"
          >
            Launch Agency Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
