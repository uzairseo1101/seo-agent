'use client';

import React from 'react';
import DashboardHeader from '@/components/dashboard-header';
import { storage } from '@/lib/storage';
import { mockAuditRuns } from '@/lib/mock-data';
import { FileSearch, CheckCircle, AlertTriangle, ShieldCheck, Play, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AuditsPage() {
  const websites = storage.getWebsites();
  const findings = storage.getFindings();

  return (
    <div>
      <DashboardHeader
        title="SEO, GEO & AEO Website Audits"
        subtitle="Safe in-house crawls evaluating 30+ technical standards, entity clarity and answer engine readiness"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Banner with crawl limits & safe anti-SSRF protections */}
        <div className="bg-white rounded-xl border border-surface-border p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-brand-600">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-navy">In-House Safe Audit Engine</h3>
              <p className="text-xs text-surface-muted">
                Configured with anti-SSRF boundaries, 25-page crawl sample limit, and respect for robots.txt.
              </p>
            </div>
          </div>
          <button
            onClick={() => alert('Phase 2 will activate the live safe crawler!')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Safe Audit</span>
          </button>
        </div>

        {/* Audit Runs History */}
        <div className="bg-white rounded-xl border border-surface-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-surface-border">
            <h3 className="text-sm font-bold text-navy">Recent Audit History</h3>
          </div>

          <div className="divide-y divide-surface-border">
            {mockAuditRuns.map((run) => (
              <div key={run.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-navy">{websites[0]?.name || 'Target Domain'}</span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {run.status}
                    </span>
                  </div>
                  <p className="text-xs text-surface-muted mt-1">
                    Crawled {run.pagesCrawled} sample pages in {(run.crawlDurationMs / 1000).toFixed(1)}s • Started {new Date(run.startedAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <span className="text-xs text-surface-muted block">SEO</span>
                    <span className="text-base font-extrabold text-navy">{run.seoScore}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-surface-muted block">GEO</span>
                    <span className="text-base font-extrabold text-navy">{run.geoScore}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-surface-muted block">AEO</span>
                    <span className="text-base font-extrabold text-navy">{run.aeoScore}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detected Findings with real evidence */}
        <div className="bg-white rounded-xl border border-surface-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-surface-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy">Evidence-Backed Findings ({findings.length})</h3>
              <p className="text-xs text-surface-muted">Each finding contains verifiable HTML/HTTP evidence and suggested actions</p>
            </div>
            <Link href="/dashboard/action-center" className="text-xs font-semibold text-brand-600 hover:underline">
              Turn into Tasks →
            </Link>
          </div>

          <div className="divide-y divide-surface-border">
            {findings.map((f) => (
              <div key={f.id} className="p-5 hover:bg-slate-50/80 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      f.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      f.severity === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {f.severity}
                    </span>
                    <span className="text-[11px] font-semibold text-surface-muted uppercase">{f.category}</span>
                  </div>
                  <span className="text-[11px] text-surface-muted">
                    Confidence: <span className="font-semibold text-navy">{f.confidenceLevel}</span>
                  </span>
                </div>

                <h4 className="text-sm font-bold text-navy">{f.title}</h4>
                <p className="text-xs text-surface-muted">{f.description}</p>
                <p className="text-xs font-mono text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
                  URL: {f.url}
                </p>

                {/* Evidence snippet */}
                <div className="mt-2 p-3 rounded-lg bg-surface-bg border border-surface-border text-xs space-y-1">
                  <div className="text-slate-600">
                    <span className="font-semibold text-navy">Expected:</span> {f.evidence.expected}
                  </div>
                  <div className="text-slate-600">
                    <span className="font-semibold text-navy">Actual Evidence:</span> {f.evidence.actual}
                  </div>
                  {f.evidence.snippet && (
                    <div className="mt-1 font-mono text-[11px] bg-white p-2 rounded border border-slate-200 text-slate-700 overflow-x-auto">
                      {f.evidence.snippet}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-brand-700 font-medium">
                    Recommended: {f.recommendation}
                  </span>
                  <Link
                    href="/dashboard/action-center"
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    Create Action Task <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
