'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import DashboardHeader from '@/components/dashboard-header';
import { storage } from '@/lib/storage';
import { SeoOpportunity, SeoOpportunityCategory, Website } from '@/lib/types';
import {
  Sparkles,
  ArrowRight,
  Target,
  CheckCircle2,
  Filter,
  Check,
  Search,
  ExternalLink,
  Layers,
  Bot,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  Link2,
  ShieldCheck,
  Cpu,
  Globe,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Plus
} from 'lucide-react';

const OPPORTUNITY_CATEGORIES: { id: SeoOpportunityCategory; label: string; icon: any }[] = [
  { id: 'keyword_opportunities', label: 'Keyword Opportunities', icon: Target },
  { id: 'ctr_improvements', label: 'CTR Improvements', icon: TrendingUp },
  { id: 'question_keywords', label: 'Question Keywords', icon: HelpCircle },
  { id: 'content_optimization', label: 'Content Optimization', icon: Layers },
  { id: 'technical_seo', label: 'Technical SEO', icon: ShieldCheck },
  { id: 'internal_linking', label: 'Internal Linking', icon: Link2 },
  { id: 'content_decay', label: 'Content Decay', icon: TrendingDown },
  { id: 'serp_growth', label: 'SERP Growth Strategies', icon: Sparkles },
  { id: 'ai_overviews', label: 'AI Overviews Strategies', icon: Cpu },
  { id: 'geo_aeo', label: 'GEO / AEO Opportunities', icon: Globe },
];

