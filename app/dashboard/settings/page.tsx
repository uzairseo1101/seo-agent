'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardHeader from '@/components/dashboard-header';
import { supabase } from '@/lib/supabase';
import { Building2, User, CreditCard, Check, AlertCircle, Loader2, ExternalLink } from 'lucide-react';

interface OrgData {
  id: string;
  name: string;
  slug: string;
  plan: string;
  maxWebsites: number;
  maxCrawledPagesPerAudit: number;
  role: string;
}

interface ProfileData {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export default function SettingsPage() {
  const [org, setOrg] = useState<OrgData | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [orgName, setOrgName] = useState('');
  const [fullName, setFullName] = useState('');
  const [connectedSitesCount, setConnectedSitesCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingOrg, setIsSavingOrg] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [orgSuccess, setOrgSuccess] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [orgError, setOrgError] = useState('');
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchSettings = async () => {
      try {
        const { data: { session } } = (await supabase?.auth.getSession()) || { data: { session: null } };
        const headers: Record<string, string> = {};
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const [settingsRes, profileRes, webRes] = await Promise.all([
          fetch('/api/settings', { headers }),
          fetch('/api/profile', { headers }),
          fetch('/api/websites', { headers }),
        ]);

        if (settingsRes.ok && mounted) {
          const sJson = await settingsRes.json();
          if (sJson.success && sJson.organization) {
            setOrg(sJson.organization);
            setOrgName(sJson.organization.name);
          }
        }

        if (profileRes.ok && mounted) {
          const pJson = await profileRes.json();
          if (pJson.success && pJson.profile) {
            setProfile(pJson.profile);
            setFullName(pJson.profile.fullName || '');
          }
        }

        if (webRes.ok && mounted) {
          const wJson = await webRes.json();
          if (wJson.success && Array.isArray(wJson.websites)) {
            setConnectedSitesCount(wJson.websites.length);
          }
        }
      } catch (err: any) {
        console.error('Settings load error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchSettings();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;

    setIsSavingOrg(true);
    setOrgError('');
    setOrgSuccess(false);

    try {
      const { data: { session } } = (await supabase?.auth.getSession()) || { data: { session: null } };
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ name: orgName.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update workspace name.');
      }

      setOrg(data.organization);
      setOrgSuccess(true);
      setTimeout(() => setOrgSuccess(false), 4000);
    } catch (err: any) {
      setOrgError(err.message || 'Error updating organization.');
    } finally {
      setIsSavingOrg(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setIsSavingProfile(true);
    setProfileError('');
    setProfileSuccess(false);

    try {
      const { data: { session } } = (await supabase?.auth.getSession()) || { data: { session: null } };
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ fullName: fullName.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update user profile.');
      }

      setProfile(data.profile);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 4000);
    } catch (err: any) {
      setProfileError(err.message || 'Error updating profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <DashboardHeader
          title="Organization & Account Settings"
          subtitle="Manage agency workspaces, quotas, limits and account profiles"
        />
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-xs text-muted">Loading account settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Organization & Account Settings"
        subtitle="Manage agency workspaces, quotas, limits and account profiles"
      />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* User Account Profile */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="w-10 h-10 rounded-lg bg-primary-tint border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-center text-primary">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-head text-text">User Profile</h2>
              <p className="text-xs text-muted">Your authenticated user identity and permissions</p>
            </div>
          </div>

          {profileSuccess && (
            <div className="p-3 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs text-primary flex items-center gap-2">
              <Check className="w-4 h-4 text-primary shrink-0" />
              <span>Profile updated successfully.</span>
            </div>
          )}

          {profileError && (
            <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-error flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text block mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text block mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || ''}
                  className="w-full text-xs px-3 h-10 rounded-md border border-border bg-bg text-muted cursor-not-allowed font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted">
                Role: <span className="font-semibold text-text capitalize">{profile?.role || 'user'}</span>
              </span>
              <button
                type="submit"
                disabled={isSavingProfile}
                className="h-9 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-medium rounded-md shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSavingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </div>

        {/* Organization Workspace Profile */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="w-10 h-10 rounded-lg bg-primary-tint border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-center text-primary">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-head text-text">Workspace Details</h2>
              <p className="text-xs text-muted">Isolated tenant organization holding your client websites and audits</p>
            </div>
          </div>

          {orgSuccess && (
            <div className="p-3 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs text-primary flex items-center gap-2">
              <Check className="w-4 h-4 text-primary shrink-0" />
              <span>Workspace settings saved successfully.</span>
            </div>
          )}

          {orgError && (
            <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-error flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{orgError}</span>
            </div>
          )}

          <form onSubmit={handleSaveOrg} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text block mb-1">Workspace Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full text-xs px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text block mb-1">Workspace Slug</label>
                <input
                  type="text"
                  disabled
                  value={org?.slug || ''}
                  className="w-full text-xs px-3 h-10 rounded-md border border-border bg-bg text-muted cursor-not-allowed font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted">
                Your Workspace Role: <span className="font-semibold text-text capitalize">{org?.role || 'owner'}</span>
              </span>
              <button
                type="submit"
                disabled={isSavingOrg}
                className="h-9 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-medium rounded-md shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSavingOrg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Save Workspace</span>
              </button>
            </div>
          </form>
        </div>

        {/* Subscription Plan & Real Usage Limits */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold font-head text-text">Subscription & Plan Limits</h2>
                <p className="text-xs text-muted">Active tier allowances and resource boundaries</p>
              </div>
            </div>

            <Link
              href="/pricing"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <span>Upgrade Plan</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
            <div className="p-4 rounded-lg bg-bg border border-border text-center">
              <span className="text-[10px] font-semibold text-muted uppercase block font-sans">Current Plan</span>
              <span className="text-xl font-bold text-primary capitalize mt-1 block">
                {org?.plan || 'Free'}
              </span>
              <span className="text-[10px] text-muted mt-1 block font-sans">Active Tier</span>
            </div>

            <div className="p-4 rounded-lg bg-bg border border-border text-center">
              <span className="text-[10px] font-semibold text-muted uppercase block font-sans">Monitored Websites</span>
              <span className="text-2xl font-bold text-text tnum mt-1 block">
                {connectedSitesCount} / {org?.maxWebsites || 1}
              </span>
              <span className="text-[10px] text-muted mt-1 block font-sans">Active client slots</span>
            </div>

            <div className="p-4 rounded-lg bg-bg border border-border text-center">
              <span className="text-[10px] font-semibold text-muted uppercase block font-sans">Crawled Pages / Audit</span>
              <span className="text-2xl font-bold text-text tnum mt-1 block">
                {org?.maxCrawledPagesPerAudit || 10}
              </span>
              <span className="text-[10px] text-muted mt-1 block font-sans">Pages crawled per run</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
