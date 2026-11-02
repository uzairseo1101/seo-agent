'use client';

import React, { useState, useEffect } from 'react';
import DashboardHeader from '@/components/dashboard-header';
import { storage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { Website } from '@/lib/types';
import {
  Globe,
  Plus,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
  Play,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function WebsitesManagementPage() {
  const [websites, setWebsites] = useState<Website[]>(() => {
    return storage.getWebsites().filter(
      (w) =>
        !['web-1', 'web-2', 'web-3'].includes(w.id) &&
        !['SaaSFlow Analytics', 'Nordic Clean Living', 'Zenith Legal Partners'].includes(w.name)
    );
  });
  const [isLoadingWebsites, setIsLoadingWebsites] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Website | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [url, setUrl] = useState('');
  const [formError, setFormError] = useState('');

  // Fetch websites from API on mount
  useEffect(() => {
    let mounted = true;
    const fetchWebsites = async () => {
      try {
        const { data: { session } } = (await supabase?.auth.getSession()) || { data: { session: null } };
        const headers: Record<string, string> = {};
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const res = await fetch('/api/websites', { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.websites) && mounted) {
            const cleanWebsites = data.websites.filter(
              (w: Website) =>
                !['web-1', 'web-2', 'web-3'].includes(w.id) &&
                !['SaaSFlow Analytics', 'Nordic Clean Living', 'Zenith Legal Partners'].includes(w.name) &&
                !['saasflow.io', 'nordicclean.com', 'zenithlaw.co.uk'].includes(w.domain)
            );
            setWebsites(cleanWebsites);
            // Sync clean list into local storage
            cleanWebsites.forEach((w: Website) => {
              storage.addWebsite(w);
            });
          }
        }
      } catch (err) {
        // Fallback to storage
      } finally {
        if (mounted) {
          setIsLoadingWebsites(false);
        }
      }
    };

    fetchWebsites();
    return () => {
      mounted = false;
    };
  }, []);

  const handleAddWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !domain.trim() || !url.trim()) {
      setFormError('All fields are required.');
      return;
    }

    setIsLoading(true);
    setFormError('');

    try {
      const { data: { session } } = (await supabase?.auth.getSession()) || { data: { session: null } };
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/websites', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: name.trim(), domain: domain.trim(), url: url.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add website.');
      }

      // Sync into local client storage cache
      storage.addWebsite({
        id: data.website.id,
        name: data.website.name,
        domain: data.website.domain,
        url: data.website.url,
      });

      setWebsites((prev) => [data.website, ...prev.filter((w) => w.id !== data.website.id)]);
      setIsAddModalOpen(false);
      setName('');
      setDomain('');
      setUrl('');
      setFormError('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to add website.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { data: { session } } = (await supabase?.auth.getSession()) || { data: { session: null } };
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      await fetch(`/api/websites?id=${deleteTarget.id}`, { method: 'DELETE', headers });
    } catch (e) {
      // Continue client cleanup
    }
    storage.deleteWebsite(deleteTarget.id);
    setWebsites((prev) => prev.filter((w) => w.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Websites Management"
        subtitle="Configure monitored client properties, crawler boundaries and data connections"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold font-head text-text">
              Connected Client Websites ({websites.length})
            </h2>
            <p className="text-xs text-muted">
              Organization limit: 15 active domains under Agency Plan
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 h-10 px-4 bg-primary hover:bg-primary-hover text-white rounded-md text-xs font-medium shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Website</span>
          </button>
        </div>

        {/* Loading State */}
        {isLoadingWebsites && websites.length === 0 && (
          <div className="bg-card rounded-lg border border-border p-12 text-center shadow-card flex flex-col items-center justify-center">
            <Loader2 className="w-7 h-7 text-primary animate-spin mb-3" />
            <p className="text-xs text-muted">Loading connected websites from Supabase...</p>
          </div>
        )}

        {/* Zero State / Empty State */}
        {!isLoadingWebsites && websites.length === 0 && (
          <div className="bg-card rounded-lg border border-dashed border-border p-12 text-center shadow-card flex flex-col items-center justify-center max-w-2xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-full bg-primary-tint border border-emerald-200 flex items-center justify-center text-primary">
              <Globe className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold font-head text-text">
                No client websites connected yet
              </h3>
              <p className="text-xs text-muted max-w-md mx-auto">
                Connect your first client domain to run automated technical SEO audits, GEO AI citations checks, and track Google Search Console improvements.
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 h-10 px-5 bg-primary hover:bg-primary-hover text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Connect Your First Website</span>
            </button>
          </div>
        )}

        {/* Websites Grid */}
        {websites.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {websites.map((site) => (
              <div
                key={site.id}
                className="bg-card rounded-xl border border-border p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary-tint border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold font-head text-text truncate">{site.name}</h3>
                        <a
                          href={site.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-mono text-muted hover:text-primary flex items-center gap-1 truncate"
                        >
                          <span className="truncate">{site.domain}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-900/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                      <button
                        onClick={() => setDeleteTarget(site)}
                        className="p-1.5 text-muted hover:text-error rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Delete website"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Clean Horizontal Scores */}
                  <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-lg bg-bg border border-border/80">
                      <span className="text-[11px] text-muted block mb-0.5">SEO Health</span>
                      <span className="text-base font-bold font-head text-text tnum">{site.latestSeoScore || 0}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-bg border border-border/80">
                      <span className="text-[11px] text-muted block mb-0.5">GEO Entity</span>
                      <span className="text-base font-bold font-head text-text tnum">{site.latestGeoScore || 0}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-bg border border-border/80">
                      <span className="text-[11px] text-muted block mb-0.5">AEO Answer</span>
                      <span className="text-base font-bold font-head text-text tnum">{site.latestAeoScore || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <Link
                    href={`/dashboard/audits?websiteId=${site.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Run Audit</span>
                  </Link>

                  <Link
                    href={`/dashboard/audits?websiteId=${site.id}`}
                    className="text-xs font-medium text-accent hover:underline flex items-center gap-1"
                  >
                    <span>View Findings</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Website Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card rounded-lg border border-border max-w-md w-full p-6 shadow-pop animate-in fade-in space-y-4">
            <h3 className="text-base font-bold font-head text-text">Add Monitored Website</h3>
            <p className="text-xs text-muted">
              Enter target domain details. The safe crawler will immediately validate DNS and verify access boundaries.
            </p>

            {formError && (
              <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-error flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddWebsite} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text block mb-1">Website Name</label>
                <input
                  type="text"
                  placeholder="e.g. My Client Store"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 bg-bg border border-border rounded-md text-xs text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1">Domain</label>
                <input
                  type="text"
                  placeholder="e.g. example.com"
                  value={domain}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim();
                    setDomain(clean);
                    if (!url || url.includes(domain)) {
                      setUrl(clean ? `https://${clean}` : '');
                    }
                  }}
                  className="w-full h-10 px-3 bg-bg border border-border rounded-md text-xs font-mono text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1">Full Root URL</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full h-10 px-3 bg-bg border border-border rounded-md text-xs font-mono text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setFormError('');
                  }}
                  className="h-9 px-4 border border-border bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-muted hover:text-text rounded-md text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="h-9 px-4 bg-primary hover:bg-primary-hover text-white rounded-md text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isLoading ? 'Saving...' : 'Save Website'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card rounded-lg border border-border max-w-sm w-full p-6 shadow-pop animate-in fade-in space-y-4">
            <div className="flex items-center gap-3 text-error">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-base font-bold font-head text-text">Remove Website?</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Are you sure you want to remove <strong className="text-text">{deleteTarget.name}</strong> ({deleteTarget.domain})? This will uncouple audits, crawler boundaries, and verification tracking.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="h-9 px-3 border border-border bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-muted hover:text-text rounded-md text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="h-9 px-4 bg-error hover:bg-red-600 text-white rounded-md text-xs font-medium transition-colors"
              >
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
