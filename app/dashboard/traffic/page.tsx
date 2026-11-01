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
  Check,
  Bot
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

    setTaskNotice(`Created Investigation Task for ${targetSite.name}`);
    setTimeout(() => setTaskNotice(null), 3500);
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Traffic Drop Investigation Engine"
        subtitle="Automated 28-day vs previous 28-day differential analysis with evidence-backed hypotheses"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Task Added Notice Banner */}
        {taskNotice && (
          <div className="p-3.5 rounded-md bg-primary-tint border border-emerald-200 text-xs text-primary flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary shrink-0" />
              <span>{taskNotice}</span>
            </div>
            <Link href="/dashboard/action-center" className="font-medium text-accent hover:underline">
              Open Action Center →
            </Link>
          </div>
        )}

        {/* Website Selector & Summary Alert */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center justify-center text-error">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold font-head text-text">Organic Drop Detected: {targetSite?.name}</h3>
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-red-50 text-error border border-red-200">
                  -18.4% Clicks
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Comparing Last 28 Days vs Previous 28 Days (Accounting for 3-day GSC Latency)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <select
              value={selectedWebId}
              onChange={(e) => setSelectedWebId(e.target.value)}
              className="text-xs font-medium px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs cursor-pointer"
            >
              {websites.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.domain})
                </option>
              ))}
            </select>

            <button
              onClick={handleAssignInvestigation}
              className="h-10 px-4 rounded-md border border-border bg-card hover:bg-slate-50 text-xs font-medium text-text flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              <span>Convert to Task</span>
            </button>
          </div>
        </div>

        {/* Drop Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-card p-5 rounded-lg border border-border shadow-card flex flex-col justify-between">
            <span className="text-xs font-medium text-muted">Click Differential</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-error tnum">-1,240</span>
              <span className="text-xs font-mono text-error font-medium">-18.4%</span>
            </div>
            <p className="mt-2 text-xs text-muted">5,480 vs 6,720 prev</p>
          </div>

          <div className="bg-card p-5 rounded-lg border border-border shadow-card flex flex-col justify-between">
            <span className="text-xs font-medium text-muted">Impression Differential</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-error tnum">-8,200</span>
              <span className="text-xs font-mono text-error font-medium">-7.1%</span>
            </div>
            <p className="mt-2 text-xs text-muted">106,800 vs 115,000 prev</p>
          </div>

          <div className="bg-card p-5 rounded-lg border border-border shadow-card flex flex-col justify-between">
            <span className="text-xs font-medium text-muted">CTR Impact</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-error tnum">-0.71%</span>
              <span className="text-xs font-mono text-muted">Points</span>
            </div>
            <p className="mt-2 text-xs text-muted">5.13% vs 5.84% prev</p>
          </div>

          <div className="bg-card p-5 rounded-lg border border-border shadow-card flex flex-col justify-between">
            <span className="text-xs font-medium text-muted">Avg. Position Delta</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-error tnum">+1.4</span>
              <span className="text-xs font-mono text-muted">Positions dropped</span>
            </div>
            <p className="mt-2 text-xs text-muted">8.2 vs 6.8 prev</p>
          </div>
        </div>

        {/* Affected Landing Pages Table */}
        <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-bold font-head text-text">
              Top Declining Landing Pages (Last 28 Days vs Prev 28 Days)
            </h3>
          </div>
          <div className="divide-y divide-border">
            {affectedPages.map((page) => (
              <div key={page.url} className="p-5 hover:bg-bg transition-colors space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-mono text-xs font-medium text-text truncate max-w-lg">
                    {page.url}
                  </span>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-muted tnum">{page.prevClicks} → <strong className="text-text">{page.curClicks}</strong> clicks</span>
                    <span className="px-2 py-0.5 rounded-full bg-red-50 text-error border border-red-200 font-bold tnum">
                      {page.dropPct} (-{page.drop})
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-md bg-bg border border-border text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-text">
                    <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
                    <span>Algorithmic Root-Cause Hypothesis:</span>
                  </div>
                  <p className="text-muted leading-relaxed pl-5 font-sans">
                    {page.hypothesis}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Affected Queries Table */}
        <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-bold font-head text-text">
              Top Declining Queries (Last 28 Days vs Prev 28 Days)
            </h3>
          </div>
          <div className="divide-y divide-border">
            {affectedQueries.map((q) => (
              <div key={q.query} className="p-5 hover:bg-bg transition-colors space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-text">{q.query}</span>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-muted tnum">Pos: {q.prevPos} → <strong className="text-error">{q.curPos}</strong></span>
                    <span className="px-2 py-0.5 rounded-full bg-red-50 text-error border border-red-200 font-bold tnum">
                      -{q.drop} clicks
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted pl-1">
                  <strong>SERP Analysis:</strong> {q.hypothesis}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
