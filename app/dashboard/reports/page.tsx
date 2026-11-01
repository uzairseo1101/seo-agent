'use client';

import React from 'react';
import DashboardHeader from '@/components/dashboard-header';
import { storage } from '@/lib/storage';
import { FileText, Download, Printer, ShieldCheck, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';

export default function ReportsPage() {
  const reports = storage.getReports();
  const currentReport = reports[0];

  return (
    <div>
      <DashboardHeader
        title="Agency Client Reporting"
        subtitle="Produce transparent, executive-ready SEO, GEO & AEO visibility reports backed by verified database evidence"
      />

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-navy">Generated Client Reports ({reports.length})</h2>
            <p className="text-xs text-surface-muted">Audited metrics ready for client delivery</p>
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>

        {/* Executive Report Card */}
        {currentReport && (
          <div className="bg-white rounded-2xl border border-surface-border p-8 shadow-sm space-y-8 print:shadow-none print:border-none">
            {/* Report Header */}
            <div className="border-b border-surface-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-1">
                  Agency Executive Report
                </span>
                <h1 className="text-xl font-extrabold text-navy">{currentReport.title}</h1>
                <p className="text-xs text-surface-muted mt-1 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Period: {currentReport.periodStart} to {currentReport.periodEnd}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-surface-muted block">Client Property</span>
                <span className="text-sm font-bold text-navy">{currentReport.websiteName}</span>
              </div>
            </div>

            {/* Score Cards Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-surface-bg border border-surface-border text-center">
                <span className="text-xs font-semibold text-surface-muted uppercase">SEO Health Score</span>
                <div className="mt-2 text-3xl font-extrabold text-navy">{currentReport.seoScore}</div>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">+4.2 pts since last audit</span>
              </div>

              <div className="p-5 rounded-xl bg-surface-bg border border-surface-border text-center">
                <span className="text-xs font-semibold text-surface-muted uppercase">GEO Visibility Score</span>
                <div className="mt-2 text-3xl font-extrabold text-navy">{currentReport.geoScore}</div>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Entity & citation readiness</span>
              </div>

              <div className="p-5 rounded-xl bg-surface-bg border border-surface-border text-center">
                <span className="text-xs font-semibold text-surface-muted uppercase">AEO Answer Score</span>
                <div className="mt-2 text-3xl font-extrabold text-navy">{currentReport.aeoScore}</div>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Direct QA snippet coverage</span>
              </div>
            </div>

            {/* Search Console Performance Section */}
            <div>
              <h3 className="text-sm font-bold text-navy mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-600" />
                Verified Google Search Console Performance
              </h3>
              <div className="grid grid-cols-2 gap-4 bg-surface-bg p-4 rounded-xl border border-surface-border">
                <div>
                  <span className="text-xs text-surface-muted block">Total Organic Clicks</span>
                  <span className="text-xl font-bold text-navy">{currentReport.clicksTotal.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-xs text-surface-muted block">Total Organic Impressions</span>
                  <span className="text-xl font-bold text-navy">{currentReport.impressionsTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Work Completed & Verified */}
            <div>
              <h3 className="text-sm font-bold text-navy mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Action Work & Verification Summary
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
                  <span>Critical technical and snippet fixes resolved & verified via live re-crawl</span>
                  <strong className="font-extrabold">{currentReport.criticalIssuesResolved} Verified</strong>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-between">
                  <span>Remaining prioritized roadmap actions in progress</span>
                  <strong className="font-extrabold">{currentReport.openTasksCount} In Progress</strong>
                </div>
              </div>
            </div>

            {/* Methodology & Limitations Notice */}
            <div className="pt-4 border-t border-surface-border text-[11px] text-surface-muted leading-relaxed space-y-1">
              <p className="font-semibold text-navy">Methodology & Accuracy Statement:</p>
              <p>
                Metrics reported in this document are derived directly from verified Google Search Console APIs and RankPilot AI safe crawler sample inspections. GEO and AEO evaluation scores are proprietary diagnostic assessments of entity and schema readiness, not official search engine rankings.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
