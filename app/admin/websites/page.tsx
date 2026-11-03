'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-client';
import {
  Globe,
  ExternalLink,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  FileSearch
} from 'lucide-react';
import { Website } from '@/lib/types';

export default function AdminWebsitesPage() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchWebsites = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/websites');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.websites) {
          setWebsites(json.websites);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  const handleDelete = async (id: string, domain: string) => {
    if (!confirm(`Delete website property "${domain}"? This deletes all associated audits and action tasks.`)) {
      return;
    }
    try {
      const res = await adminFetch(`/api/admin/websites?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setWebsites(prev => prev.filter(w => w.id !== id));
      }
    } catch (e: any) {
      alert(`Failed to delete website: ${e.message}`);
    }
  };

  const filtered = websites.filter(w =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-head text-text">Client Websites Oversight</h1>
          <p className="text-xs text-muted mt-1">
            Global portfolio of all domains monitored by RankPilot AI across all tenant organizations
          </p>
        </div>
        <button
          onClick={fetchWebsites}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-card hover:bg-slate-50 border border-border text-text rounded-md text-xs font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Filter websites by property name or domain..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs pl-9 pr-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:border-primary"
        />
      </div>

      {/* Websites Table */}
      <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg border-b border-border text-[11px] font-semibold text-muted font-sans uppercase">
              <tr>
                <th className="px-5 py-3.5">Property Name / Domain</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-center">SEO Score</th>
                <th className="px-5 py-3.5 text-center">GEO Score</th>
                <th className="px-5 py-3.5 text-center">AEO Score</th>
                <th className="px-5 py-3.5">Last Audited</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-muted">
                    No websites found.
                  </td>
                </tr>
              ) : (
                filtered.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold font-head text-text">{w.name}</div>
                      <a
                        href={w.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-mono text-muted hover:text-primary flex items-center gap-1 mt-0.5"
                      >
                        <span>{w.domain}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {w.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center font-mono font-bold text-text tnum">
                      {w.latestSeoScore || 0}
                    </td>
                    <td className="px-5 py-4 text-center font-mono font-bold text-text tnum">
                      {w.latestGeoScore || 0}
                    </td>
                    <td className="px-5 py-4 text-center font-mono font-bold text-text tnum">
                      {w.latestAeoScore || 0}
                    </td>
                    <td className="px-5 py-4 text-muted font-mono text-[11px]">
                      {w.lastAuditedAt ? new Date(w.lastAuditedAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href="/dashboard/audits"
                          className="px-2.5 py-1 rounded-md border border-border text-[11px] font-medium text-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1"
                        >
                          <FileSearch className="w-3 h-3" />
                          <span>Audits</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(w.id, w.domain)}
                          className="p-1.5 text-muted hover:text-error rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Delete Website"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
