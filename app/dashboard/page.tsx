'use client';

import React from 'react';
import Link from 'next/link';
import DashboardHeader from '@/components/dashboard-header';
import { storage } from '@/lib/storage';
import { mockGscTrends } from '@/lib/mock-data';
import {
  Globe,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Clock,
  ExternalLink,
  ChevronRight,
  Bot
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export default function DashboardOverviewPage() {
  const websites = storage.getWebsites();
  const primaryWebsite = websites[0];
  const findings = storage.getFindings();
  const opportunities = storage.getOpportunities();
  const tasks = storage.getActionItems();

  const criticalFindings = findings.filter(f => f.severity === 'critical');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const verifiedTasks = tasks.filter(t => t.verificationStatus === 'completed_verified');

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Agency Intelligence Overview"
        subtitle="Cross-platform performance, audit scores, prioritized actions and verification tracking"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Top Stat Cards: Clean Rank System */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stat Card 1: SEO Health */}
          <div className="bg-card p-5 rounded-lg border border-border shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-medium text-muted">
              <span>SEO Health Score</span>
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
              <span>AI Engine Visibility</span>
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
              <span>Action Center Tasks</span>
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
              <span>Striking Distance Queries</span>
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

        {/* Middle Section: Chart & Verification Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Card (2 Cols) */}
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
                  <Tooltip
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

        {/* Bottom Section: Prioritized Tasks + Monitored Websites */}
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

          {/* Monitored Websites Table */}
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
