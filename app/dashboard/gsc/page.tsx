'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import DashboardHeader from '@/components/dashboard-header';
import { storage } from '@/lib/storage';
import { mockGscTrends } from '@/lib/mock-data';
import {
  Search,
  CheckCircle,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  ArrowRight,
  Filter,
  ShieldCheck,
  AlertCircle
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

export default function GscPage() {
  const websites = storage.getWebsites();
  const [selectedWebId, setSelectedWebId] = useState(websites[0]?.id || '');
  const [dateRange, setDateRange] = useState<'7' | '28' | '90'>('28');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'queries' | 'pages'>('queries');

  const primary = websites.find(w => w.id === selectedWebId) || websites[0];

  const handleSyncData = async () => {
    setIsSyncing(true);
    setSyncNotice(null);
    setSyncError(null);

    try {
      const res = await fetch('/api/gsc/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: primary.id,
          daysCount: parseInt(dateRange, 10),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to sync Search Console data.');
      }

      setSyncNotice(`Synced ${data.syncResult.recordsSynced} performance rows for ${data.syncResult.propertyUrl}. Discovered ${data.opportunitiesCount} opportunities.`);
      setTimeout(() => setSyncNotice(null), 5000);
      setIsSyncing(false);
    } catch (err: any) {
      setSyncError(err.message || 'Sync failed.');
      setIsSyncing(false);
    }
  };

  const sampleQueries = [
    { query: 'predictive churn modeling software', clicks: 340, imp: 14200, ctr: '2.39%', pos: 7.8, delta: '+4' },
    { query: 'saas metric dashboard templates', clicks: 290, imp: 28500, ctr: '1.01%', pos: 4.2, delta: '+2' },
    { query: 'customer retention metrics guide', clicks: 195, imp: 9800, ctr: '1.98%', pos: 6.1, delta: '-1' },
    { query: 'enterprise customer analytics platform', clicks: 480, imp: 8900, ctr: '5.39%', pos: 3.4, delta: '+1' },
    { query: 'saas ltv to cac ratio benchmarks', clicks: 230, imp: 5400, ctr: '4.25%', pos: 8.7, delta: '-' },
  ];

  const samplePages = [
    { page: `${primary?.url || 'https://saasflow.io'}/features/churn-prediction`, clicks: 480, imp: 18400, ctr: '2.61%', pos: 7.1, delta: '+3' },
    { page: `${primary?.url || 'https://saasflow.io'}/templates`, clicks: 320, imp: 31200, ctr: '1.02%', pos: 4.4, delta: '+1' },
    { page: `${primary?.url || 'https://saasflow.io'}/blog/customer-retention-metrics`, clicks: 210, imp: 11200, ctr: '1.87%', pos: 6.3, delta: '-2' },
    { page: `${primary?.url || 'https://saasflow.io'}/pricing`, clicks: 820, imp: 14500, ctr: '5.65%', pos: 1.9, delta: '-' },
  ];

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Google Search Console Intelligence"
        subtitle="Read-only OAuth integration, performance synchronization and query tracking"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Connection Status Card */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-accent-tint border border-blue-200 flex items-center justify-center text-accent">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold font-head text-text">Google Search Console Integration</h3>
                <span className="text-[10px] font-mono font-medium uppercase px-2 py-0.5 rounded-full bg-primary-tint text-primary border border-emerald-200 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Connected
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Target Property: <strong className="text-text font-mono">sc-domain:{primary?.domain}</strong> • Scope: webmasters.readonly
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {/* Date range switcher */}
            <div className="flex items-center bg-card border border-border rounded-md p-1 text-xs font-mono">
              <button
                onClick={() => setDateRange('7')}
                className={`px-3 py-1 rounded-sm transition-colors ${dateRange === '7' ? 'bg-primary text-white font-medium shadow-xs' : 'text-muted hover:text-text'}`}
              >
                7d
              </button>
              <button
                onClick={() => setDateRange('28')}
                className={`px-3 py-1 rounded-sm transition-colors ${dateRange === '28' ? 'bg-primary text-white font-medium shadow-xs' : 'text-muted hover:text-text'}`}
              >
                28d
              </button>
              <button
                onClick={() => setDateRange('90')}
                className={`px-3 py-1 rounded-sm transition-colors ${dateRange === '90' ? 'bg-primary text-white font-medium shadow-xs' : 'text-muted hover:text-text'}`}
              >
                90d
              </button>
            </div>

            <button
              onClick={handleSyncData}
              disabled={isSyncing}
              className="h-10 px-4 rounded-md border border-border bg-card hover:bg-slate-50 text-xs font-medium text-text flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-primary ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Search Data'}</span>
            </button>
          </div>
        </div>

        {/* Sync Success & Error Alerts */}
        {syncNotice && (
          <div className="p-3.5 rounded-md bg-primary-tint border border-emerald-200 text-xs text-primary flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              <span>{syncNotice}</span>
            </div>
            <Link href="/dashboard/opportunities" className="font-medium text-accent hover:underline">
              View Discovered Opportunities →
            </Link>
          </div>
        )}

        {syncError && (
          <div className="p-3.5 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-error flex items-center gap-2 shadow-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{syncError}</span>
          </div>
        )}

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-card p-5 rounded-lg border border-border shadow-card flex flex-col justify-between">
            <span className="text-xs font-medium text-muted">Total Clicks ({dateRange}d)</span>
            <span className="text-2xl font-bold font-mono text-text tracking-tight tnum mt-1 block">18,450</span>
            <span className="text-[11px] font-mono font-medium text-primary bg-primary-tint px-2 py-0.5 rounded-full inline-block mt-2 self-start border border-emerald-200/60">
              +14.2% vs prev
            </span>
          </div>

          <div className="bg-card p-5 rounded-lg border border-border shadow-card flex flex-col justify-between">
            <span className="text-xs font-medium text-muted">Total Impressions</span>
            <span className="text-2xl font-bold font-mono text-text tracking-tight tnum mt-1 block">342,000</span>
            <span className="text-[11px] font-mono font-medium text-primary bg-primary-tint px-2 py-0.5 rounded-full inline-block mt-2 self-start border border-emerald-200/60">
              +8.5% vs prev
            </span>
          </div>

          <div className="bg-card p-5 rounded-lg border border-border shadow-card flex flex-col justify-between">
            <span className="text-xs font-medium text-muted">Average CTR</span>
            <span className="text-2xl font-bold font-mono text-text tracking-tight tnum mt-1 block">5.39%</span>
            <span className="text-[11px] font-mono text-muted mt-2 block">
              Industry avg ~3.1%
            </span>
          </div>

          <div className="bg-card p-5 rounded-lg border border-border shadow-card flex flex-col justify-between">
            <span className="text-xs font-medium text-muted">Average Position</span>
            <span className="text-2xl font-bold font-mono text-text tracking-tight tnum mt-1 block">9.4</span>
            <span className="text-[11px] font-mono font-medium text-primary bg-primary-tint px-2 py-0.5 rounded-full inline-block mt-2 self-start border border-emerald-200/60">
              +1.8 positions
            </span>
          </div>
        </div>

        {/* Performance Trend Chart */}
        <div className="bg-card p-6 rounded-lg border border-border shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
            <div>
              <h3 className="text-base font-bold font-head text-text flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Search Console Daily Performance ({dateRange} Days)
              </h3>
              <p className="text-xs text-muted">
                3-day standard Google Search Console data latency accounted for
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
                  <linearGradient id="gscGreen" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#gscGreen)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clean Rank Tables: 48px rows, light gray header with 12px uppercase muted text */}
        <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('queries')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${activeTab === 'queries' ? 'bg-primary-tint text-primary border border-emerald-200' : 'text-muted hover:text-text'}`}
              >
                Top Organic Queries ({sampleQueries.length})
              </button>
              <button
                onClick={() => setActiveTab('pages')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${activeTab === 'pages' ? 'bg-primary-tint text-primary border border-emerald-200' : 'text-muted hover:text-text'}`}
              >
                Top Organic Landing Pages ({samplePages.length})
              </button>
            </div>
            <Link href="/dashboard/opportunities" className="text-xs font-medium text-accent hover:underline flex items-center gap-1">
              Find Opportunities <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeTab === 'queries' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs tnum">
                <thead className="bg-[#F8FAFC] dark:bg-slate-800/60 border-b border-border text-muted uppercase text-xs font-medium tracking-wider">
                  <tr className="h-12">
                    <th className="px-4">Search Query</th>
                    <th className="px-4 text-right">Clicks</th>
                    <th className="px-4 text-right">Impressions</th>
                    <th className="px-4 text-right">CTR</th>
                    <th className="px-4 text-right">Position</th>
                    <th className="px-4 text-right">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sampleQueries.map((q) => (
                    <tr key={q.query} className="h-12 hover:bg-[#F8FAFC] dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 font-medium text-text">{q.query}</td>
                      <td className="px-4 text-right font-mono font-bold text-text tnum">{q.clicks}</td>
                      <td className="px-4 text-right font-mono text-muted tnum">{q.imp.toLocaleString()}</td>
                      <td className="px-4 text-right font-mono text-text tnum">{q.ctr}</td>
                      <td className="px-4 text-right font-mono font-bold text-primary tnum">{q.pos}</td>
                      <td className="px-4 text-right font-mono text-xs">
                        {q.delta.startsWith('+') ? (
                          <span className="text-primary font-bold">{q.delta}</span>
                        ) : q.delta.startsWith('-') && q.delta !== '-' ? (
                          <span className="text-error font-bold">{q.delta}</span>
                        ) : (
                          <span className="text-muted font-bold">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs tnum">
                <thead className="bg-[#F8FAFC] dark:bg-slate-800/60 border-b border-border text-muted uppercase text-xs font-medium tracking-wider">
                  <tr className="h-12">
                    <th className="px-4">Landing Page URL</th>
                    <th className="px-4 text-right">Clicks</th>
                    <th className="px-4 text-right">Impressions</th>
                    <th className="px-4 text-right">CTR</th>
                    <th className="px-4 text-right">Position</th>
                    <th className="px-4 text-right">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {samplePages.map((p) => (
                    <tr key={p.page} className="h-12 hover:bg-[#F8FAFC] dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 font-mono text-xs text-text truncate max-w-sm">{p.page}</td>
                      <td className="px-4 text-right font-mono font-bold text-text tnum">{p.clicks}</td>
                      <td className="px-4 text-right font-mono text-muted tnum">{p.imp.toLocaleString()}</td>
                      <td className="px-4 text-right font-mono text-text tnum">{p.ctr}</td>
                      <td className="px-4 text-right font-mono font-bold text-primary tnum">{p.pos}</td>
                      <td className="px-4 text-right font-mono text-xs">
                        {p.delta.startsWith('+') ? (
                          <span className="text-primary font-bold">{p.delta}</span>
                        ) : p.delta.startsWith('-') && p.delta !== '-' ? (
                          <span className="text-error font-bold">{p.delta}</span>
                        ) : (
                          <span className="text-muted font-bold">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
