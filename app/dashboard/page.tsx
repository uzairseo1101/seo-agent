'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/dashboard-header';
import { storage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { Website, AuditFinding, SeoOpportunity, ActionItem } from '@/lib/types';
import { mockGscTrends } from '@/lib/mock-data';
import {
  Globe,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Check,
  Search,
  ExternalLink,
  Plus,
  Play,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [websites, setWebsites] = useState<Website[]>(() => {
    return storage.getWebsites().filter(
      (w) =>
        !['web-1', 'web-2', 'web-3'].includes(w.id) &&
        !['SaaSFlow Analytics', 'Nordic Clean Living', 'Zenith Legal Partners'].includes(w.name)
    );
  });
  const [findings, setFindings] = useState<AuditFinding[]>(storage.getFindings());
  const [opportunities, setOpportunities] = useState<SeoOpportunity[]>(storage.getOpportunities());
  const [tasks, setTasks] = useState<ActionItem[]>(storage.getActionItems());
  const [activeTab, setActiveTab] = useState<'tasks' | 'opportunities'>('tasks');

  useEffect(() => {
    let mounted = true;
    const syncData = async () => {
      try {
        const { data: { session } } = (await supabase?.auth.getSession()) || { data: { session: null } };
        const headers: Record<string, string> = {};
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const [webRes, taskRes] = await Promise.all([
          fetch('/api/websites', { headers }),
          fetch('/api/tasks', { headers }),
        ]);

        if (webRes.ok && mounted) {
          const webJson = await webRes.json();
          if (webJson.success && Array.isArray(webJson.websites)) {
            const clean = webJson.websites.filter(
              (w: Website) =>
                !['web-1', 'web-2', 'web-3'].includes(w.id) &&
                !['SaaSFlow Analytics', 'Nordic Clean Living', 'Zenith Legal Partners'].includes(w.name) &&
                !['saasflow.io', 'nordicclean.com', 'zenithlaw.co.uk'].includes(w.domain)
            );
            setWebsites(clean);
          }
        }
        if (taskRes.ok && mounted) {
          const taskJson = await taskRes.json();
          if (taskJson.success && taskJson.tasks) {
            setTasks(taskJson.tasks);
          }
        }
      } catch (e) {
        // Fallback
      }
    };
    syncData();
    return () => {
      mounted = false;
    };
  }, []);

  const primaryWebsite = websites[0];
  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const verifiedTasks = tasks.filter((t) => t.verificationStatus === 'completed_verified');

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Dashboard"
        subtitle={primaryWebsite ? `Monitoring ${primaryWebsite.name} (${primaryWebsite.domain})` : 'Multi-domain SEO intelligence and action management'}
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Zero State if No Websites Connected */}
        {websites.length === 0 ? (
          <div className="bg-card rounded-xl border border-dashed border-border p-12 text-center shadow-xs flex flex-col items-center justify-center max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary-tint border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-center text-primary">
              <Globe className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold font-head text-text">No websites connected</h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Connect your domain to run automated technical SEO crawls, monitor Search Console data, and track verified fixes.
              </p>
            </div>
            <Link
              href="/dashboard/websites"
              className="inline-flex items-center gap-1.5 h-9 px-4 bg-primary hover:bg-primary-hover text-white rounded-md text-xs font-medium shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Connect Website</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Top 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: SEO Score */}
              <div className="bg-card p-5 rounded-xl border border-border shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between text-xs text-muted font-medium">
                  <span>SEO Health Score</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-head text-text tracking-tight tnum">
                    {primaryWebsite?.latestSeoScore || 0}
                  </span>
                  <span className="text-xs text-muted">/ 100</span>
                </div>
                <p className="mt-2 text-xs text-muted">
                  Technical, content & indexability factors
                </p>
              </div>

              {/* Card 2: AI Visibility */}
              <div className="bg-card p-5 rounded-xl border border-border shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between text-xs text-muted font-medium">
                  <span>AI Engine Visibility</span>
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-head text-text tracking-tight tnum">
                    {Math.round(((primaryWebsite?.latestGeoScore || 0) + (primaryWebsite?.latestAeoScore || 0)) / 2) || 0}
                  </span>
                  <span className="text-xs text-muted">/ 100</span>
                </div>
                <p className="mt-2 text-xs text-muted">
                  GEO entity graph & AEO schema readiness
                </p>
              </div>

              {/* Card 3: Action Items */}
              <div className="bg-card p-5 rounded-xl border border-border shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between text-xs text-muted font-medium">
                  <span>Action Items</span>
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-head text-text tracking-tight tnum">
                    {pendingTasks.length}
                  </span>
                  <span className="text-xs text-muted">to execute</span>
                </div>
                <p className="mt-2 text-xs text-muted">
                  {verifiedTasks.length} improvements re-crawl verified
                </p>
              </div>

              {/* Card 4: Organic Growth */}
              <div className="bg-card p-5 rounded-xl border border-border shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between text-xs text-muted font-medium">
                  <span>Organic Search</span>
                  <span className="text-[11px] font-semibold text-primary font-mono">+14.2%</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-head text-text tracking-tight tnum">
                    142.8k
                  </span>
                  <span className="text-xs text-muted">impressions</span>
                </div>
                <p className="mt-2 text-xs text-muted">
                  Google Search Console (last 30 days)
                </p>
              </div>
            </div>

            {/* 2-Column Main Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (7 cols): Prioritized Tasks & Search Opportunities */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-card rounded-xl border border-border shadow-xs p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveTab('tasks')}
                        className={`text-xs font-bold pb-1 transition-colors border-b-2 ${
                          activeTab === 'tasks'
                            ? 'border-primary text-text'
                            : 'border-transparent text-muted hover:text-text'
                        }`}
                      >
                        Prioritized Fixes ({tasks.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('opportunities')}
                        className={`text-xs font-bold pb-1 transition-colors border-b-2 ${
                          activeTab === 'opportunities'
                            ? 'border-primary text-text'
                            : 'border-transparent text-muted hover:text-text'
                        }`}
                      >
                        Striking Distance ({opportunities.length})
                      </button>
                    </div>

                    <Link
                      href={activeTab === 'tasks' ? '/dashboard/action-center' : '/dashboard/opportunities'}
                      className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                    >
                      <span>View All</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {activeTab === 'tasks' ? (
                    <div className="divide-y divide-border">
                      {tasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="py-3 flex items-center justify-between gap-4">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                                  task.priority === 'critical'
                                    ? 'bg-red-50 text-error border border-red-200 dark:bg-red-950/40'
                                    : task.priority === 'high'
                                    ? 'bg-amber-50 text-warning border border-amber-200 dark:bg-amber-950/40'
                                    : 'bg-blue-50 text-accent border border-blue-200 dark:bg-blue-950/40'
                                }`}
                              >
                                {task.priority}
                              </span>
                              <h4 className="text-xs font-semibold text-text truncate">{task.title}</h4>
                            </div>
                            <p className="text-[11px] font-mono text-muted truncate">{task.affectedUrl}</p>
                          </div>

                          <Link
                            href={`/dashboard/action-center?task=${task.id}`}
                            className="px-3 py-1.5 rounded-md border border-border bg-bg hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium text-text transition-colors shrink-0"
                          >
                            Execute
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {opportunities.slice(0, 5).map((opp) => (
                        <div key={opp.id} className="py-3 flex items-center justify-between gap-4">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary-tint text-primary border border-emerald-200">
                                Pos {opp.position?.toFixed(1) || '—'}
                              </span>
                              <h4 className="text-xs font-semibold text-text truncate">{opp.query}</h4>
                            </div>
                            <p className="text-[11px] font-mono text-muted truncate">{opp.pageUrl}</p>
                          </div>

                          <span className="text-xs font-mono font-medium text-text tnum shrink-0">
                            {opp.impressions.toLocaleString()} impr
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column (5 cols): Performance Trend & Quick Actions */}
              <div className="lg:col-span-5 space-y-6">
                {/* Search Console Performance Graph */}
                <div className="bg-card rounded-xl border border-border shadow-xs p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-text">Organic Visibility Trend</h3>
                      <p className="text-[11px] text-muted">Daily Search Console impressions</p>
                    </div>
                    <Link
                      href="/dashboard/gsc"
                      className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                    >
                      <span>Deep Dive</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="h-44 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockGscTrends} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gscGreen" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            borderColor: '#E2E8F0',
                            borderRadius: '8px',
                            fontSize: '11px',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="impressions"
                          stroke="#059669"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#gscGreen)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Quick Audit Action Card */}
                <div className="bg-card rounded-xl border border-border shadow-xs p-5 space-y-3 flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-text">Audit Website Now</h3>
                    <p className="text-[11px] text-muted">
                      Run safe 30+ check crawler pass on {primaryWebsite?.name || 'domain'}.
                    </p>
                  </div>

                  <Link
                    href={`/dashboard/audits?websiteId=${primaryWebsite?.id || ''}`}
                    className="inline-flex items-center gap-1.5 h-9 px-4 bg-primary hover:bg-primary-hover text-white rounded-md text-xs font-medium transition-colors shrink-0 shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Audit</span>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
