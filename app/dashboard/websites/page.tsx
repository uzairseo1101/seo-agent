'use client';

import React, { useState } from 'react';
import DashboardHeader from '@/components/dashboard-header';
import { storage } from '@/lib/storage';
import { Website } from '@/lib/types';
import {
  Globe,
  Plus,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function WebsitesManagementPage() {
  const [websites, setWebsites] = useState<Website[]>(storage.getWebsites());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Website | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [url, setUrl] = useState('');
  const [formError, setFormError] = useState('');

  const handleAddWebsite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !domain.trim() || !url.trim()) {
      setFormError('All fields are required.');
      return;
    }

    try {
      const added = storage.addWebsite({ name, domain, url });
      setWebsites([...storage.getWebsites()]);
      setIsAddModalOpen(false);
      setName('');
      setDomain('');
      setUrl('');
      setFormError('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to add website.');
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    storage.deleteWebsite(deleteTarget.id);
    setWebsites([...storage.getWebsites()]);
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
            <h2 className="text-base font-bold font-head text-text">Connected Client Websites ({websites.length})</h2>
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

        {/* Websites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websites.map((site) => (
            <div
              key={site.id}
              className="bg-card rounded-lg border border-border p-6 shadow-card hover:border-slate-300 transition-colors flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-md bg-primary-tint border border-emerald-200 flex items-center justify-center text-primary font-bold text-sm">
                      <Globe className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold font-head text-text">{site.name}</h3>
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-mono text-muted hover:text-primary flex items-center gap-1"
                      >
                        <span>{site.domain}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <button
                    onClick={() => setDeleteTarget(site)}
                    className="p-1.5 text-muted hover:text-error rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="Delete website"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Score Pills */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="p-2 bg-bg rounded-md border border-border">
                    <span className="text-[10px] text-muted block uppercase font-sans">SEO</span>
                    <span className="text-sm font-bold text-text tnum">{site.latestSeoScore}</span>
                  </div>
                  <div className="p-2 bg-bg rounded-md border border-border">
                    <span className="text-[10px] text-muted block uppercase font-sans">GEO</span>
                    <span className="text-sm font-bold text-text tnum">{site.latestGeoScore}</span>
                  </div>
                  <div className="p-2 bg-bg rounded-md border border-border">
                    <span className="text-[10px] text-muted block uppercase font-sans">AEO</span>
                    <span className="text-sm font-bold text-text tnum">{site.latestAeoScore}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-mono">
                <span className="text-muted">
                  GSC: <strong className="text-text font-sans">Connected</strong>
                </span>
                <Link
                  href="/dashboard/audits"
                  className="text-accent hover:underline font-medium font-sans"
                >
                  View Audits →
                </Link>
              </div>
            </div>
          ))}
        </div>
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
                  required
                  placeholder="e.g. Acme Corporation"
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
                  placeholder="acme.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full text-xs px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1">Full Root URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://acme.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full text-xs px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 h-10 text-xs font-medium text-muted hover:text-text rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 h-10 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-md shadow-xs transition-colors"
                >
                  Add Website
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Destructive Danger style) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card rounded-lg border border-border max-w-md w-full p-6 shadow-pop animate-in fade-in space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-50 text-error flex items-center justify-center border border-red-200">
              <ShieldAlert className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold font-head text-text">
              Delete {deleteTarget.name}?
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Are you sure you want to remove <strong className="text-text font-mono">{deleteTarget.domain}</strong>? This action will permanently remove associated historical audits, findings, and verification tasks.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 h-10 text-xs font-medium text-muted hover:text-text rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 h-10 text-xs font-medium text-error bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors"
              >
                Yes, Delete Website
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
