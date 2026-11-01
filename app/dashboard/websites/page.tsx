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
    <div>
      <DashboardHeader
        title="Websites Management"
        subtitle="Configure monitored client properties, crawler boundaries and data connections"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-navy">Connected Client Websites ({websites.length})</h2>
            <p className="text-xs text-surface-muted">
              Organization limit: 15 active domains under Agency Plan
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
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
              className="bg-white rounded-xl border border-surface-border p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-brand-600 font-bold text-sm">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-navy">{site.name}</h3>
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-surface-muted hover:text-brand-600 flex items-center gap-1"
                      >
                        {site.domain}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {site.status}
                  </span>
                </div>

                {/* Score Pills */}
                <div className="mt-5 grid grid-cols-3 gap-2 text-center bg-surface-bg p-3 rounded-lg border border-surface-border">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-surface-muted block">SEO</span>
                    <span className="text-base font-extrabold text-navy">{site.latestSeoScore || '—'}</span>
                  </div>
                  <div className="border-x border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-surface-muted block">GEO</span>
                    <span className="text-base font-extrabold text-navy">{site.latestGeoScore || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-surface-muted block">AEO</span>
                    <span className="text-base font-extrabold text-navy">{site.latestAeoScore || '—'}</span>
                  </div>
                </div>

                <div className="mt-4 text-[11px] text-surface-muted space-y-1">
                  <p>Added: {new Date(site.createdAt).toLocaleDateString()}</p>
                  <p>Last Audited: {site.lastAuditedAt ? new Date(site.lastAuditedAt).toLocaleString() : 'Never'}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-between gap-2">
                <a
                  href="/dashboard/audits"
                  className="flex-1 py-1.5 text-center rounded-lg bg-slate-100 hover:bg-slate-200 text-navy text-xs font-semibold transition-colors"
                >
                  View Audit
                </a>
                <button
                  onClick={() => setDeleteTarget(site)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-status-error hover:bg-red-50 transition-colors"
                  title="Delete Website"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {websites.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-surface-border">
            <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-navy">No Websites Added Yet</h3>
            <p className="text-xs text-surface-muted mt-1 max-w-sm mx-auto">
              Add your first client website to run safe SEO, GEO and AEO audits and connect Google Search Console.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-semibold"
            >
              Add First Website
            </button>
          </div>
        )}
      </div>

      {/* Add Website Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-surface-border max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-navy">Add New Client Website</h3>
            <p className="text-xs text-surface-muted mt-1">
              Configure domain boundaries for safe auditing and GSC synchronization.
            </p>

            {formError && (
              <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddWebsite} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-navy block mb-1">Website Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme SaaS Platform"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-surface-border outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-navy block mb-1">Root Domain</label>
                <input
                  type="text"
                  placeholder="e.g. acme.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-surface-border outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-navy block mb-1">Full URL (with https://)</label>
                <input
                  type="url"
                  placeholder="https://acme.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-surface-border outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                />
              </div>

              <div className="pt-3 border-t border-surface-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-surface-muted hover:text-navy rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm"
                >
                  Save & Register Website
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Explaining historical data consequence) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-surface-border max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-3">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-navy">Delete Website: {deleteTarget.name}?</h3>
            <div className="mt-2 text-xs text-surface-muted space-y-2">
              <p>
                Are you sure you want to delete <span className="font-semibold text-navy">{deleteTarget.domain}</span>?
              </p>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                <span className="font-bold">Data Retention Notice:</span> Deleting this website will also delete its historical audit runs, discovered findings, GSC synced metrics, and associated Action Center tasks from your organization workspace. This action cannot be undone.
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-surface-muted hover:text-navy rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-status-error hover:bg-red-700 rounded-lg"
              >
                Permanently Delete Website
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
