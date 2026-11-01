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
    <div className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Module 04: Verified Search Data</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-navy tracking-tight">
          Google Search Console Intelligence
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-surface-muted leading-relaxed">
          Ground your agency&apos;s recommendations in verified search data directly from Google. No guessed traffic estimates or third-party database assumptions.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-surface-border p-8 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-navy flex items-center gap-2">
          <Search className="w-5 h-5 text-brand-600" />
          Search Console Sync Capabilities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gscCapabilities.map((cap) => (
            <div key={cap} className="flex items-start gap-2.5 text-xs text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{cap}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 space-y-2">
        <h3 className="font-bold text-navy flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          Strict OAuth Boundary
        </h3>
        <p className="leading-relaxed">
          We never ask for Google account passwords and never request write-level access. RankPilot AI operates exclusively with read-only permissions to inspect verified search queries and URL-level metrics.
        </p>
      </div>

      <div className="text-center">
        <Link
          href="/dashboard/gsc"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition-all"
        >
          View Search Console Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
