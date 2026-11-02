'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileSearch,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { AuditRun } from '@/lib/types';

export default function AdminAuditsPage() {
  const [audits, setAudits] = useState<AuditRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/audits');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.audits) {
          setAudits(json.audits);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const filtered = audits.filter(a =>
    a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.websiteId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-head text-text">Audit Runs & Crawler Health</h1>
          <p className="text-xs text-muted mt-1">
            Global operational log of all automated Cheerio crawl evaluations, scoring executions, and runtimes
          </p>
        </div>
        <button
          onClick={fetchAudits}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-card hover:bg-slate-50 border border-border text-text rounded-md text-xs font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
          <span>Refresh Audits</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Filter audits by Run ID or Website ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs pl-9 pr-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:border-primary"
        />
      </div>

      {/* Audits Table */}
      <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg border-b border-border text-[11px] font-semibold text-muted font-sans uppercase">
              <tr>
                <th className="px-5 py-3.5">Audit Run ID / Target</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-center">Pages Crawled</th>
                <th className="px-5 py-3.5 text-center">SEO Score</th>
                <th className="px-5 py-3.5 text-center">GEO Score</th>
                <th className="px-5 py-3.5 text-center">AEO Score</th>
                <th className="px-5 py-3.5">Runtime</th>
                <th className="px-5 py-3.5">Executed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-muted">
                    No audits found.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-mono font-bold text-text flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>{a.id}</span>
                      </div>
                      <div className="text-[10px] text-muted font-mono mt-0.5">
                        Website ID: {a.websiteId}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {a.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center font-mono font-bold text-text tnum">
                      {a.pagesCrawled}
                    </td>
                    <td className="px-5 py-4 text-center font-mono font-bold text-primary tnum">
                      {a.seoScore}
                    </td>
                    <td className="px-5 py-4 text-center font-mono font-bold text-text tnum">
                      {a.geoScore}
                    </td>
                    <td className="px-5 py-4 text-center font-mono font-bold text-text tnum">
                      {a.aeoScore}
                    </td>
                    <td className="px-5 py-4 font-mono text-muted text-[11px]">
                      {a.crawlDurationMs ? `${(a.crawlDurationMs / 1000).toFixed(1)}s` : '1.2s'}
                    </td>
                    <td className="px-5 py-4 text-muted font-mono text-[11px]">
                      {new Date(a.startedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
