'use client';

import React from 'react';
import DashboardHeader from '@/components/dashboard-header';
import { storage } from '@/lib/storage';
import { Search, ShieldAlert, CheckCircle, ArrowUpRight, BarChart3, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function GscPage() {
  const websites = storage.getWebsites();
  const primary = websites[0];

  return (
    <div>
      <DashboardHeader
        title="Google Search Console Intelligence"
        subtitle="Read-only OAuth integration, performance synchronization and query tracking"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Connection Status Card */}
        <div className="bg-white rounded-xl border border-surface-border p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-navy">Google Search Console Integration</h3>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Connected (Fixture Mode)
                </span>
              </div>
              <p className="text-xs text-surface-muted mt-0.5">
                Target Property: sc-domain:{primary?.domain} • Read-only scope: webmasters.readonly
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Search Console sync is configured in local safe mode!')}
              className="px-3.5 py-2 rounded-lg border border-surface-border text-xs font-semibold text-navy hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-brand-600" />
              Sync Latest Data
            </button>
            <Link
              href="/dashboard/opportunities"
              className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-xs font-semibold text-white shadow-sm transition-all"
            >
              Find Opportunities
            </Link>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-surface-border shadow-sm">
            <span className="text-xs font-semibold text-surface-muted">Total Clicks (Last 28 Days)</span>
            <span className="text-2xl font-extrabold text-navy mt-1 block">18,450</span>
            <span className="text-[11px] text-emerald-600 font-medium">+14.2% vs previous period</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-surface-border shadow-sm">
            <span className="text-xs font-semibold text-surface-muted">Total Impressions</span>
            <span className="text-2xl font-extrabold text-navy mt-1 block">342,000</span>
            <span className="text-[11px] text-emerald-600 font-medium">+8.5% vs previous period</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-surface-border shadow-sm">
            <span className="text-xs font-semibold text-surface-muted">Average CTR</span>
            <span className="text-2xl font-extrabold text-navy mt-1 block">5.39%</span>
            <span className="text-[11px] text-surface-muted font-medium">Industry avg ~3.1%</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-surface-border shadow-sm">
            <span className="text-xs font-semibold text-surface-muted">Average Position</span>
            <span className="text-2xl font-extrabold text-navy mt-1 block">9.4</span>
            <span className="text-[11px] text-emerald-600 font-medium">+1.8 positions improved</span>
          </div>
        </div>

        {/* Informative notice on GSC scope */}
        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-3">
          <BarChart3 className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-indigo-950">Zero-Risk Read-Only Guarantee</p>
            <p className="leading-relaxed">
              RankPilot AI requests only the read-only Search Console scope. The application cannot change search settings, cannot submit unapproved disavow files, and cannot delete sitemaps. All synchronized metrics are stored encrypted within your organization workspace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
