'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-client';
import {
  Users,
  Globe,
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Server,
  Activity,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/overview');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const metrics = data?.metrics || {
    totalUsers: 0,
    totalWebsites: 0,
    totalAudits: 0,
    totalTasks: 0,
    criticalTasks: 0,
    avgSeoScore: 0,
    supabaseConnected: true,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-head text-text">RankPilot Superadmin Overview</h1>
          <p className="text-xs text-muted mt-1">
            Global operational oversight, Supabase database synchronization, and multi-tenant management
          </p>
        </div>
        <button
          onClick={fetchOverview}
          disabled={loading}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-card hover:bg-slate-50 border border-border text-text rounded-md text-xs font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-lg bg-card border border-border shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted font-sans">Total Registered Users</span>
            <div className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-text tnum">
            {metrics.totalUsers}
          </div>
          <div className="mt-2 text-[11px] text-muted flex items-center gap-1">
            <Link href="/admin/users" className="text-accent hover:underline flex items-center gap-0.5">
              <span>Manage users</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="p-5 rounded-lg bg-card border border-border shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted font-sans">Client Websites Monitored</span>
            <div className="w-8 h-8 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-text tnum">
            {metrics.totalWebsites}
          </div>
          <div className="mt-2 text-[11px] text-muted flex items-center gap-1">
            <Link href="/admin/websites" className="text-accent hover:underline flex items-center gap-0.5">
              <span>View all websites</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="p-5 rounded-lg bg-card border border-border shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted font-sans">Audits Completed</span>
            <div className="w-8 h-8 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
              <FileSearch className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-text tnum">
            {metrics.totalAudits}
          </div>
          <div className="mt-2 text-[11px] text-muted flex items-center gap-1">
            <Link href="/admin/audits" className="text-accent hover:underline flex items-center gap-0.5">
              <span>Audit logs</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="p-5 rounded-lg bg-card border border-border shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted font-sans">Avg SEO Score</span>
            <div className="w-8 h-8 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-text tnum">
            {metrics.avgSeoScore} / 100
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium">
            Across active agency portfolios
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Users & Recent Audits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registered Users */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-head text-text flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>Registered Accounts</span>
            </h2>
            <Link href="/admin/users" className="text-xs text-accent hover:underline font-medium">
              View All ({metrics.totalUsers}) →
            </Link>
          </div>

          <div className="divide-y divide-border">
            {data?.recentUsers?.map((u: any) => (
              <div key={u.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-text">{u.fullName || u.email}</div>
                  <div className="text-[11px] font-mono text-muted">{u.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    u.role === 'admin' || u.role === 'superadmin'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {u.role.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audits */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-head text-text flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-primary" />
              <span>Recent Audit Runs</span>
            </h2>
            <Link href="/admin/audits" className="text-xs text-accent hover:underline font-medium">
              View All ({metrics.totalAudits}) →
            </Link>
          </div>

          <div className="divide-y divide-border">
            {data?.recentAudits?.map((a: any) => (
              <div key={a.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-text flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Run: {a.id.slice(0, 16)}...</span>
                  </div>
                  <div className="text-[11px] font-mono text-muted">
                    {a.pagesCrawled} pages • {a.crawlDurationMs ? Math.round(a.crawlDurationMs / 1000) : 1}s
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs font-bold text-primary tnum">{a.seoScore} / 100</span>
                  <span className="block text-[10px] text-muted">SEO SCORE</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Log Stream */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold font-head text-text flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <span>Operational Activity Trail</span>
          </h2>
          <Link href="/admin/logs" className="text-xs text-accent hover:underline font-medium">
            Full Audit Logs →
          </Link>
        </div>

        <div className="space-y-2">
          {data?.recentLogs?.map((log: any, idx: number) => (
            <div key={log.id || idx} className="p-3 rounded-md bg-bg border border-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-slate-200 dark:bg-slate-800 text-text font-bold">
                  {log.action}
                </span>
                <span className="text-muted">Entity: <strong className="text-text font-mono">{log.entity_type}</strong></span>
              </div>
              <span className="text-[11px] font-mono text-muted">
                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
