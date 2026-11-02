'use client';

import React, { useState, useEffect } from 'react';
import DashboardHeader from '@/components/dashboard-header';
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
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isLoadingWebsites, setIsLoadingWebsites] = useState(true);
  const [planTier, setPlanTier] = useState<string>('free');
  const [maxWebsites, setMaxWebsites] = useState<number>(1);
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
            if (data.plan) setPlanTier(data.plan);
            if (typeof data.maxWebsites === 'number') setMaxWebsites(data.maxWebsites);
            const cleanWebsites = data.websites.filter(
              (w: Website) =>
                !['web-1', 'web-2', 'web-3'].includes(w.id) &&
                !['SaaSFlow Analytics', 'Nordic Clean Living', 'Zenith Legal Partners'].includes(w.name) &&
                !['saasflow.io', 'nordicclean.com', 'zenithlaw.co.uk'].includes(w.domain)
            );
            setWebsites(cleanWebsites);
          }
        }
      } catch (err) {
        console.error('Failed to load websites:', err);
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

      const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim();
      const cleanUrl = url.startsWith('http') ? url.trim() : `https://${url.trim()}`;

      const res = await fetch('/api/websites', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: name.trim(),
          domain: cleanDomain,
          url: cleanUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add website.');
      }

      setWebsites((prev) => [data.website, ...prev.filter((w) => w.id !== data.website.id)]);
      setIsAddModalOpen(false);
      setName('');
      setDomain('');
      setUrl('');
      setFormError('');

      // Dispatch global event for header selector
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('rankpilot-website-changed', { detail: { websiteId: data.website.id } }));
      }
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
      console.error('Delete error:', e);
    }
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
              Connected Client Websites ({websites.length} of {maxWebsites})
            </h2>
            <p className="text-xs text-muted flex items-center gap-1">
              <span>
                {websites.length >= maxWebsites
                  ? `Domain limit reached (${maxWebsites} max domains on ${planTier.toUpperCase()} Plan).`
                  : `Plan allowance: Up to ${maxWebsites} active client domains under ${planTier.toUpperCase()} Plan.`}
              </span>
              {websites.length >= maxWebsites && (
                <Link href="/pricing" className="text-primary hover:underline font-semibold ml-1">
                  Upgrade plan →
                </Link>
              )}
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
            <div className="w-14 h-14 rounded-full bg-primary-tint border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-center text-primary">
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
                          rel="noopener noreferrer"
                          className="text-xs text-muted hover:text-primary transition-colors flex items-center gap-1 mt-0.5 truncate"
                        >
                          <span>{site.domain}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => setDeleteTarget(site)}
                      className="p-1.5 text-muted hover:text-error hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors"
                      title="Delete website"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Score Badges */}
                  <div className="grid grid-cols-3 gap-2 mt-4 text-center font-mono">
                    <div className="p-2 rounded-md bg-bg border border-border">
                      <span className="text-[10px] font-sans text-muted block uppercase">SEO</span>
                      <span className="text-xs font-bold text-text tnum">
                        {site.latestSeoScore > 0 ? site.latestSeoScore : '—'}
                      </span>
                    </div>
                    <div className="p-2 rounded-md bg-bg border border-border">
                      <span className="text-[10px] font-sans text-muted block uppercase">GEO</span>
                      <span className="text-xs font-bold text-text tnum">
                        {site.latestGeoScore > 0 ? site.latestGeoScore : '—'}
                      </span>
                    </div>
                    <div className="p-2 rounded-md bg-bg border border-border">
                      <span className="text-[10px] font-sans text-muted block uppercase">AEO</span>
                      <span className="text-xs font-bold text-text tnum">
                        {site.latestAeoScore > 0 ? site.latestAeoScore : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-muted flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Active Domain</span>
                  </span>
                  <Link
                    href={`/dashboard/audits?websiteId=${site.id}`}
                    className="font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>Run Audit</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Website Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-card rounded-xl border border-border max-w-md w-full p-6 shadow-pop space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-head font-bold text-base text-text">Add Monitored Website</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted hover:text-text text-sm p-1"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-error flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddWebsite} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text block mb-1">
                  Website / Brand Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1">Domain Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. acme.com"
                  value={domain}
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase().trim();
                    setDomain(val);
                    if (!url) setUrl(`https://${val}`);
                  }}
                  className="w-full text-xs px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1">Full URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://acme.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full text-xs px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 h-9 rounded-md border border-border text-xs font-medium text-muted hover:text-text hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 h-9 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-medium shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Add Website</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-card rounded-xl border border-border max-w-sm w-full p-6 shadow-pop space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-error flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-head font-bold text-base text-text">Remove Website?</h3>
              <p className="text-xs text-muted">
                Are you sure you want to remove <span className="font-semibold text-text">{deleteTarget.name}</span>? This will stop monitoring this domain.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 h-9 rounded-md border border-border text-xs font-medium text-muted hover:text-text transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 h-9 rounded-md bg-error hover:bg-red-700 text-white text-xs font-medium shadow-xs transition-colors"
              >
                Delete Website
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
