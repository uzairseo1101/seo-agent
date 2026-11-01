'use client';

import React, { useState } from 'react';
import DashboardHeader from '@/components/dashboard-header';
import { storage } from '@/lib/storage';
import {
  TrendingDown,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Layers,
  Check
} from 'lucide-react';
import Link from 'next/link';

export default function TrafficDropPage() {
  const websites = storage.getWebsites();
  const [selectedWebId, setSelectedWebId] = useState(websites[1]?.id || websites[0]?.id || '');
  const [taskNotice, setTaskNotice] = useState<string | null>(null);

  const targetSite = websites.find(w => w.id === selectedWebId) || websites[0];

  const affectedPages = [
    {
      url: `${targetSite?.url || 'https://nordicclean.com'}/collections/kitchen-refills`,
      prevClicks: 1920,
      curClicks: 1380,
      drop: 540,
      dropPct: '-28.1%',
      prevImp: 40000,
      curImp: 40800,
      hypothesis: 'Impressions held steady (+2%), but CTR collapsed from 4.8% to 2.4%. Suggests rich snippet loss, product out-of-stock signal, or aggressive competitor title rewrite.',
    },
    {
      url: `${targetSite?.url || 'https://nordicclean.com'}/products/all-purpose-cleaner-bundle`,
      prevClicks: 1960,
      curClicks: 1580,
      drop: 380,
      dropPct: '-19.4%',
      prevImp: 32000,
      curImp: 29500,
      hypothesis: 'Primary commercial query slipped from position 4.2 to 8.9. Search intent review indicates top 3 spots now occupied by comparative buyer guides.',
    },
    {
      url: `${targetSite?.url || 'https://nordicclean.com'}/blog/zero-waste-cleaning-tips`,
      prevClicks: 1140,
      curClicks: 820,
      drop: 320,
      dropPct: '-28.1%',
      prevImp: 28000,
      curImp: 21600,
      hypothesis: 'Impression decline (-22.8%) matching overall seasonal post-spring decline. Topical refresh recommended with updated 2026 data.',
    },
  ];

  const affectedQueries = [
    {
      query: 'eco friendly kitchen refills bundle',
      prevClicks: 620,
      curClicks: 340,
      drop: 280,
      prevPos: 3.8,
      curPos: 6.9,
      hypothesis: 'Rankings fell 3.1 positions behind competitor review roundups.',
    },
    {
      query: 'zero waste dish soap concentrated refill',
      prevClicks: 410,
      curClicks: 260,
      drop: 150,
      prevPos: 4.1,
      curPos: 5.4,
      hypothesis: 'CTR dropped from 5.1% to 3.4% without major position loss; SERP layout expanded local map pack.',
    },
  ];

  const handleAssignInvestigation = () => {
    storage.addActionItem({
      id: `act-trf-${Date.now()}`,
      organizationId: storage.getOrganization().id,
      websiteId: targetSite.id,
      sourceType: 'traffic_investigation',
      title: `Investigate Traffic Drop on ${targetSite.name}`,
      description: `Organic clicks declined 18.4% (-1,240 clicks) over the last 28 days on ${targetSite.domain}. Top affected page: /collections/kitchen-refills.`,
      category: 'technical',
      priority: 'high',
      affectedUrl: `${targetSite.url}/collections/kitchen-refills`,
      recommendedSolution: 'Audit Product schema markup for missing Price/Availability rich snippet data. Conduct live SERP layout review against competitor snippets.',
      steps: [
        'Inspect Google Search Console Page Indexing report for /collections/kitchen-refills',
        'Verify Product schema JSON-LD with Rich Results Test to check price/review snippet status',
        'Review competitor title tags and meta descriptions in top 3 rankings',
        'Deploy updated title & meta description and request re-indexing',
      ],
      status: 'todo',
      verificationStatus: 'unverified',
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    });

    setTaskNotice(`Investigation task assigned for ${targetSite.name}`);
    setTimeout(() => setTaskNotice(null), 3500);
  };

  return (
    <div>
      <DashboardHeader
        title="Traffic Drop Investigator"
        subtitle="Deterministic 28-day comparison periods, page-level decline detection and hypothesis evaluation"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Notice Banner */}
        {taskNotice && (
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{taskNotice}</span>
            </div>
            <Link href="/dashboard/action-center" className="font-semibold text-emerald-900 underline hover:no-underline">
              Open Action Center →
            </Link>
          </div>
        )}

        {/* Top Header Card */}
        <div className="bg-white rounded-xl border border-surface-border p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-status-warning">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-navy">Investigation: {targetSite?.name}</h3>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    -18.4% Clicks
                  </span>
                </div>
                <p className="text-xs text-surface-muted mt-0.5 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Period: Oct 03 – Oct 30, 2026 vs Sep 05 – Oct 02, 2026 (Complete 28-day windows)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedWebId}
                onChange={(e) => setSelectedWebId(e.target.value)}
                className="text-xs font-medium px-3 py-2 rounded-lg border border-surface-border bg-white outline-none"
              >
                {websites.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>

              <button
                onClick={handleAssignInvestigation}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Assign Action Task</span>
              </button>
            </div>
          </div>

          {/* 4 Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-3.5 rounded-lg bg-surface-bg border border-surface-border text-center">
              <span className="text-[11px] font-semibold text-surface-muted block">Clicks Change</span>
              <span className="text-xl font-bold text-status-error">-1,240</span>
              <span className="text-[10px] text-surface-muted block">-18.4% decline</span>
            </div>
            <div className="p-3.5 rounded-lg bg-surface-bg border border-surface-border text-center">
              <span className="text-[11px] font-semibold text-surface-muted block">Impressions Change</span>
              <span className="text-xl font-bold text-status-warning">-8,100</span>
              <span className="text-[10px] text-surface-muted block">-6.2% decline</span>
            </div>
            <div className="p-3.5 rounded-lg bg-surface-bg border border-surface-border text-center">
              <span className="text-[11px] font-semibold text-surface-muted block">Avg Position</span>
              <span className="text-xl font-bold text-slate-700">14.1</span>
              <span className="text-[10px] text-surface-muted block">-1.2 positions lower</span>
            </div>
            <div className="p-3.5 rounded-lg bg-surface-bg border border-surface-border text-center">
              <span className="text-[11px] font-semibold text-surface-muted block">Affected Core Pages</span>
              <span className="text-xl font-bold text-navy">3</span>
              <span className="text-[10px] text-surface-muted block">High-volume category URLs</span>
            </div>
          </div>
        </div>

        {/* Affected Pages Table */}
        <div className="bg-white rounded-xl border border-surface-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-surface-border">
            <h3 className="text-sm font-bold text-navy">Top Affected URLs by Net Organic Click Decline</h3>
          </div>

          <div className="divide-y divide-surface-border">
            {affectedPages.map((page) => (
              <div key={page.url} className="p-5 hover:bg-slate-50 transition-colors space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-bold text-navy font-mono truncate max-w-lg">{page.url}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-surface-muted">
                      {page.prevClicks.toLocaleString()} → <strong className="text-navy">{page.curClicks.toLocaleString()}</strong>
                    </span>
                    <span className="font-extrabold text-status-error px-2 py-0.5 rounded bg-red-50 border border-red-200">
                      -{page.drop} Clicks ({page.dropPct})
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-surface-bg border border-surface-border text-xs text-slate-700">
                  <strong className="text-navy">Evidence-Based Hypothesis:</strong>{' '}
                  <span className="leading-relaxed">{page.hypothesis}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Affected Queries Table */}
        <div className="bg-white rounded-xl border border-surface-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-surface-border">
            <h3 className="text-sm font-bold text-navy">Affected Organic Search Queries</h3>
          </div>

          <div className="divide-y divide-surface-border">
            {affectedQueries.map((q) => (
              <div key={q.query} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <h4 className="font-bold text-navy">&ldquo;{q.query}&rdquo;</h4>
                  <p className="text-surface-muted mt-0.5">{q.hypothesis}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0 text-right">
                  <div>
                    <span className="font-bold text-navy">{q.prevPos} → {q.curPos}</span>
                    <span className="text-[10px] text-surface-muted block">Position</span>
                  </div>
                  <div>
                    <span className="font-bold text-status-error">-{q.drop}</span>
                    <span className="text-[10px] text-surface-muted block">Clicks Lost</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Methodological Safety Notice */}
        <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-indigo-950">Scientific Drop Forensics (No False Algorithm Blame)</p>
            <p className="leading-relaxed">
              RankPilot AI never rushes to blame an unverified Google algorithm update for traffic fluctuations. We systematically isolate snippet CTR collapses, seasonal query trends, and technical indexation hurdles to give your agency actionable verification steps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
