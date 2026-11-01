'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/dashboard-header';
import { storage } from '@/lib/storage';
import { mockGscTrends } from '@/lib/mock-data';
import {
  Globe,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Clock,
  ExternalLink,
  ChevronRight,
  Bot,
  Send,
  HelpCircle,
  X,
  FileText,
  Search,
  Check
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { Tooltip } from '@/components/ui/tooltip';

export default function DashboardOverviewPage() {
  const router = useRouter();
  const websites = storage.getWebsites();
  const primaryWebsite = websites[0];
  const findings = storage.getFindings();
  const opportunities = storage.getOpportunities();
  const tasks = storage.getActionItems();

  const [quickPrompt, setQuickPrompt] = useState('');
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  const criticalFindings = findings.filter(f => f.severity === 'critical');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const verifiedTasks = tasks.filter(t => t.verificationStatus === 'completed_verified');

  const handleAskAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;
    router.push(`/dashboard/action-center?prompt=${encodeURIComponent(quickPrompt.trim())}`);
  };

  const handlePromptChip = (chip: string) => {
    router.push(`/dashboard/action-center?prompt=${encodeURIComponent(chip)}`);
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Agency Intelligence Overview"
        subtitle="Cross-platform performance, audit scores, prioritized actions and verification tracking"
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        {/* 1. TOP "ASK THE AGENT" INPUT (Clean Rank spec) */}
        <div className="bg-card rounded-lg border border-border p-4 sm:p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-accent-tint text-accent flex items-center justify-center font-bold text-xs border border-blue-200">
                AI
              </div>
              <span className="text-xs font-bold font-head text-text">
                Ask the SEO Agent
              </span>
            </div>
            <span className="text-[11px] font-mono text-muted">
              Natural Language Commands
            </span>
          </div>

          <form onSubmit={handleAskAgent} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. Audit example.com, find striking distance keywords, or check schema..."
              value={quickPrompt}
              onChange={(e) => setQuickPrompt(e.target.value)}
              className="flex-1 text-xs px-3.5 h-10 rounded-md border border-border bg-bg text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <button
              type="submit"
              disabled={!quickPrompt.trim()}
              className="h-10 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-medium rounded-md shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 shrink-0"
            >
              <span>Ask agent</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Prompt Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-muted mr-1">Suggested:</span>
            <button
              type="button"
              onClick={() => handlePromptChip('Find top 10 striking distance queries')}
              className="px-2.5 py-1 rounded-sm bg-bg border border-border text-[11px] text-muted hover:text-text hover:bg-slate-100 transition-colors"
            >
              Striking distance queries
            </button>
            <button
              type="button"
              onClick={() => handlePromptChip('Audit technical issues on primary site')}
              className="px-2.5 py-1 rounded-sm bg-bg border border-border text-[11px] text-muted hover:text-text hover:bg-slate-100 transition-colors"
            >
              Audit technical issues
            </button>
            <button
              type="button"
              onClick={() => handlePromptChip('Check AEO & GEO schema readiness')}
              className="px-2.5 py-1 rounded-sm bg-bg border border-border text-[11px] text-muted hover:text-text hover:bg-slate-100 transition-colors"
            >
              Check AEO/GEO readiness
            </button>
          </div>
        </div>

        {/* 2. ONBOARDING CHECKLIST (Dismissible, guides new users) */}
        {!onboardingDismissed && (
          <div className="bg-card rounded-lg border border-primary/40 p-4 sm:p-5 shadow-card relative">
            <button
              onClick={() => setOnboardingDismissed(true)}
              className="absolute top-3 right-3 text-muted hover:text-text p-1"
              aria-label="Dismiss checklist"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="space-y-3 pr-6">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-primary tracking-wider">
                  Getting Started Checklist
                </span>
                <h3 className="text-sm font-bold font-head text-text mt-0.5">
                  Complete your initial setup to unlock automated SEO verification
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link
                  href="/dashboard/websites"
                  className="p-3 rounded-md bg-bg border border-border hover:border-primary/50 transition-colors flex items-start gap-2.5"
                >
                  <div className="w-5 h-5 rounded-full bg-primary-tint text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-text block">1. Add Website</span>
                    <span className="text-[11px] text-muted block mt-0.5">
                      {websites.length > 0 ? 'Domain connected' : 'Connect domain URL'}
                    </span>
                  </div>
                </Link>

                <Link
                  href="/dashboard/audits"
                  className="p-3 rounded-md bg-bg border border-border hover:border-primary/50 transition-colors flex items-start gap-2.5"
                >
                  <div className="w-5 h-5 rounded-full bg-primary-tint text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-text block">2. Run First Audit</span>
                    <span className="text-[11px] text-muted block mt-0.5">
                      30+ technical & schema checks
                    </span>
                  </div>
                </Link>

                <Link
                  href="/dashboard/reports"
                  className="p-3 rounded-md bg-bg border border-border hover:border-primary/50 transition-colors flex items-start gap-2.5"
                >
                  <div className="w-5 h-5 rounded-full bg-accent-tint text-accent flex items-center justify-center shrink-0 mt-0.5">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-text block">3. Export First Report</span>
                    <span className="text-[11px] text-muted block mt-0.5">
                      Branded PDF with verified fixes
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 3. STAT CARDS (Tabular numbers, Clean Rank styling) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stat Card 1: SEO Health */}
          <div className="bg-card p-5 rounded-lg border border-border shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-medium text-muted">
              <span className="flex items-center gap-1">
                <span>SEO Health Score</span>
                <Tooltip content="Score computed across meta tags, headings, speed, and indexing">
                  <HelpCircle className="w-3 h-3 text-muted/60" />
                </Tooltip>
              </span>
              <span className="font-mono text-xs font-medium text-primary bg-primary-tint border border-emerald-200/60 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                +4.2
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-text tracking-tight tnum">
                {primaryWebsite?.latestSeoScore || 0}
              </span>
              <span className="text-xs font-mono text-muted">/ 100</span>
            </div>
            <p className="mt-2 text-xs text-muted truncate">
              {primaryWebsite?.name} • 30+ technical checks
            </p>
          </div>

          {/* Stat Card 2: GEO & AEO AI Engine Scores */}
          <div className="bg-card p-5 rounded-lg border border-border shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-medium text-muted">
              <span className="flex items-center gap-1">
                <span>AI Engine Visibility</span>
                <Tooltip content="Generative Engine and Answer Engine readiness scores">
                  <HelpCircle className="w-3 h-3 text-muted/60" />
                </Tooltip>
              </span>
              <span className="font-mono text-[11px] font-medium text-accent bg-accent-tint border border-blue-200/60 px-2 py-0.5 rounded-full">
                GEO & AEO
              </span>
            </div>
            <div className="mt-2 flex items-center gap-4">
              <div>
                <span className="text-[11px] text-muted block">GEO</span>
                <span className="text-2xl font-bold font-mono text-text tracking-tight tnum">
                  {primaryWebsite?.latestGeoScore || 0}
                </span>
              </div>
              <div className="h-7 w-px bg-border"></div>
              <div>
                <span className="text-[11px] text-muted block">AEO</span>
                <span className="text-2xl font-bold font-mono text-text tracking-tight tnum">
                  {primaryWebsite?.latestAeoScore || 0}
                </span>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted truncate">
              Entity clarity & answer engine readiness
            </p>
          </div>

          {/* Stat Card 3: Action Items Pipeline */}
          <div className="bg-card p-5 rounded-lg border border-border shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-medium text-muted">
              <span className="flex items-center gap-1">
                <span>Action Center Tasks</span>
                <Tooltip content="Prioritized action tasks derived from audit findings">
                  <HelpCircle className="w-3 h-3 text-muted/60" />
                </Tooltip>
              </span>
              <Link href="/dashboard/action-center" className="text-accent hover:underline flex items-center gap-0.5">
                Manage <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-text tracking-tight tnum">
                {tasks.length}
              </span>
              <span className="text-xs font-mono text-amber-700 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 px-2 py-0.5 rounded-full">
                {inProgressTasks.length} in progress
              </span>
            </div>
            <p className="mt-2 text-xs text-muted">
              {verifiedTasks.length} verified improvements
            </p>
          </div>

          {/* Stat Card 4: GSC Opportunities */}
          <div className="bg-card p-5 rounded-lg border border-border shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-medium text-muted">
              <span className="flex items-center gap-1">
                <span>Striking Distance Queries</span>
                <Tooltip content="Queries on positions 5-20 with high impression volume">
                  <HelpCircle className="w-3 h-3 text-muted/60" />
                </Tooltip>
              </span>
              <Link href="/dashboard/opportunities" className="text-accent hover:underline flex items-center gap-0.5">
                Finder <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-text tracking-tight tnum">
                {opportunities.length}
              </span>
              <span className="text-xs font-mono text-primary bg-primary-tint border border-emerald-200/60 px-2 py-0.5 rounded-full">
                Pos 5–20
              </span>
            </div>
            <p className="mt-2 text-xs text-muted">
              High-impression SERP targets
            </p>
          </div>
        </div>

        {/* 4. MAIN CHART (Green line with 10% area fill) + VERIFICATION SUMMARY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card p-6 rounded-lg border border-border shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
              <div>
                <h3 className="text-base font-bold font-head text-text flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Search Console Organic Growth (Last 30 Days)
                </h3>
                <p className="text-xs text-muted">
                  Actual organic impressions & clicks for {primaryWebsite?.domain}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-text font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span> Clicks
                </span>
                <span className="flex items-center gap-1.5 text-muted">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]"></span> Impressions
                </span>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockGscTrends}>
                  <defs>
                    <linearGradient id="cleanRankGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#64748B"
                    fontSize={11}
                    fontFamily="IBM Plex Mono"
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    fontFamily="IBM Plex Mono"
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '10px',
                      color: '#0F172A',
                      fontSize: '12px',
                      fontFamily: 'IBM Plex Mono',
                      boxShadow: '0 4px 12px rgba(15,23,42,.08)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    stroke="#059669"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#cleanRankGreen)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Verification & Action Status Summary */}
          <div className="bg-card p-6 rounded-lg border border-border shadow-card flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="text-base font-bold font-head text-text flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Verification Engine
                </h3>
                <span className="text-[11px] font-mono text-primary bg-primary-tint px-2 py-0.5 rounded-full border border-emerald-200">
                  Automated
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-md bg-primary-tint border border-emerald-200/80 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-text">Completed — Verified</p>
                    <p className="text-muted mt-0.5">Automated re-audit confirmed critical issue resolutions.</p>
                  </div>
                </div>

                <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
                  <Clock className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-text">Awaiting Re-Crawl</p>
                    <p className="text-muted mt-0.5">2 tasks completed by team; scheduled for next audit pass.</p>
                  </div>
                </div>

                <div className="p-3 rounded-md bg-bg border border-border flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-text">Open Critical Findings</p>
                    <p className="text-muted mt-0.5">{criticalFindings.length} issue requiring immediate attention.</p>
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/action-center"
              className="w-full h-10 flex items-center justify-center text-xs font-medium rounded-md border border-border bg-card hover:bg-slate-50 text-text transition-colors shadow-xs"
            >
              Open Action Center
            </Link>
          </div>
        </div>

        {/* 5. TABLES: 48PX ROWS, MONO METRICS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prioritized Action Tasks Table (48px rows) */}
          <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold font-head text-text flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Prioritized Action Tasks
              </h3>
              <Link href="/dashboard/action-center" className="text-xs font-medium text-accent hover:underline">
                View All
              </Link>
            </div>
            <div className="divide-y divide-border">
              {tasks.slice(0, 4).map((task) => (
                <div key={task.id} className="h-12 px-4 flex items-center justify-between hover:bg-bg transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                      task.priority === 'critical' ? 'bg-red-50 text-error border border-red-200' :
                      task.priority === 'high' ? 'bg-amber-50 text-warning border border-amber-200' :
                      'bg-blue-50 text-accent border border-blue-200'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-xs font-medium text-text truncate">{task.title}</span>
                  </div>
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full shrink-0 ${
                    task.status === 'completed' ? 'bg-primary-tint text-primary border border-emerald-200' :
                    task.status === 'in_progress' ? 'bg-amber-50 text-warning border border-amber-200' :
                    'bg-slate-100 text-muted border border-border'
                  }`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Monitored Websites Table (48px rows) */}
          <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold font-head text-text flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                Client Websites ({websites.length})
              </h3>
              <Link href="/dashboard/websites" className="text-xs font-medium text-accent hover:underline">
                Manage
              </Link>
            </div>
            <div className="divide-y divide-border">
              {websites.map((w) => (
                <div key={w.id} className="h-12 px-4 flex items-center justify-between hover:bg-bg transition-colors">
                  <div className="min-w-0 pr-2">
                    <span className="text-xs font-medium text-text block truncate">{w.name}</span>
                    <span className="text-[10px] font-mono text-muted block truncate">{w.domain}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-text font-bold tnum">{w.latestSeoScore} <span className="text-[10px] font-normal text-muted">SEO</span></span>
                    <span className="text-text font-bold tnum">{w.latestGeoScore} <span className="text-[10px] font-normal text-muted">GEO</span></span>
                    <Link
                      href="/dashboard/audits"
                      className="p-1 text-muted hover:text-text rounded-md hover:bg-slate-100"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