export default function OpportunitiesPage() {
  const [websites, setWebsites] = useState<Website[]>(() => {
    return storage.getWebsites().filter(
      (w) =>
        !['web-1', 'web-2', 'web-3'].includes(w.id) &&
        !['SaaSFlow Analytics', 'Nordic Clean Living', 'Zenith Legal Partners'].includes(w.name)
    );
  });
  const [selectedWebId, setSelectedWebId] = useState(websites[0]?.id || '');
  const [opportunities, setOpportunities] = useState<SeoOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});

  // Action Notice Toast
  const [actionNotice, setActionNotice] = useState<{ message: string; isError?: boolean } | null>(null);

  // Fetch Websites
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

  // Fetch Opportunities from API
  const fetchOpportunities = useCallback(async () => {
    if (!primary) return;
    setIsLoading(true);

    try {
      const url = `/api/opportunities?websiteId=${primary.id}`;
      const res = await fetch(url);
      const data = await res.json();

      if (res.ok && data.success && Array.isArray(data.opportunities)) {
        setOpportunities(data.opportunities);
      } else {
        // Fallback to local storage
        setOpportunities(storage.getOpportunities(primary.id));
      }
    } catch (e) {
      setOpportunities(storage.getOpportunities(primary?.id));
    } finally {
      setIsLoading(false);
    }
  }, [primary]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  // Regenerate / Discover Opportunities
  const handleRegenerate = async () => {
    if (!primary) return;
    setIsRegenerating(true);
    try {
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'regenerate',
          websiteId: primary.id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOpportunities(data.opportunities);
        setActionNotice({ message: `Discovered ${data.opportunitiesCount} fresh SEO opportunities.` });
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch (e: any) {
      setActionNotice({ message: 'Regeneration failed: ' + e.message, isError: true });
    } finally {
      setIsRegenerating(false);
    }
  };

  // Add Opportunity to Action Center (Section 8)
  const handleAddToActionCenter = async (opp: SeoOpportunity) => {
    try {
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_to_action_center',
          opportunityId: opp.id,
          opportunity: opp,
          websiteId: primary?.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Update local state
        setOpportunities(prev => prev.map(o => o.id === opp.id ? { ...o, status: 'actioned' } : o));
        setActionNotice({
          message: data.isDuplicate
            ? `Task already exists in Action Center: "${data.task.title}"`
            : `Task created in Action Center: "${data.task.title}"`,
        });
        setTimeout(() => setActionNotice(null), 4500);
      } else {
        throw new Error(data.error || 'Failed to add task.');
      }
    } catch (err: any) {
      setActionNotice({ message: 'Could not create task: ' + err.message, isError: true });
      setTimeout(() => setActionNotice(null), 4500);
    }
  };

  const toggleSteps = (id: string) => {
    setExpandedSteps(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter Logic
  const filteredOpportunities = opportunities.filter((opp) => {
    if (categoryFilter !== 'all') {
      if (opp.category !== categoryFilter && opp.type !== categoryFilter) return false;
    }
    if (priorityFilter !== 'all') {
      const p = opp.priority || opp.potentialImpact;
      if (p !== priorityFilter) return false;
    }
    if (statusFilter !== 'all') {
      const s = opp.status || 'open';
      if (s !== statusFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchQuery = opp.query.toLowerCase().includes(q);
      const matchUrl = opp.pageUrl.toLowerCase().includes(q);
      const matchTitle = (opp.title || '').toLowerCase().includes(q);
      if (!matchQuery && !matchUrl && !matchTitle) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="SEO Opportunity Intelligence Engine"
        subtitle="Evidence-based recommendations analyzing GSC search performance, crawler audit findings, AI Overviews readiness, and GEO/AEO signals"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Toast Notice */}
        {actionNotice && (
          <div className={`p-3.5 rounded-md border text-xs flex items-center justify-between shadow-xs animate-in fade-in ${
            actionNotice.isError
              ? 'bg-red-50 border-red-200 text-error'
              : 'bg-emerald-50 border-emerald-200 text-primary'
          }`}>
            <div className="flex items-center gap-2">
              {actionNotice.isError ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <Check className="w-4 h-4 shrink-0" />
              )}
              <span className="font-medium">{actionNotice.message}</span>
            </div>
            <Link href="/dashboard/action-center" className="font-semibold text-accent hover:underline">
              Open Action Center →
            </Link>
          </div>
        )}

        {/* Website Selector & Controls */}
        <div className="bg-card rounded-lg border border-border p-4 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <span className="text-[11px] font-bold text-muted block uppercase tracking-wider mb-1">
                Monitored Website
              </span>
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

            {/* Keyword Search Input */}
            <div>
              <span className="text-[11px] font-bold text-muted block uppercase tracking-wider mb-1">
                Filter by Keyword or Page
              </span>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. churn, templates, pricing..."
                  className="text-xs pl-8 pr-3 h-10 rounded-md border border-border bg-bg text-text outline-none focus:ring-2 focus:ring-primary/20 shadow-xs min-w-[200px]"
                />
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <span className="text-[11px] font-bold text-muted block uppercase tracking-wider mb-1">
                Priority
              </span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-xs font-medium px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 shadow-xs cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical Priority</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <span className="text-[11px] font-bold text-muted block uppercase tracking-wider mb-1">
                Status
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-medium px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 shadow-xs cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="actioned">Added to Action Center</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating || isLoading}
              className="px-3.5 h-10 rounded-md border border-border bg-card hover:bg-slate-50 text-text text-xs font-medium shadow-xs transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>{isRegenerating ? 'Re-analyzing...' : 'Refresh Analysis'}</span>
            </button>

            <Link
              href="/dashboard/gsc"
              className="px-3.5 h-10 rounded-md border border-border bg-card hover:bg-slate-50 text-accent text-xs font-medium shadow-xs transition-colors flex items-center gap-2"
            >
              <span>Regex Filter</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 10 Category Filter Pills (Section 7) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              categoryFilter === 'all'
                ? 'bg-primary text-white border-primary'
                : 'bg-card text-text border-border hover:bg-slate-50'
            }`}
          >
            All Categories ({opportunities.length})
          </button>

          {OPPORTUNITY_CATEGORIES.map((cat) => {
            const count = opportunities.filter(o => o.category === cat.id || o.type === cat.id).length;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                  categoryFilter === cat.id
                    ? 'bg-primary text-white border-primary'
                    : 'bg-card text-text border-border hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    categoryFilter === cat.id ? 'bg-white/20 text-white' : 'bg-bg text-muted'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Opportunities Count Label */}
        <div className="flex items-center justify-between text-xs text-muted font-mono">
          <span>Found <strong className="text-text">{filteredOpportunities.length}</strong> opportunities matching filter</span>
          <span>Showing verified GSC metrics & crawler connections</span>
        </div>

        {/* Opportunities Cards Grid */}
        <div className="grid grid-cols-1 gap-5">
          {filteredOpportunities.map((opp) => {
            const categoryMeta = OPPORTUNITY_CATEGORIES.find(c => c.id === opp.category) || {
              label: (opp.category || opp.type || 'Opportunity').replace(/_/g, ' '),
              icon: Target,
            };
            const CatIcon = categoryMeta.icon;
            const priorityVal = opp.priority || opp.potentialImpact || 'medium';
            const isStepsOpen = Boolean(expandedSteps[opp.id]);
            const isActioned = opp.status === 'actioned';

            return (
              <div
                key={opp.id}
                className={`bg-card rounded-lg border transition-all p-6 shadow-card space-y-4 ${
                  priorityVal === 'critical' ? 'border-red-200/80 hover:border-red-300' :
                  priorityVal === 'high' ? 'border-amber-200/80 hover:border-amber-300' :
                  'border-border hover:border-slate-300'
                }`}
              >
                {/* Header Row: Category Badge, Priority Badge, Status, Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-primary-tint text-primary border border-emerald-200">
                      <CatIcon className="w-3.5 h-3.5" />
                      <span>{categoryMeta.label}</span>
                    </span>

                    <span className={`text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      priorityVal === 'critical' ? 'bg-red-50 text-error border border-red-200' :
                      priorityVal === 'high' ? 'bg-amber-50 text-warning border border-amber-200' :
                      'bg-blue-50 text-accent border border-blue-200'
                    }`}>
                      {priorityVal} Priority
                    </span>

                    {opp.confidenceLevel && (
                      <span className="text-[10px] font-mono text-muted uppercase bg-bg px-2 py-0.5 rounded border border-border">
                        {opp.confidenceLevel} Confidence
                      </span>
                    )}

                    {isActioned && (
                      <span className="text-[10px] font-mono font-bold uppercase bg-emerald-50 text-primary border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>In Action Center</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/action-center?query=${encodeURIComponent(opp.query)}`}
                      className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md border border-border bg-card hover:bg-slate-50 text-accent text-xs font-medium shadow-xs transition-colors"
                    >
                      <Bot className="w-3.5 h-3.5 text-accent" />
                      <span>Fix with agent</span>
                    </Link>

                    <button
                      onClick={() => handleAddToActionCenter(opp)}
                      className={`inline-flex items-center gap-1.5 px-3.5 h-8 rounded-md text-xs font-semibold shadow-xs transition-colors ${
                        isActioned
                          ? 'border border-border bg-bg text-muted cursor-default'
                          : 'bg-primary hover:bg-primary-hover text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isActioned ? 'Added to Tasks' : 'Add to Action Center'}</span>
                    </button>
                  </div>
                </div>

                {/* Target Query & Landing Page Info */}
                <div>
                  <h4 className="text-base font-bold font-head text-text flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary shrink-0" />
                    <span>{opp.title || `Opportunity: "${opp.query}"`}</span>
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-muted mt-1.5">
                    <span>Target Query: <strong className="text-text font-semibold">&ldquo;{opp.query}&rdquo;</strong></span>
                    <span>•</span>
                    <a
                      href={opp.pageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-primary flex items-center gap-1 truncate max-w-md text-accent"
                    >
                      <span className="truncate">{opp.pageUrl}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                </div>

                {/* 4-Metric Verified GSC Performance Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-3 bg-bg rounded-md border border-border">
                    <span className="text-muted block text-[10px] uppercase font-sans font-medium">Average Position</span>
                    <span className="text-base font-bold text-text tnum">{opp.position}</span>
                  </div>
                  <div className="p-3 bg-bg rounded-md border border-border">
                    <span className="text-muted block text-[10px] uppercase font-sans font-medium">28d Impressions</span>
                    <span className="text-base font-bold text-text tnum">{opp.impressions.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-bg rounded-md border border-border">
                    <span className="text-muted block text-[10px] uppercase font-sans font-medium">28d Organic Clicks</span>
                    <span className="text-base font-bold text-primary tnum">{opp.clicks}</span>
                  </div>
                  <div className="p-3 bg-bg rounded-md border border-border">
                    <span className="text-muted block text-[10px] uppercase font-sans font-medium">Search CTR</span>
                    <span className="text-base font-bold text-text tnum">{(opp.ctr * 100).toFixed(2)}%</span>
                  </div>
                </div>

                {/* Expert Explanation & Evidence Section */}
                <div className="p-4 rounded-md bg-bg border border-border space-y-3 text-xs">
                  <div>
                    <strong className="text-text font-head font-bold block mb-0.5">What RankPilot Discovered:</strong>
                    <p className="text-muted leading-relaxed font-sans">{opp.hypothesis}</p>
                  </div>

                  {opp.whyItMatters && (
                    <div>
                      <strong className="text-text font-head font-bold block mb-0.5">Why This Matters:</strong>
                      <p className="text-muted leading-relaxed font-sans">{opp.whyItMatters}</p>
                    </div>
                  )}

                  {opp.expertExplanation && (
                    <div>
                      <strong className="text-text font-head font-bold block mb-0.5">SEO Strategist Explanation:</strong>
                      <p className="text-text font-medium leading-relaxed font-sans">{opp.expertExplanation}</p>
                    </div>
                  )}

                  {opp.recommendedStrategy && (
                    <div>
                      <strong className="text-primary font-head font-bold block mb-0.5">Recommended Strategy:</strong>
                      <p className="text-primary font-semibold leading-relaxed font-sans">{opp.recommendedStrategy}</p>
                    </div>
                  )}

                  {/* Connected Audit Finding Pill (Section 5) */}
                  {opp.evidence?.auditFindings && opp.evidence.auditFindings.length > 0 && (
                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-warning uppercase tracking-wider mb-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Connected Crawler Audit Finding</span>
                      </div>
                      <div className="space-y-1">
                        {opp.evidence.auditFindings.map((af, i) => (
                          <div key={i} className="p-2.5 rounded bg-card border border-amber-200/80 text-xs text-text">
                            <span className="font-bold text-warning uppercase text-[10px] mr-1.5">[{af.severity}]</span>
                            <span className="font-semibold">{af.title}</span>
                            {af.evidence?.actual && (
                              <span className="text-muted block text-[11px] font-mono mt-0.5">
                                Verified Proof: Expected &quot;{af.evidence.expected}&quot;, found &quot;{af.evidence.actual}&quot;
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Collapsible Step-by-Step Instructions & Verification Method */}
                <div className="space-y-2">
                  <button
                    onClick={() => toggleSteps(opp.id)}
                    className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                  >
                    <span>{isStepsOpen ? 'Hide Step-by-Step Implementation Instructions' : 'View Step-by-Step Implementation Instructions'}</span>
                    {isStepsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isStepsOpen && (
                    <div className="p-4 rounded-md bg-card border border-border space-y-3 text-xs animate-in fade-in">
                      <div>
                        <strong className="text-text font-bold block mb-1">Implementation Steps:</strong>
                        <ol className="list-decimal pl-4 space-y-1.5 text-muted leading-relaxed">
                          {(opp.implementationSteps || [opp.recommendedAction]).map((step, sIdx) => (
                            <li key={sIdx}>{step}</li>
                          ))}
                        </ol>
                      </div>

                      {opp.expectedBenefit && (
                        <div>
                          <strong className="text-text font-bold block mb-0.5">Expected SEO Benefit:</strong>
                          <p className="text-emerald-700 font-medium">{opp.expectedBenefit}</p>
                        </div>
                      )}

                      {opp.verificationMethod && (
                        <div>
                          <strong className="text-text font-bold block mb-0.5">Recommended Verification Method:</strong>
                          <p className="text-muted font-mono text-[11px]">{opp.verificationMethod}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredOpportunities.length === 0 && !isLoading && (
            <div className="text-center py-16 bg-card rounded-lg border border-dashed border-border shadow-card space-y-3">
              <Sparkles className="w-10 h-10 text-muted mx-auto" />
              <p className="text-sm font-medium text-text">No opportunities match the current filter selection.</p>
              <button
                onClick={() => { setCategoryFilter('all'); setPriorityFilter('all'); setStatusFilter('all'); setSearchQuery(''); }}
                className="px-4 h-10 rounded-md border border-border bg-card hover:bg-slate-50 text-text font-medium text-xs shadow-xs"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
