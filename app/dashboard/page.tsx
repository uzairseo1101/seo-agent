'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/dashboard-header';
import { supabase } from '@/lib/supabase';
import { Website, AuditFinding, SeoOpportunity, ActionItem } from '@/lib/types';
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
  ArrowUpRight,
  Loader2
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [findings, setFindings] = useState<AuditFinding[]>([]);
  const [opportunities, setOpportunities] = useState<SeoOpportunity[]>([]);
  const [tasks, setTasks] = useState<ActionItem[]>([]);
  const [activeTab, setActiveTab] = useState<'tasks' | 'opportunities'>('tasks');
  const [showChecklist, setShowChecklist] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('rankpilot_dismiss_onboarding');
      if (dismissed === 'true' && !window.location.search.includes('welcome=true')) {
        setShowChecklist(false);
      }
    }
  }, []);

  const handleDismissChecklist = () => {
    setShowChecklist(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rankpilot_dismiss_onboarding', 'true');
    }
  };

  useEffect(() => {
    let mounted = true;
    const syncData = async () => {
      try {
        const { data: { session } } = (await supabase?.auth.getSession()) || { data: { session: null } };
        const headers: Record<string, string> = {};
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const [webRes, taskRes, auditRes] = await Promise.all([
          fetch('/api/websites', { headers }),
          fetch('/api/tasks', { headers }),
          fetch('/api/audits', { headers }),
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
          if (taskJson.success && Array.isArray(taskJson.tasks)) {
            setTasks(taskJson.tasks);
          }
        }

        if (auditRes.ok && mounted) {
          const auditJson = await auditRes.json();
          if (auditJson.success && Array.isArray(auditJson.findings)) {
            setFindings(auditJson.findings);
          }
        }
      } catch (e) {
        console.error('Dashboard data sync error:', e);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
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

  const hasAudited = primaryWebsite && (primaryWebsite.latestSeoScore > 0 || findings.length > 0);

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Dashboard"
        subtitle={primaryWebsite ? `Monitoring ${primaryWebsite.name} (${primaryWebsite.domain})` : 'AI SEO Intelligence and Multi-Domain Action Center'}
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Loading Spinner */}
        {isLoading && websites.length === 0 && (
          <div className="bg-card rounded-xl border border-border p-12 text-center shadow-xs flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
            <p className="text-xs text-muted">Loading workspace intelligence...</p>
          </div>
        )}

        {/* Clean Zero State if No Websites Connected */}
        {!isLoading && websites.length === 0 && (
          <div className="bg-card rounded-xl border border-dashed border-border p-12 text-center shadow-card flex flex-col items-center justify-center max-w-xl mx-auto space-y-5">
            <div className="w-14 h-14 rounded-full bg-primary-tint border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-center text-primary">
              <Globe className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold font-head text-text">Welcome to RankPilot AI</h3>
              <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
                Your dedicated SEO intelligence workspace is ready. Connect your first client domain to run automated audits, uncover GEO/AEO gaps, and track Search Console rankings.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/dashboard/websites"
                className="inline-flex items-center justify-center gap-1.5 h-10 px-5 bg-primary hover:bg-primary-hover text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Connect Your First Website</span>
              </Link>
              <Link
                href="/dashboard/gsc"
                className="inline-flex items-center justify-center gap-1.5 h-10 px-4 bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-text border border-border rounded-md text-xs font-medium transition-colors"
              >
                <Search className="w-4 h-4 text-muted" />
                <span>Connect Search Console</span>
              </Link>
            </div>
          </div>
        )}

        {/* Normal Dashboard View when Websites are Connected */}
        {websites.length > 0 && (
          <>
            {/* First-Time Onboarding Experience Checklist */}
            {showChecklist && (
              <div className="bg-card rounded-xl border border-primary/20 bg-gradient-to-r from-primary-tint/20 via-card to-card p-5 shadow-card space-y-4 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-head font-bold text-sm text-text">
                        Welcome to RankPilot AI — Getting Started Checklist
                      </h3>
                      <p className="text-xs text-muted">
                        Follow these 6 steps to turn audit findings into ranked results.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-primary">
                      {Math.round(([true, websites.length > 0, hasAudited, false, opportunities.length > 0, tasks.length > 0].filter(Boolean).length / 6) * 100)}% Complete
                    </span>
                    <button
                      onClick={handleDismissChecklist}
                      className="text-xs text-muted hover:text-text px-2 py-1 rounded transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-border/60">
                  {/* Step 1: Account & Plan */}
                  <div className="p-3 rounded-lg bg-card border border-emerald-200 dark:border-emerald-900/40 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-text">1. Workspace Initialized</span>
                      <p className="text-[11px] text-muted">Isolated personal workspace ready.</p>
                    </div>
                  </div>

                  {/* Step 2: Add Website */}
                  <Link
                    href="/dashboard/websites"
                    className="p-3 rounded-lg bg-card border border-emerald-200 dark:border-emerald-900/40 flex items-start gap-2.5 text-text"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold">2. Website Connected</span>
                      <p className="text-[11px] text-muted">
                        {websites.length} domain(s) monitored
                      </p>
                    </div>
                  </Link>

                  {/* Step 3: Run Audit */}
                  <Link
                    href="/dashboard/audits"
                    className={`p-3 rounded-lg border transition-all flex items-start gap-2.5 ${
                      hasAudited
                        ? 'bg-card border-emerald-200 dark:border-emerald-900/40 text-text'
                        : 'bg-card border-border hover:border-primary text-text'
                    }`}
                  >
                    {hasAudited ? (
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-muted shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold">3. Run First SEO Audit</span>
                      <p className="text-[11px] text-muted">
                        {hasAudited ? `${findings.length} findings identified` : 'Launch crawler →'}
                      </p>
                    </div>
                  </Link>

                  {/* Step 4: GSC OAuth */}
                  <Link
                    href="/dashboard/gsc"
                    className="p-3 rounded-lg bg-card border border-border hover:border-primary transition-all flex items-start gap-2.5 text-text"
                  >
                    <div className="w-4 h-4 rounded-full border-2 border-muted shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold">4. Connect Search Console</span>
                      <p className="text-[11px] text-muted">Sync impressions, clicks, CTR →</p>
                    </div>
                  </Link>

                  {/* Step 5: Opportunities */}
                  <Link
                    href="/dashboard/opportunities"
                    className={`p-3 rounded-lg border transition-all flex items-start gap-2.5 ${
                      opportunities.length > 0
                        ? 'bg-card border-emerald-200 dark:border-emerald-900/40 text-text'
                        : 'bg-card border-border hover:border-primary text-text'
                    }`}
                  >
                    {opportunities.length > 0 ? (
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-muted shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold">5. Review Opportunities</span>
                      <p className="text-[11px] text-muted">Striking distance positions 11-20 →</p>
                    </div>
                  </Link>

                  {/* Step 6: Create Action Items */}
                  <Link
                    href="/dashboard/action-center"
                    className={`p-3 rounded-lg border transition-all flex items-start gap-2.5 ${
                      tasks.length > 0
                        ? 'bg-card border-emerald-200 dark:border-emerald-900/40 text-text'
                        : 'bg-card border-border hover:border-primary text-text'
                    }`}
                  >
                    {tasks.length > 0 ? (
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-muted shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold">6. Create Action Items</span>
                      <p className="text-[11px] text-muted">
                        {tasks.length > 0 ? `${tasks.length} task(s) active` : 'Assign fixes to execute →'}
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            )}

            {/* Top 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: SEO Score */}
              <div className="bg-card p-5 rounded-xl border border-border shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between text-xs text-muted font-medium">
                  <span>SEO Health Score</span>
                  <span className={`w-2 h-2 rounded-full ${hasAudited ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-head text-text tracking-tight tnum">
                    {hasAudited ? primaryWebsite.latestSeoScore : '—'}
                  </span>
                  {hasAudited && <span className="text-xs text-muted">/ 100</span>}
                </div>
                <p className="mt-2 text-xs text-muted">
                  {hasAudited ? 'Technical, content & indexability factors' : (
                    <Link href={`/dashboard/audits?websiteId=${primaryWebsite?.id}`} className="text-primary hover:underline font-medium">
                      Run first audit →
                    </Link>
                  )}
                </p>
              </div>

              {/* Card 2: AI Visibility */}
              <div className="bg-card p-5 rounded-xl border border-border shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between text-xs text-muted font-medium">
                  <span>AI Engine Visibility</span>
                  <span className={`w-2 h-2 rounded-full ${hasAudited ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-head text-text tracking-tight tnum">
                    {hasAudited ? Math.round(((primaryWebsite.latestGeoScore || 0) + (primaryWebsite.latestAeoScore || 0)) / 2) : '—'}
                  </span>
                  {hasAudited && <span className="text-xs text-muted">/ 100</span>}
                </div>
                <p className="mt-2 text-xs text-muted">
                  {hasAudited ? 'GEO entity graph & AEO schema readiness' : (
                    <Link href={`/dashboard/audits?websiteId=${primaryWebsite?.id}`} className="text-primary hover:underline font-medium">
                      Run AI engine audit →
                    </Link>
                  )}
                </p>
              </div>

              {/* Card 3: Action Items */}
              <div className="bg-card p-5 rounded-xl border border-border shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between text-xs text-muted font-medium">
                  <span>Action Items</span>
                  <span className={`w-2 h-2 rounded-full ${pendingTasks.length > 0 ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-head text-text tracking-tight tnum">
                    {pendingTasks.length}
                  </span>
                  <span className="text-xs text-muted">to execute</span>
                </div>
                <p className="mt-2 text-xs text-muted">
                  {verifiedTasks.length > 0 ? `${verifiedTasks.length} improvements re-crawl verified` : (
                    <Link href="/dashboard/action-center" className="text-primary hover:underline font-medium">
                      Manage tasks in Action Center →
                    </Link>
                  )}
                </p>
              </div>

              {/* Card 4: Organic Growth (Search Console) */}
              <div className="bg-card p-5 rounded-xl border border-border shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between text-xs text-muted font-medium">
                  <span>Organic Search</span>
                  <span className="text-[11px] font-semibold text-muted font-mono">GSC</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-head text-text tracking-tight tnum">
                    —
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted">
                  <Link href="/dashboard/gsc" className="text-primary hover:underline font-medium">
                    Connect Search Console →
                  </Link>
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

                  {/* Tasks List */}
                  {activeTab === 'tasks' && (
                    <div className="space-y-2.5">
                      {tasks.length === 0 ? (
                        <div className="p-8 text-center border border-dashed border-border rounded-lg space-y-2">
                          <p className="text-xs text-muted">No action items created yet.</p>
                          <Link
                            href="/dashboard/audits"
                            className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                          >
                            <span>Run an audit to generate prioritized action items</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      ) : (
                        tasks.slice(0, 5).map((task) => (
                          <div
                            key={task.id}
                            className="p-3 rounded-lg border border-border bg-bg/50 hover:bg-bg transition-colors flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  task.priority === 'critical'
                                    ? 'bg-red-500'
                                    : task.priority === 'high'
                                    ? 'bg-amber-500'
                                    : 'bg-blue-500'
                                }`}
                              />
                              <div className="min-w-0">
                                <span className="font-semibold text-text truncate block">{task.title}</span>
                                <span className="text-[10px] text-muted truncate block">{task.category}</span>
                              </div>
                            </div>
                            <span className="text-[11px] font-mono text-muted capitalize shrink-0">
                              {task.status.replace('_', ' ')}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Opportunities List */}
                  {activeTab === 'opportunities' && (
                    <div className="space-y-2.5">
                      {opportunities.length === 0 ? (
                        <div className="p-8 text-center border border-dashed border-border rounded-lg space-y-2">
                          <p className="text-xs text-muted">No striking distance opportunities detected yet.</p>
                          <Link
                            href="/dashboard/gsc"
                            className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                          >
                            <span>Connect Google Search Console to detect quick wins</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      ) : (
                        opportunities.slice(0, 5).map((opp) => (
                          <div
                            key={opp.id}
                            className="p-3 rounded-lg border border-border bg-bg/50 hover:bg-bg transition-colors flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0">
                              <span className="font-semibold text-text truncate block">{opp.query}</span>
                              <span className="text-[10px] text-muted">Position {opp.position.toFixed(1)}</span>
                            </div>
                            <span className="font-mono text-xs font-bold text-primary">
                              {opp.impressions.toLocaleString()} imp
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column (5 cols): Crawler Intelligence & Quick Actions */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-card rounded-xl border border-border shadow-xs p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold font-head text-text uppercase tracking-wider">
                      Crawler Intelligence
                    </h3>
                    <Link
                      href="/dashboard/audits"
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>New Audit</span>
                      <Plus className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-bg border border-border flex items-center justify-between text-xs">
                      <span className="text-muted">Total Findings Identified</span>
                      <span className="font-bold text-text font-mono">{findings.length}</span>
                    </div>

                    <div className="p-3 rounded-lg bg-bg border border-border flex items-center justify-between text-xs">
                      <span className="text-muted">Critical Issues</span>
                      <span className="font-bold text-red-600 font-mono">
                        {findings.filter((f) => f.severity === 'critical').length}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-bg border border-border flex items-center justify-between text-xs">
                      <span className="text-muted">Warning / High Priority</span>
                      <span className="font-bold text-amber-600 font-mono">
                        {findings.filter((f) => f.severity === 'high').length}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/dashboard/audits?websiteId=${primaryWebsite?.id}`}
                      className="w-full h-9 bg-primary hover:bg-primary-hover text-white text-xs font-medium rounded-md shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Launch Full Domain Audit</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
