'use client';

import React, { useState } from 'react';
import DashboardHeader from '@/components/dashboard-header';
import { storage } from '@/lib/storage';
import { Building2, User, Shield, CreditCard, Check, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const [org, setOrg] = useState(storage.getOrganization());
  const [user, setUser] = useState(storage.getUser());
  const [orgName, setOrgName] = useState(org.name);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    storage.updateOrganizationName(orgName);
    setOrg({ ...storage.getOrganization() });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div>
      <DashboardHeader
        title="Organization & Account Settings"
        subtitle="Manage agency workspaces, team membership, limits and account profiles"
      />

      <div className="p-6 max-w-4xl mx-auto space-y-8">
        {/* Organization Profile */}
        <div className="bg-white rounded-xl border border-surface-border p-6 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-surface-border">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-brand-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-navy">Organization Details</h2>
              <p className="text-xs text-surface-muted">Primary agency workspace identity</p>
            </div>
          </div>

          {savedSuccess && (
            <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Organization settings saved successfully.</span>
            </div>
          )}

          <form onSubmit={handleSaveOrg} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-navy block mb-1">Organization Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-surface-border outline-none focus:border-brand-600"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-navy block mb-1">Organization Slug</label>
                <input
                  type="text"
                  disabled
                  value={org.slug}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-surface-border bg-slate-50 text-surface-muted cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Save Organization Settings
              </button>
            </div>
          </form>
        </div>

        {/* Agency Plan & Limits */}
        <div className="bg-white rounded-xl border border-surface-border p-6 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-surface-border">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-navy">Plan & Usage Limits</h2>
              <p className="text-xs text-surface-muted">Zero-budget local development limits</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-surface-bg border border-surface-border text-center">
              <span className="text-[11px] font-semibold text-surface-muted uppercase block">Monitored Websites</span>
              <span className="text-2xl font-bold text-navy mt-1 block">3 / {org.maxWebsites}</span>
              <span className="text-[10px] text-surface-muted mt-1 block">Active client slots</span>
            </div>

            <div className="p-4 rounded-lg bg-surface-bg border border-surface-border text-center">
              <span className="text-[11px] font-semibold text-surface-muted uppercase block">Audit Crawl Depth</span>
              <span className="text-2xl font-bold text-navy mt-1 block">{org.maxCrawledPagesPerAudit}</span>
              <span className="text-[10px] text-surface-muted mt-1 block">Pages per crawl run</span>
            </div>

            <div className="p-4 rounded-lg bg-surface-bg border border-surface-border text-center">
              <span className="text-[11px] font-semibold text-surface-muted uppercase block">AI Analyses / Mo</span>
              <span className="text-2xl font-bold text-navy mt-1 block">12 / {org.maxAiAnalysesPerMonth}</span>
              <span className="text-[10px] text-surface-muted mt-1 block">Gemini free tier calls</span>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="bg-white rounded-xl border border-surface-border p-6 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-surface-border">
            <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-navy">User Profile</h2>
              <p className="text-xs text-surface-muted">Signed in session credentials</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-surface-muted block">Full Name</span>
              <span className="text-xs font-semibold text-navy mt-0.5 block">{user.fullName}</span>
            </div>
            <div>
              <span className="text-xs text-surface-muted block">Email Address</span>
              <span className="text-xs font-semibold text-navy mt-0.5 block">{user.email}</span>
            </div>
            <div>
              <span className="text-xs text-surface-muted block">Role</span>
              <span className="text-xs font-semibold text-navy mt-0.5 block capitalize">{user.role}</span>
            </div>
            <div>
              <span className="text-xs text-surface-muted block">Account Created</span>
              <span className="text-xs font-semibold text-navy mt-0.5 block">{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
