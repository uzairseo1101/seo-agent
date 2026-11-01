'use client';

import React from 'react';
import Link from 'next/link';
import { Search, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function GscIntelligencePage() {
  const gscCapabilities = [
    'Read-only OAuth 2.0 authorization (webmasters.readonly scope only)',
    'Clicks, Impressions, CTR, and Average Position synchronization',
    'Historical 28-day, 3-month, and custom comparison windows',
    'Automatic detection of Search Console data latency & partial records',
    'Isolated encrypted token storage with automatic refresh rotation',
    'Safe development mock mode with realistic query & page fixtures',
  ];

  return (
    <div className="py-16 sm:py-24 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">Module 04: Verified Search Data</span>
        <h1 className="text-3xl sm:text-[48px] font-bold font-head text-text tracking-tight leading-[1.15]">
          Google Search Console Intelligence
        </h1>
        <p className="text-base text-muted leading-relaxed">
          Ground your agency&apos;s recommendations in verified search data directly from Google. No guessed traffic estimates or third-party database assumptions.
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-6 sm:p-8 shadow-card space-y-6 max-w-4xl mx-auto">
        <h2 className="text-lg font-bold font-head text-text flex items-center gap-2">
          <Search className="w-5 h-5 text-accent" />
          <span>Search Console Sync Capabilities</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gscCapabilities.map((cap) => (
            <div key={cap} className="flex items-start gap-2.5 text-xs text-text">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>{cap}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-lg bg-bg border border-border text-xs text-text space-y-2 max-w-4xl mx-auto">
        <h3 className="font-bold font-head text-text flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Strict OAuth Boundary</span>
        </h3>
        <p className="text-muted leading-relaxed">
          We never ask for Google account passwords and never request write-level access. RankPilot AI operates exclusively with read-only permissions to inspect verified search queries and URL-level metrics.
        </p>
      </div>

      <div className="text-center pt-2">
        <Link
          href="/dashboard/gsc"
          className="inline-flex items-center gap-2 px-6 h-10 rounded-md bg-primary hover:bg-primary-hover text-white font-medium text-sm shadow-xs transition-colors"
        >
          <span>View Search Console Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
