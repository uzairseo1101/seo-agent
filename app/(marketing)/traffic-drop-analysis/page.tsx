'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingDown, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function TrafficDropAnalysisPage() {
  return (
    <div className="py-16 sm:py-24 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">Module 06: Drop Forensics</span>
        <h1 className="text-3xl sm:text-[48px] font-bold font-head text-text tracking-tight leading-[1.15]">
          Traffic Drop Investigation Engine
        </h1>
        <p className="text-base text-muted leading-relaxed">
          Diagnose organic traffic drops with deterministic 28-day window comparisons. Pinpoint exact affected URLs and queries without guessing or falsely blaming algorithm updates.
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-6 sm:p-8 shadow-card space-y-6 max-w-4xl mx-auto">
        <h2 className="text-lg font-bold font-head text-text flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-warning" />
          <span>Rigorous 28-Day Window Comparison Methodology</span>
        </h2>
        <div className="text-xs text-muted space-y-3 leading-relaxed">
          <p>
            RankPilot AI isolates organic traffic volatility by comparing complete 28-day calendar blocks against the preceding 28 days, ensuring weekend and seasonal balance.
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-text">
            <li>URL-level click and impression differential calculation</li>
            <li>Query-level position drop and ranking fluctuation mapping</li>
            <li>Technical correlation check (re-indexing errors, canonical conflicts, 404 signals)</li>
            <li>Clear hypotheses categorized as technical, intent shift, or snippet loss</li>
          </ul>
        </div>
      </div>

      <div className="p-6 rounded-lg bg-bg border border-border text-xs text-text space-y-2 max-w-4xl mx-auto">
        <h3 className="font-bold font-head text-text flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>No Manufactured Blame</span>
        </h3>
        <p className="text-muted leading-relaxed">
          We never automatically attribute a traffic drop to a Google algorithm update without verifiable proof. Our engine presents hypotheses based on factual Search Console numbers and advises specific technical verification steps.
        </p>
      </div>

      <div className="text-center pt-2">
        <Link
          href="/dashboard/traffic"
          className="inline-flex items-center gap-2 px-6 h-10 rounded-md bg-primary hover:bg-primary-hover text-white font-medium text-sm shadow-xs transition-colors"
        >
          <span>Investigate Traffic in Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
