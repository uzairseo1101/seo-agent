import React from 'react';
import Link from 'next/link';
import { TrendingDown, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function TrafficDropAnalysisPage() {
  return (
    <div className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Module 06: Drop Forensics</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-navy tracking-tight">
          Traffic Drop Investigation Engine
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-surface-muted leading-relaxed">
          Diagnose organic traffic drops with deterministic 28-day window comparisons. Pinpoint exact affected URLs and queries without guessing or falsely blaming algorithm updates.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-surface-border p-8 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-navy flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-status-warning" />
          Rigorous 28-Day Window Comparison Methodology
        </h2>
        <div className="text-xs text-surface-muted space-y-3 leading-relaxed">
          <p>
            RankPilot AI isolates organic traffic volatility by comparing complete 28-day calendar blocks against the preceding 28 days, ensuring weekend and seasonal balance.
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-700">
            <li>URL-level click and impression differential calculation</li>
            <li>Query-level position drop and ranking fluctuation mapping</li>
            <li>Technical correlation check (re-indexing errors, canonical conflicts, 404 signals)</li>
            <li>Clear hypotheses categorized as technical, intent shift, or snippet loss</li>
          </ul>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-50 border border-surface-border text-xs text-slate-600 space-y-2">
        <h3 className="font-bold text-navy flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          No Manufactured Blame
        </h3>
        <p className="leading-relaxed">
          We never automatically attribute a traffic drop to a Google algorithm update without verifiable proof. Our engine presents hypotheses based on factual Search Console numbers and advises specific technical verification steps.
        </p>
      </div>

      <div className="text-center">
        <Link
          href="/dashboard/traffic"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition-all"
        >
          Investigate Traffic in Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
