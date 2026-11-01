'use client';

import React from 'react';
import DashboardHeader from '@/components/dashboard-header';
import { storage } from '@/lib/storage';
import { TrendingDown, AlertTriangle, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function TrafficDropPage() {
  const websites = storage.getWebsites();
  const targetSite = websites[1] || websites[0];

  return (
    <div>
      <DashboardHeader
        title="Traffic Drop Investigator"
        subtitle="Deterministic 28-day comparison periods, page-level decline detection and hypothesis evaluation"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Drop Alert Summary */}
        <div className="bg-white rounded-xl border border-surface-border p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-status-warning">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-navy">Investigation for: {targetSite?.name}</h3>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    -18.4% Clicks
                  </span>
                </div>
                <p className="text-xs text-surface-muted">
                  Comparison: Oct 03 – Oct 30, 2026 vs Sep 05 – Oct 02, 2026 (Complete 28-day windows)
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/action-center"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              Assign Investigation Task
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-3 rounded-lg bg-surface-bg border border-surface-border text-center">
              <span className="text-[11px] font-semibold text-surface-muted block">Clicks Change</span>
              <span className="text-xl font-bold text-status-error">-1,240</span>
              <span className="text-[10px] text-surface-muted block">-18.4% decline</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-bg border border-surface-border text-center">
              <span className="text-[11px] font-semibold text-surface-muted block">Impressions Change</span>
              <span className="text-xl font-bold text-status-warning">-8,100</span>
              <span className="text-[10px] text-surface-muted block">-6.2% decline</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-bg border border-surface-border text-center">
              <span className="text-[11px] font-semibold text-surface-muted block">Avg Position</span>
              <span className="text-xl font-bold text-slate-700">14.1</span>
              <span className="text-[10px] text-surface-muted block">-1.2 positions lower</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-bg border border-surface-border text-center">
              <span className="text-[11px] font-semibold text-surface-muted block">Affected Key Pages</span>
              <span className="text-xl font-bold text-navy">3</span>
              <span className="text-[10px] text-surface-muted block">High-volume category URLs</span>
            </div>
          </div>
        </div>

        {/* Affected Pages Breakdown */}
        <div className="bg-white rounded-xl border border-surface-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-surface-border">
            <h3 className="text-sm font-bold text-navy">Top Affected URLs by Organic Click Decline</h3>
          </div>

          <div className="divide-y divide-surface-border">
            <div className="p-4 hover:bg-slate-50 transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy">https://nordicclean.com/collections/kitchen-refills</span>
                <span className="text-xs font-bold text-status-error">-540 Clicks (-28.1%)</span>
              </div>
              <p className="text-xs text-surface-muted">
                Observed: Impressions remained steady (+2%), but CTR collapsed from 4.8% to 2.4%. Suggests rich snippet loss or aggressive competitor title rewrites.
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px]">
                <span className="font-semibold text-navy">Hypothesis:</span>
                <span className="text-brand-700">Product schema availability dropped or out-of-stock signal triggered.</span>
              </div>
            </div>

            <div className="p-4 hover:bg-slate-50 transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy">https://nordicclean.com/products/all-purpose-cleaner-bundle</span>
                <span className="text-xs font-bold text-status-error">-380 Clicks (-19.4%)</span>
              </div>
              <p className="text-xs text-surface-muted">
                Observed: Primary query &ldquo;eco all purpose cleaner bundle&rdquo; slipped from position 4.2 to 8.9.
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px]">
                <span className="font-semibold text-navy">Hypothesis:</span>
                <span className="text-brand-700">Search intent shift; top 3 rankings now dominated by comparison guides.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
