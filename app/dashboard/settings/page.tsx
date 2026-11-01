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
    <div className="space-y-6">
      <DashboardHeader
        title="Organization & Account Settings"
        subtitle="Manage agency workspaces, team membership, limits and account profiles"
      />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Organization Profile */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="w-10 h-10 rounded-md bg-primary-tint border border-emerald-200 flex items-center justify-center text-primary">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-head text-text">Organization Details</h2>
              <p className="text-xs text-muted">Primary agency workspace identity</p>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-md bg-primary-tint border border-emerald-200 text-xs text-primary flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-primary" />
              <span>Organization settings saved successfully.</span>
            </div>
          )}

          <form onSubmit={handleSaveOrg} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text block mb-1">Organization Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full text-xs px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text block mb-1">Organization Slug</label>
                <input
                  type="text"
                  disabled
                  value={org.slug}
                  className="w-full text-xs px-3 h-10 rounded-md border border-border bg-bg text-muted cursor-not-allowed font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="h-10 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-medium rounded-md shadow-xs transition-colors"
              >
                Save Organization Settings
              </button>
            </div>
          </form>
        </div>

        {/* Agency Plan & Limits */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="w-10 h-10 rounded-md bg-accent-tint border border-blue-200 flex items-center justify-center text-accent">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-head text-text">Plan & Usage Limits</h2>
              <p className="text-xs text-muted">Zero-budget local development limits</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
            <div className="p-4 rounded-md bg-bg border border-border text-center">
              <span className="text-[10px] font-semibold text-muted uppercase block font-sans">Monitored Websites</span>
              <span className="text-2xl font-bold text-text tnum mt-1 block">3 / {org.maxWebsites}</span>
              <span className="text-[10px] text-muted mt-1 block">Active client slots</span>
            </div>

            <div className="p-4 rounded-md bg-bg border border-border text-center">
              <span className="text-[10px] font-semibold text-muted uppercase block font-sans">Pages per Audit</span>
              <span className="text-2xl font-bold text-text tnum mt-1 block">{org.maxCrawledPagesPerAudit}</span>
              <span className="text-[10px] text-muted mt-1 block">Polite sample cap</span>
            </div>

            <div className="p-4 rounded-md bg-bg border border-border text-center">
              <span className="text-[10px] font-semibold text-muted uppercase block font-sans">Verification Engine</span>
              <span className="text-2xl font-bold text-primary tnum mt-1 block">Unlimited</span>
              <span className="text-[10px] text-muted mt-1 block">Automated re-crawls</span>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="w-10 h-10 rounded-md bg-primary-tint border border-emerald-200 flex items-center justify-center text-primary">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-head text-text">User Profile</h2>
              <p className="text-xs text-muted">Active administrator identity</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 bg-bg rounded-md border border-border">
              <span className="text-muted block text-[10px] font-sans">Full Name</span>
              <span className="text-sm font-semibold text-text mt-0.5 block">{user.fullName}</span>
            </div>
            <div className="p-3 bg-bg rounded-md border border-border">
              <span className="text-muted block text-[10px] font-sans">Email Address</span>
              <span className="text-sm font-semibold text-text mt-0.5 block">{user.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
