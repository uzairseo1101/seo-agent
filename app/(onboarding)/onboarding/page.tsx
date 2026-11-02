'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Compass,
  Building2,
  Globe,
  Clock,
  User,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Sparkles,
  Briefcase,
  Users
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function OnboardingPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [userType, setUserType] = useState<'freelancer' | 'agency' | 'in_house' | 'other'>('agency');
  const [primaryWebsite, setPrimaryWebsite] = useState('');
  const [timeZone, setTimeZone] = useState('UTC');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-detect browser time zone
  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) setTimeZone(detected);
    } catch {
      // Default UTC
    }

    // Try fetching existing profile
    const loadProfile = async () => {
      try {
        const { data: { user } } = (await supabase?.auth.getUser()) || { data: { user: null } };
        if (user?.user_metadata?.full_name) {
          setFullName(user.user_metadata.full_name);
        }
      } catch {
        // Silently continue
      }
    };
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data: { session } } = (await supabase?.auth.getSession()) || { data: { session: null } };
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      // 1. Submit onboarding profile
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fullName,
          companyName,
          userType,
          primaryWebsite: primaryWebsite.trim() || undefined,
          timeZone,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete profile onboarding.');
      }

      // 2. Redirect to dashboard with welcome flag
      router.push('/dashboard?welcome=true');
    } catch (err: any) {
      setError(err.message || 'Onboarding error.');
      setIsLoading(false);
    }
  };

  const userTypeOptions = [
    {
      id: 'freelancer' as const,
      title: 'SEO Freelancer',
      desc: 'Independent SEO practitioner managing multiple client websites.',
      icon: Briefcase,
    },
    {
      id: 'agency' as const,
      title: 'Digital Agency',
      desc: 'SEO or marketing agency delivering client audits & reports.',
      icon: Building2,
    },
    {
      id: 'in_house' as const,
      title: 'In-House Team',
      desc: 'Managing SEO strategy and site health for a specific brand.',
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-bg text-text py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-card rounded-xl border border-border shadow-pop p-6 sm:p-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center text-white shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <span className="font-head font-bold text-2xl text-text tracking-tight">
              RankPilot <span className="text-primary font-semibold">AI</span>
            </span>
          </div>

          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-primary block">
            Step 2 of 2 — Workspace Setup
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-head text-text">
            Tell us about your SEO workflow
          </h1>
          <p className="text-xs text-muted max-w-md mx-auto">
            This personalizes your dashboard, crawler presets, and client reporting templates.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Type Cards */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text block">
              Which best describes your role?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {userTypeOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = userType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setUserType(opt.id)}
                    className={`p-4 rounded-lg border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-primary bg-primary-tint/30 ring-2 ring-primary/20'
                        : 'border-border bg-card hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center mb-2.5 ${
                        isSelected ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-muted'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-head font-bold text-xs text-text block">
                        {opt.title}
                      </span>
                      <p className="text-[11px] text-muted mt-1 leading-snug">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name & Agency Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text block mb-1">
                Your Full Name <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs px-3 pl-9 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <User className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-text block mb-1">
                Company / Agency Name <span className="text-muted font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Apex Digital Marketing"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full text-xs px-3 pl-9 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <Building2 className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Primary Website & Timezone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text block mb-1">
                Primary Monitored Website <span className="text-muted font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={primaryWebsite}
                  onChange={(e) => setPrimaryWebsite(e.target.value)}
                  className="w-full text-xs px-3 pl-9 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <Globe className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <span className="text-[10px] text-muted block mt-1">
                You can add more client websites anytime in the dashboard.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-text block mb-1">
                Time Zone
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  className="w-full text-xs px-3 pl-9 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <Clock className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.push('/dashboard?welcome=true')}
              className="text-xs text-muted hover:text-text"
            >
              Skip optional fields for now
            </button>

            <button
              type="submit"
              disabled={isLoading || !fullName.trim()}
              className="w-full sm:w-auto h-11 px-6 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Complete Setup & Enter Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
