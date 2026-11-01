'use client';

import React, { useState } from 'react';
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
  BarChart,
  Bar
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
    { query: 'predictive churn modeling software', clicks: 340, imp: 14200, ctr: '2.39%', pos: 7.8 },
    { query: 'saas metric dashboard templates', clicks: 290, imp: 28500, ctr: '1.01%', pos: 4.2 },
    { query: 'customer retention metrics guide', clicks: 195, imp: 9800, ctr: '1.98%', pos: 6.1 },
    { query: 'enterprise customer analytics platform', clicks: 480, imp: 8900, ctr: '5.39%', pos: 3.4 },
    { query: 'saas ltv to cac ratio benchmarks', clicks: 230, imp: 5400, ctr: '4.25%', pos: 8.7 },
  ];

  const samplePages = [
    { page: `${primary?.url || 'https://saasflow.io'}/features/churn-prediction`, clicks: 480, imp: 18400, ctr: '2.61%', pos: 7.1 },
    { page: `${primary?.url || 'https://saasflow.io'}/templates`, clicks: 320, imp: 31200, ctr: '1.02%', pos: 4.4 },
    { page: `${primary?.url || 'https://saasflow.io'}/blog/customer-retention-metrics`, clicks: 210, imp: 11200, ctr: '1.87%', pos: 6.3 },
    { page: `${primary?.url || 'https://saasflow.io'}/pricing`, clicks: 820, imp: 14500, ctr: '5.65%', pos: 1.9 },
  ];

  return (
    <div>
      <DashboardHeader
        title="Google Search Console Intelligence"
        subtitle="Read-only OAuth integration, performance synchronization and query tracking"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Connection Status Card */}
        <div className="bg-white rounded-xl border border-surface-border p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-navy">Google Search Console Integration</h3>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Connected (Safe Fixture Mode)
                </span>
              </div>
              <p className="text-xs text-surface-muted mt-0.5">
                Target Property: <strong className="text-navy">sc-domain:{primary?.domain}</strong> • Scope: webmasters.readonly
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {/* Date range switcher */}
            <div className="flex items-center bg-surface-bg border border-surface-border rounded-lg p-1 text-xs font-semibold">
              <button
                onClick={() => setDateRange('7')}
                className={`px-2.5 py-1 rounded-md transition-colors ${dateRange === '7' ? 'bg-white text-navy shadow-xs font-bold' : 'text-surface-muted hover:text-navy'}`}
              >
                7 Days
              </button>
              <button
                onClick={() => setDateRange('28')}
                className={`px-2.5 py-1 rounded-md transition-colors ${dateRange === '28' ? 'bg-white text-navy shadow-xs font-bold' : 'text-surface-muted hover:text-navy'}`}
              >
                28 Days
              </button>
              <button
                onClick={() => setDateRange('90')}
                className={`px-2.5 py-1 rounded-md transition-colors ${dateRange === '90' ? 'bg-white text-navy shadow-xs font-bold' : 'text-surface-muted hover:text-navy'}`}
              >
                3 Months
              </button>
            </div>

            <button
              onClick={handleSyncData}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-lg border border-surface-border text-xs font-semibold text-navy hover:bg-slate-50 flex items-center gap-1.5 transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-brand-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Search Data'}</span>
            </button>
          </div>
        </div>

        {/* Sync Success & Error Alerts */}
        {syncNotice && (
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{syncNotice}</span>
            </div>
            <a href="/dashboard/opportunities" className="font-semibold text-emerald-900 underline hover:no-underline">
              View Discovered Opportunities →
            </a>
          </div>
        )}

        {syncError && (
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 shadow-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{syncError}</span>
          </div>
        )}

        {/* 4 Overview Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-surface-border shadow-sm">
            <span className="text-xs font-semibold text-surface-muted">Total Clicks ({dateRange}d)</span>
            <span className="text-2xl font-extrabold text-navy mt-1 block">18,450</span>
            <span className="text-[11px] text-emerald-600 font-medium">+14.2% vs previous period</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-surface-border shadow-sm">
            <span className="text-xs font-semibold text-surface-muted">Total Impressions</span>
            <span className="text-2xl font-extrabold text-navy mt-1 block">342,000</span>
            <span className="text-[11px] text-emerald-600 font-medium">+8.5% vs previous period</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-surface-border shadow-sm">
            <span className="text-xs font-semibold text-surface-muted">Average CTR</span>
            <span className="text-2xl font-extrabold text-navy mt-1 block">5.39%</span>
            <span className="text-[11px] text-surface-muted font-medium">Industry avg ~3.1%</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-surface-border shadow-sm">
            <span className="text-xs font-semibold text-surface-muted">Average Position</span>
            <span className="text-2xl font-extrabold text-navy mt-1 block">9.4</span>
            <span className="text-[11px] text-emerald-600 font-medium">+1.8 positions improved</span>
          </div>
        </div>

        {/* Performance Trend Chart */}
        <div className="bg-white p-6 rounded-xl border border-surface-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-600" />
                Search Console Daily Performance ({dateRange} Days)
              </h3>
              <p className="text-xs text-surface-muted">
                3-day standard Google Search Console data latency accounted for
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
                  <linearGradient id="gscClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="clicks" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#gscClicks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Query & Page Performance Breakdown Tables */}
        <div className="bg-white rounded-xl border border-surface-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('queries')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'queries' ? 'bg-indigo-50 text-brand-700' : 'text-surface-muted hover:text-navy'}`}
              >
                Top Organic Queries ({sampleQueries.length})
              </button>
              <button
                onClick={() => setActiveTab('pages')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'pages' ? 'bg-indigo-50 text-brand-700' : 'text-surface-muted hover:text-navy'}`}
              >
                Top Organic Landing Pages ({samplePages.length})
              </button>
            </div>
            <a href="/dashboard/opportunities" className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1">
              Find Opportunities <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {activeTab === 'queries' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-bg border-b border-surface-border text-surface-muted uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Search Query</th>
                    <th className="py-3 px-4 text-right">Clicks</th>
                    <th className="py-3 px-4 text-right">Impressions</th>
                    <th className="py-3 px-4 text-right">CTR</th>
                    <th className="py-3 px-4 text-right">Position</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {sampleQueries.map((q) => (
                    <tr key={q.query} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-navy">{q.query}</td>
                      <td className="py-3 px-4 text-right font-bold text-navy">{q.clicks}</td>
                      <td className="py-3 px-4 text-right text-surface-muted">{q.imp.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-medium text-navy">{q.ctr}</td>
                      <td className="py-3 px-4 text-right font-bold text-brand-700">{q.pos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-bg border-b border-surface-border text-surface-muted uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Landing Page URL</th>
                    <th className="py-3 px-4 text-right">Clicks</th>
                    <th className="py-3 px-4 text-right">Impressions</th>
                    <th className="py-3 px-4 text-right">CTR</th>
                    <th className="py-3 px-4 text-right">Position</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {samplePages.map((p) => (
                    <tr key={p.page} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-navy truncate max-w-sm">{p.page}</td>
                      <td className="py-3 px-4 text-right font-bold text-navy">{p.clicks}</td>
                      <td className="py-3 px-4 text-right text-surface-muted">{p.imp.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-medium text-navy">{p.ctr}</td>
                      <td className="py-3 px-4 text-right font-bold text-brand-700">{p.pos}</td>
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
