'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import DashboardHeader from '@/components/dashboard-header';
import { storage } from '@/lib/storage';
import {
  Search,
  CheckCircle,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  ArrowRight,
  Filter,
  ShieldCheck,
  AlertCircle,
  Plus,
  HelpCircle,
  Target,
  Sparkles,
  Zap,
  Code2,
  Info,
  Check,
  AlertTriangle
} from 'lucide-react';
import { Website } from '@/lib/types';
import {
  GscKeywordAnalysisQuery,
  GscKeywordAnalysisPage,
  GscKeywordAnalysisSummary,
  GscIntentType
} from '@/lib/gsc/types';

export default function GscPage() {
  const [websites, setWebsites] = useState<Website[]>(() => {
    return storage.getWebsites().filter(
      (w) =>
        !['web-1', 'web-2', 'web-3'].includes(w.id) &&
        !['SaaSFlow Analytics', 'Nordic Clean Living', 'Zenith Legal Partners'].includes(w.name)
    );
  });
  const [selectedWebId, setSelectedWebId] = useState(websites[0]?.id || '');
  const [dateRange, setDateRange] = useState<'7' | '28' | '90'>('28');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'queries' | 'pages'>('queries');

  // Keyword Analysis & Regex Filtering State
  const [customRegex, setCustomRegex] = useState<string>('');
  const [presetFilter, setPresetFilter] = useState<GscIntentType>('all');
  const [zeroClicksOnly, setZeroClicksOnly] = useState<boolean>(false);
  const [brandInput, setBrandInput] = useState<string>('');
  const [competitorInput, setCompetitorInput] = useState<string>('');
  const [isBrandConfigOpen, setIsBrandConfigOpen] = useState(false);

  // Analysis Results State
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [queries, setQueries] = useState<GscKeywordAnalysisQuery[]>([]);
  const [pages, setPages] = useState<GscKeywordAnalysisPage[]>([]);
  const [summary, setSummary] = useState<GscKeywordAnalysisSummary | null>(null);
  const [regexError, setRegexError] = useState<string | null>(null);
  const [datasetScopeNote, setDatasetScopeNote] = useState<string>('');

  // Initial Websites Load
  useEffect(() => {
    let mounted = true;
    const fetchSites = async () => {
      try {
        const res = await fetch('/api/websites');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.websites) && mounted) {
            const clean = data.websites.filter(
              (w: Website) =>
                !['web-1', 'web-2', 'web-3'].includes(w.id) &&
                !['SaaSFlow Analytics', 'Nordic Clean Living', 'Zenith Legal Partners'].includes(w.name)
            );
            setWebsites(clean);
            if (!selectedWebId && clean.length > 0) {
              setSelectedWebId(clean[0].id);
            }
          }
        }
      } catch (e) {
        // Fallback
      }
    };
    fetchSites();
    return () => {
      mounted = false;
    };
  }, [selectedWebId]);

  const primary = websites.find(w => w.id === selectedWebId) || websites[0];

  // Set default brand names when primary website changes
  useEffect(() => {
    if (primary) {
      const defaultBrands = [primary.name, primary.domain.replace(/\..*$/, '')].filter(Boolean).join(', ');
      setBrandInput(prev => prev || defaultBrands);
    }
  }, [primary]);

  // Fetch Analyzed Keywords & Pages
  const fetchKeywordAnalysis = useCallback(async () => {
    if (!primary) return;
    setIsLoadingAnalysis(true);
    setRegexError(null);

    try {
      const brands = brandInput.split(',').map(b => b.trim()).filter(Boolean);
      const competitors = competitorInput.split(',').map(c => c.trim()).filter(Boolean);

      const res = await fetch('/api/gsc/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: primary.id,
          customRegex: customRegex.trim() || undefined,
          presetFilter: presetFilter === 'custom_regex' ? 'all' : presetFilter,
          zeroClicksOnly,
          brandNames: brands,
          competitorNames: competitors,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setQueries(data.queries || []);
        setPages(data.pages || []);
        setSummary(data.summary || null);
        setDatasetScopeNote(data.datasetScopeNote || '');
        if (!data.regexValidation.isValid) {
          setRegexError(data.regexValidation.errorMessage || 'Invalid regular expression');
        } else {
          setRegexError(null);
        }
      } else {
        setRegexError(data.error || 'Failed to analyze keywords');
      }
    } catch (err: any) {
      setRegexError(err.message || 'Analysis error');
    } finally {
      setIsLoadingAnalysis(false);
    }
  }, [primary, customRegex, presetFilter, zeroClicksOnly, brandInput, competitorInput]);

  useEffect(() => {
    fetchKeywordAnalysis();
  }, [fetchKeywordAnalysis]);

  const handleSyncData = async () => {
    if (!primary) return;
    setIsSyncing(true);
    setSyncNotice(null);
    setSyncError(null);

    try {
      const brands = brandInput.split(',').map(b => b.trim()).filter(Boolean);
      const competitors = competitorInput.split(',').map(c => c.trim()).filter(Boolean);

      const res = await fetch('/api/gsc/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: primary.id,
          daysCount: parseInt(dateRange, 10),
          brandNames: brands,
          competitorNames: competitors,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to sync Search Console data.');
      }

      setSyncNotice(`Synced ${data.syncResult.recordsSynced} performance rows for ${data.syncResult.propertyUrl}. Discovered ${data.opportunitiesCount} opportunities.`);
      setTimeout(() => setSyncNotice(null), 6000);
      setIsSyncing(false);
      fetchKeywordAnalysis();
    } catch (err: any) {
      setSyncError(err.message || 'Sync failed.');
      setIsSyncing(false);
    }
  };

  const applyPreset = (preset: GscIntentType, regexString?: string) => {
    setPresetFilter(preset);
    if (regexString !== undefined) {
      setCustomRegex(regexString);
    } else {
      setCustomRegex('');
    }
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Google Search Console Intelligence & Keyword Analysis"
        subtitle="Performance sync, custom regex filtering, brand search breakdown, and position-aware CTR analytics"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {websites.length === 0 || !primary ? (
          <div className="bg-card rounded-lg border border-border p-12 text-center max-w-xl mx-auto shadow-card space-y-4">
            <div className="w-14 h-14 rounded-full bg-accent-tint text-accent mx-auto flex items-center justify-center">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold font-head text-text">No Google Search Console Properties Connected</h3>
            <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
              Connect a website domain to link Google Search Console and begin syncing organic search performance metrics, impressions, and keyword rankings.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard/websites"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Connect Website</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Sync Notifications */}
            {syncNotice && (
              <div className="p-3.5 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-primary flex items-center justify-between shadow-xs animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>{syncNotice}</span>
                </div>
                <Link href="/dashboard/opportunities" className="font-semibold text-accent hover:underline">
                  View Opportunities →
                </Link>
              </div>
            )}

            {syncError && (
              <div className="p-3.5 rounded-md bg-red-50 border border-red-200 text-xs text-error flex items-center gap-2 shadow-xs">
                <AlertCircle className="w-4 h-4 text-error shrink-0" />
                <span>{syncError}</span>
              </div>
            )}

            {/* Property Selector & Sync Controls */}
            <div className="bg-card rounded-lg border border-border p-5 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className="text-[11px] font-bold text-muted block uppercase tracking-wider mb-1">
                    Search Console Property
                  </label>
                  <select
                    value={selectedWebId}
                    onChange={(e) => setSelectedWebId(e.target.value)}
                    className="text-xs font-medium px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 shadow-xs cursor-pointer min-w-[220px]"
                  >
                    {websites.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.domain})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted block uppercase tracking-wider mb-1">
                    Date Range Window
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as any)}
                    className="text-xs font-medium px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 shadow-xs cursor-pointer"
                  >
                    <option value="7">Last 7 Days</option>
                    <option value="28">Last 28 Days (Standard Rolling)</option>
                    <option value="90">Last 90 Days (Quarterly Trend)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsBrandConfigOpen(!isBrandConfigOpen)}
                  className="px-3.5 h-10 rounded-md border border-border bg-card hover:bg-slate-50 text-text text-xs font-medium shadow-xs transition-colors flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-muted" />
                  <span>Configure Brand & Competitors</span>
                </button>

                <button
                  onClick={handleSyncData}
                  disabled={isSyncing}
                  className="px-4 h-10 bg-primary hover:bg-primary-hover disabled:opacity-60 text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Synchronizing GSC...' : 'Sync Search Console Data'}</span>
                </button>
              </div>
            </div>

            {/* Brand & Competitor Settings Panel (Collapsible) */}
            {isBrandConfigOpen && (
              <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-bold text-text">Brand & Competitor Query Configuration</h4>
                  </div>
                  <span className="text-[11px] text-muted">Used to segment branded vs. non-branded organic acquisition</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-text block mb-1">
                      Brand Names & Variations (comma-separated):
                    </label>
                    <input
                      type="text"
                      value={brandInput}
                      onChange={(e) => setBrandInput(e.target.value)}
                      placeholder="e.g. saasflow, saas flow, saasflow analytics"
                      className="w-full text-xs px-3 h-9 rounded-md border border-border bg-bg text-text outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="text-[10px] text-muted block mt-1">Queries containing these terms will be classified as Branded.</span>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-text block mb-1">
                      Competitor Brands & Alternates (comma-separated):
                    </label>
                    <input
                      type="text"
                      value={competitorInput}
                      onChange={(e) => setCompetitorInput(e.target.value)}
                      placeholder="e.g. churnzero, gainsight, planhat"
                      className="w-full text-xs px-3 h-9 rounded-md border border-border bg-bg text-text outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="text-[10px] text-muted block mt-1">Queries containing competitor names will be classified under Commercial Intent.</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => { fetchKeywordAnalysis(); setIsBrandConfigOpen(false); }}
                    className="px-4 h-8 bg-primary text-white text-xs font-medium rounded-md shadow-xs hover:bg-primary-hover"
                  >
                    Apply Brand Segmentation
                  </button>
                </div>
              </div>
            )}

            {/* Performance Summary Metrics */}
            {summary && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                <div className="bg-card p-4 rounded-lg border border-border shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-muted block">Organic Clicks</span>
                  <span className="text-xl font-bold font-head text-primary tnum">{summary.totalClicks.toLocaleString()}</span>
                  <span className="text-[10px] text-muted block mt-0.5 font-mono">Matched dataset</span>
                </div>

                <div className="bg-card p-4 rounded-lg border border-border shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-muted block">Total Impressions</span>
                  <span className="text-xl font-bold font-head text-text tnum">{summary.totalImpressions.toLocaleString()}</span>
                  <span className="text-[10px] text-muted block mt-0.5 font-mono">SERP views</span>
                </div>

                <div className="bg-card p-4 rounded-lg border border-border shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-muted block">Average CTR</span>
                  <span className="text-xl font-bold font-head text-text tnum">{(summary.avgCtr * 100).toFixed(2)}%</span>
                  <span className="text-[10px] text-muted block mt-0.5 font-mono">Click-through rate</span>
                </div>

                <div className="bg-card p-4 rounded-lg border border-border shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-muted block">Average Position</span>
                  <span className="text-xl font-bold font-head text-text tnum">{summary.avgPosition}</span>
                  <span className="text-[10px] text-muted block mt-0.5 font-mono">SERP rank</span>
                </div>

                <div className="bg-card p-4 rounded-lg border border-border shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-muted block">Branded Clicks</span>
                  <span className="text-xl font-bold font-head text-accent tnum">{summary.brandedClicksPct}%</span>
                  <span className="text-[10px] text-muted block mt-0.5 font-mono">{summary.brandedClicks} branded clicks</span>
                </div>

                <div className="bg-card p-4 rounded-lg border border-border shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-muted block">Non-Branded Clicks</span>
                  <span className="text-xl font-bold font-head text-emerald-600 tnum">{summary.nonBrandedClicksPct}%</span>
                  <span className="text-[10px] text-muted block mt-0.5 font-mono">{summary.nonBrandedClicks} discovery clicks</span>
                </div>
              </div>
            )}

            {/* DEDICATED KEYWORD ANALYSIS & CUSTOM REGEX MODULE (Section 3) */}
            <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-bold font-head text-text">Search Console Regular Expression & Keyword Discovery</h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <Info className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>Supports standard GSC regex filters (case-insensitive)</span>
                </div>
              </div>

              {/* 1-Click Regex Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted block uppercase tracking-wider">
                  Preset Intent & Pattern Filters:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => applyPreset('all')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      presetFilter === 'all' && !customRegex
                        ? 'bg-primary text-white border-primary'
                        : 'bg-card text-text border-border hover:bg-slate-50'
                    }`}
                  >
                    All Queries ({summary?.totalQueries || 0})
                  </button>

                  <button
                    onClick={() => applyPreset('questions', '^(how|what|why|when|where|who|which|can|does|is|are|should)\\b')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                      presetFilter === 'questions' || customRegex.startsWith('^(how|what')
                        ? 'bg-primary text-white border-primary'
                        : 'bg-card text-text border-border hover:bg-slate-50'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Question Keywords ({summary?.questionsCount || 0})</span>
                  </button>

                  <button
                    onClick={() => applyPreset('informational', '^(how|what|why|guide|tutorial|tips|examples|meaning|benefits)\\b')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      presetFilter === 'informational'
                        ? 'bg-primary text-white border-primary'
                        : 'bg-card text-text border-border hover:bg-slate-50'
                    }`}
                  >
                    Informational Intent
                  </button>

                  <button
                    onClick={() => applyPreset('commercial', '(best|top|review|comparison|vs|alternative|alternatives|competitor)')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      presetFilter === 'commercial'
                        ? 'bg-primary text-white border-primary'
                        : 'bg-card text-text border-border hover:bg-slate-50'
                    }`}
                  >
                    Commercial Investigation
                  </button>

                  <button
                    onClick={() => applyPreset('transactional', '(buy|price|pricing|cost|purchase|order|hire|book|near me)')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      presetFilter === 'transactional'
                        ? 'bg-primary text-white border-primary'
                        : 'bg-card text-text border-border hover:bg-slate-50'
                    }`}
                  >
                    Transactional Intent
                  </button>

                  <button
                    onClick={() => applyPreset('branded')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      presetFilter === 'branded'
                        ? 'bg-accent text-white border-accent'
                        : 'bg-card text-text border-border hover:bg-slate-50'
                    }`}
                  >
                    Branded Searches
                  </button>

                  <button
                    onClick={() => applyPreset('non_branded')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      presetFilter === 'non_branded'
                        ? 'bg-accent text-white border-accent'
                        : 'bg-card text-text border-border hover:bg-slate-50'
                    }`}
                  >
                    Non-Branded Growth
                  </button>

                  <button
                    onClick={() => setZeroClicksOnly(!zeroClicksOnly)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      zeroClicksOnly
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-card text-text border-border hover:bg-slate-50'
                    }`}
                  >
                    Zero-Click Only ({summary?.zeroClickCount || 0})
                  </button>
                </div>
              </div>

              {/* Custom Regex Input Field */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-text">
                    Custom Regular Expression Search:
                  </label>
                  <span className="text-[11px] font-mono text-muted">
                    Example: <code className="bg-bg px-1.5 py-0.5 rounded border border-border">^(how|what|why)\b</code>
                  </span>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={customRegex}
                      onChange={(e) => setCustomRegex(e.target.value)}
                      placeholder="Enter custom regex (e.g., ^(best|top).*(software|tool)$ or (vs|alternative))"
                      className={`w-full text-xs font-mono px-3 h-10 rounded-md border bg-bg text-text outline-none shadow-xs transition-colors ${
                        regexError
                          ? 'border-error ring-1 ring-error/30'
                          : 'border-border focus:ring-2 focus:ring-primary/20 focus:border-primary'
                      }`}
                    />
                    {customRegex && !regexError && (
                      <Check className="w-4 h-4 text-primary absolute right-3 top-3" />
                    )}
                  </div>

                  {customRegex && (
                    <button
                      onClick={() => setCustomRegex('')}
                      className="px-3 h-10 rounded-md border border-border bg-card hover:bg-slate-50 text-xs text-muted"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Validation Error Banner */}
                {regexError && (
                  <div className="p-2.5 rounded-md bg-red-50 border border-red-200 text-xs text-error flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-error" />
                    <span>{regexError}</span>
                  </div>
                )}

                {/* Scope & Dataset Limitation Notice (Section 3 requirement) */}
                <div className="p-2.5 rounded-md bg-bg border border-border text-[11px] text-muted flex items-start gap-2">
                  <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Dataset Scope & Limitation:</strong> {datasetScopeNote || 'Regex filters match against the queries retrieved through the Google Search Console API. Search Console automatically aggregates very low-volume long-tail queries to maintain user privacy. Custom regex does not query unrecorded search volume.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Opportunity Callout */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text">Evidence-Backed SEO Opportunities Ready</h4>
                  <p className="text-xs text-muted">
                    RankPilot analyzed {summary?.totalQueries || 0} GSC queries and connected website crawler findings.
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard/opportunities"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-md shadow-xs transition-colors shrink-0"
              >
                <span>View Discovered Opportunities</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Tabs: Queries vs Pages */}
            <div className="flex items-center justify-between border-b border-border">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('queries')}
                  className={`pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                    activeTab === 'queries'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted hover:text-text'
                  }`}
                >
                  Queries ({queries.length})
                </button>
                <button
                  onClick={() => setActiveTab('pages')}
                  className={`pb-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                    activeTab === 'pages'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted hover:text-text'
                  }`}
                >
                  Landing Pages ({pages.length})
                </button>
              </div>

              <div className="text-xs text-muted font-mono">
                Showing {activeTab === 'queries' ? queries.length : pages.length} results
              </div>
            </div>

            {/* QUERIES TABLE */}
            {activeTab === 'queries' && (
              <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border bg-bg/50 text-[10px] uppercase font-bold text-muted tracking-wider">
                        <th className="py-3 px-4">Search Query</th>
                        <th className="py-3 px-3">Intent Classification</th>
                        <th className="py-3 px-3 text-right">Clicks</th>
                        <th className="py-3 px-3 text-right">Impressions</th>
                        <th className="py-3 px-3 text-right">CTR</th>
                        <th className="py-3 px-3 text-right">Position</th>
                        <th className="py-3 px-3 text-center">CTR Health</th>
                        <th className="py-3 px-4">Top Landing Page</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {queries.map((q, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 font-medium text-text">
                            <span className="font-semibold">{q.query}</span>
                            {q.isQuestion && (
                              <span className="ml-2 text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded font-mono">
                                Question
                              </span>
                            )}
                            {q.isBranded && (
                              <span className="ml-1.5 text-[10px] bg-blue-50 text-accent border border-blue-200 px-1.5 py-0.5 rounded font-mono">
                                Brand
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full capitalize font-semibold ${
                              q.intent === 'transactional' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              q.intent === 'commercial' ? 'bg-amber-50 text-warning border border-amber-200' :
                              q.intent === 'navigational' ? 'bg-blue-50 text-accent border border-blue-200' :
                              'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {q.intent}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-primary tnum">
                            {q.clicks}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-text tnum">
                            {q.impressions.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-text tnum">
                            {(q.ctr * 100).toFixed(2)}%
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-text tnum">
                            {q.position}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                              q.ctrHealth === 'strong' ? 'bg-emerald-50 text-emerald-700' :
                              q.ctrHealth === 'underperforming' ? 'bg-red-50 text-error font-bold' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {q.ctrHealth}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-muted truncate max-w-xs">
                            <a
                              href={q.topPage}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-primary flex items-center gap-1 truncate"
                            >
                              <span className="truncate">{q.topPage.replace(/^https?:\/\/[^/]+/, '') || '/'}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          </td>
                        </tr>
                      ))}

                      {queries.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-muted">
                            <Search className="w-8 h-8 text-muted mx-auto mb-2" />
                            <p className="text-sm font-medium">No queries match the active regular expression or intent filter.</p>
                            <button
                              onClick={() => { setCustomRegex(''); setPresetFilter('all'); setZeroClicksOnly(false); }}
                              className="mt-2 text-xs font-semibold text-primary hover:underline"
                            >
                              Reset Filters
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* LANDING PAGES TABLE */}
            {activeTab === 'pages' && (
              <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border bg-bg/50 text-[10px] uppercase font-bold text-muted tracking-wider">
                        <th className="py-3 px-4">Landing Page URL</th>
                        <th className="py-3 px-3 text-right">Clicks</th>
                        <th className="py-3 px-3 text-right">Impressions</th>
                        <th className="py-3 px-3 text-right">CTR</th>
                        <th className="py-3 px-3 text-right">Avg Position</th>
                        <th className="py-3 px-4">Top Ranking Queries</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {pages.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-text max-w-md truncate">
                            <a
                              href={p.pageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-primary flex items-center gap-1.5 truncate"
                            >
                              <span className="truncate">{p.pageUrl}</span>
                              <ExternalLink className="w-3 h-3 shrink-0 text-muted" />
                            </a>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-primary tnum">
                            {p.clicks}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-text tnum">
                            {p.impressions.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-text tnum">
                            {(p.ctr * 100).toFixed(2)}%
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-text tnum">
                            {p.avgPosition}
                          </td>
                          <td className="py-3 px-4 text-muted text-[11px]">
                            <div className="flex flex-wrap gap-1">
                              {p.topQueries.slice(0, 3).map((tq, i) => (
                                <span key={i} className="bg-bg px-2 py-0.5 rounded border border-border">
                                  {tq}
                                </span>
                              ))}
                              {p.queryCount > 3 && (
                                <span className="text-[10px] text-muted py-0.5">+{p.queryCount - 3} more</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
