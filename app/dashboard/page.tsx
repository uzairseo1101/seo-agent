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
  Compass,
  FileSearch,
  ExternalLink
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function DashboardOverviewPage() {
  const websites = storage.getWebsites();
  const primaryWebsite = websites[0];
  const findings = storage.getFindings();
  const opportunities = storage.getOpportunities();
  const tasks = storage.getActionItems();
  const notifications = storage.getNotifications();

  const criticalFindings = findings.filter(f => f.severity === 'critical');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const verifiedTasks = tasks.filter(t => t.verificationStatus === 'completed_verified');

  return (
    <div>
      <DashboardHeader
        title="Agency Intelligence Overview"
        subtitle="Cross-platform performance, audit scores, prioritized actions and verification tracking"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Primary SEO Score */}
          <div className="bg-white p-5 rounded-xl border border-surface-border shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium text-surface-muted">
              <span>SEO Health Score</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                +4.2 <TrendingUp className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-navy">{primaryWebsite?.latestSeoScore || 0}</span>
              <span className="text-xs text-surface-muted">/ 100</span>
            </div>
            <p className="mt-1 text-xs text-surface-muted truncate">
              {primaryWebsite?.name} • 30+ technical checks
            </p>
          </div>

          {/* Card 2: GEO & AEO AI Engine Scores */}
          <div className="bg-white p-5 rounded-xl border border-surface-border shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium text-surface-muted">
              <span>AI Engine Visibility</span>
              <span className="text-brand-600 font-semibold text-[11px] bg-brand-50 px-2 py-0.5 rounded">Proprietary</span>
            </div>
            <div className="mt-2 flex items-center gap-4">
              <div>
                <span className="text-xs text-surface-muted block">GEO Score</span>
                <span className="text-xl font-bold text-navy">{primaryWebsite?.latestGeoScore || 0}</span>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div>
                <span className="text-xs text-surface-muted block">AEO Score</span>
                <span className="text-xl font-bold text-navy">{primaryWebsite?.latestAeoScore || 0}</span>
              </div>
            </div>
            <p className="mt-1 text-[11px] text-surface-muted">
              Entity clarity & answer engine readiness
            </p>
          </div>

          {/* Card 3: Action Items Pipeline */}
          <div className="bg-white p-5 rounded-xl border border-surface-border shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium text-surface-muted">
              <span>Action Items Pipeline</span>
              <Link href="/dashboard/action-center" className="text-brand-600 hover:underline flex items-center gap-0.5">
                View All <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-navy">{tasks.length}</span>
              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                {inProgressTasks.length} in progress
              </span>
            </div>
            <p className="mt-1 text-xs text-surface-muted">
              {verifiedTasks.length} verified improvements
            </p>
          </div>

          {/* Card 4: GSC Opportunities */}
          <div className="bg-white p-5 rounded-xl border border-surface-border shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium text-surface-muted">
              <span>Active Opportunities</span>
              <Link href="/dashboard/opportunities" className="text-brand-600 hover:underline flex items-center gap-0.5">
                GSC Finder <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-navy">{opportunities.length}</span>
              <span className="text-xs text-emerald-600 font-medium">Striking distance</span>
            </div>
            <p className="mt-1 text-xs text-surface-muted">
              High-impression SERP targets
            </p>
          </div>
        </div>

        {/* Middle Section: GSC Performance Chart + Action Center Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* GSC Trend Chart (2 Cols) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-surface-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-600" />
                  Search Console Organic Growth (Last 30 Days)
                </h3>
                <p className="text-xs text-surface-muted">
                  Actual organic impressions & clicks for {primaryWebsite?.domain}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-navy">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-600"></span> Clicks
                </span>
                <span className="flex items-center gap-1.5 font-medium text-surface-muted">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Impressions
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockGscTrends}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="clicks" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Verification & Action Status Summary */}
          <div className="bg-white p-6 rounded-xl border border-surface-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-surface-border">
                <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Verification Engine
                </h3>
                <span className="text-[11px] font-medium text-surface-muted">Automated</span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-emerald-950">Completed — Verified</p>
                    <p className="text-emerald-800 mt-0.5">Re-audit confirmed 1 critical issue resolution.</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-100 flex items-start gap-3">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-amber-950">Awaiting Re-Crawl</p>
                    <p className="text-amber-800 mt-0.5">2 tasks completed by team; scheduled for next audit pass.</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-navy">Open Critical Findings</p>
                    <p className="text-surface-muted mt-0.5">{criticalFindings.length} issue requiring immediate attention.</p>
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/action-center"
              className="mt-6 w-full py-2.5 text-center text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              Open Action Center
            </Link>
          </div>
        </div>

        {/* Bottom Section: Prioritized Tasks + Recent Findings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prioritized Action Tasks */}
          <div className="bg-white rounded-xl border border-surface-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-surface-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                Prioritized Action Tasks
              </h3>
              <Link href="/dashboard/action-center" className="text-xs font-medium text-brand-600 hover:underline">
                Manage Tasks
              </Link>
            </div>
            <div className="divide-y divide-surface-border">
              {tasks.slice(0, 3).map((task) => (
                <div key={task.id} className="p-4 hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          task.priority === 'critical' ? 'bg-red-100 text-red-700' :
                          task.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {task.priority}
                        </span>
                        <span className="text-[11px] text-surface-muted capitalize">{task.category}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-navy mt-1 truncate">{task.title}</h4>
                      <p className="text-[11px] text-surface-muted truncate mt-0.5">{task.affectedUrl}</p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded shrink-0 ${
                      task.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                      task.status === 'in_progress' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {task.status === 'in_progress' ? 'In Progress' : task.status === 'completed' ? 'Completed' : 'To Do'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monitored Websites Status */}
          <div className="bg-white rounded-xl border border-surface-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-surface-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                <Globe className="w-4 h-4 text-brand-600" />
                Client Websites ({websites.length})
              </h3>
              <Link href="/dashboard/websites" className="text-xs font-medium text-brand-600 hover:underline">
                Add / Manage
              </Link>
            </div>
            <div className="divide-y divide-surface-border">
              {websites.map((w) => (
                <div key={w.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                  <div>
                    <h4 className="text-xs font-semibold text-navy">{w.name}</h4>
                    <p className="text-[11px] text-surface-muted">{w.domain}</p>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-xs font-bold text-navy">{w.latestSeoScore}</span>
                      <span className="text-[10px] text-surface-muted block">SEO</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-navy">{w.latestGeoScore}</span>
                      <span className="text-[10px] text-surface-muted block">GEO</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-navy">{w.latestAeoScore}</span>
                      <span className="text-[10px] text-surface-muted block">AEO</span>
                    </div>
                    <Link
                      href="/dashboard/audits"
                      className="p-1.5 text-surface-muted hover:text-navy rounded-lg hover:bg-slate-100"
                      title="View audit"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
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
