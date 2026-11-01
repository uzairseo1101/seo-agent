'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileSearch,
  Search,
  Sparkles,
  Bot,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Terminal,
  Download
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip as RechartsTooltip
} from 'recharts';
import { cn } from '@/lib/utils';
import { mockGscTrends } from '@/lib/mock-data';

interface ShowcaseTab {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
}

const tabs: ShowcaseTab[] = [
  { id: 'overview', name: 'Overview Dashboard', icon: LayoutDashboard, tagline: 'Multi-domain health monitoring and search trajectory' },
  { id: 'audits', name: 'Technical Audits', icon: FileSearch, tagline: '30+ automated checks with mathematical severity scoring' },
  { id: 'gsc', name: 'Opportunity Finder', icon: Search, tagline: 'GSC striking-distance queries (positions 5–20)' },
  { id: 'actions', name: 'Action Center & Verification', icon: Bot, tagline: 'Prioritized tasks with automated re-crawl verification' },
  { id: 'reports', name: 'Executive Reports', icon: FileText, tagline: '1-click white-label PDF reports proving verified ROI' },
  { id: 'trust', name: 'Trust Center', icon: ShieldCheck, tagline: '100% transparent scoring and evidence formulas' },
];

export default function ProductShowcase() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Tab Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2.5 rounded-md text-xs font-medium whitespace-nowrap transition-all border',
                isActive
                  ? 'bg-card border-primary text-primary shadow-xs font-semibold'
                  : 'bg-card/50 hover:bg-card border-border text-muted hover:text-text'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'text-primary' : 'text-muted')} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Browser Frame Mockup */}
      <div className="bg-card rounded-lg border border-border shadow-pop overflow-hidden">
        {/* Browser Top Window Bar */}
        <div className="h-10 px-4 bg-slate-100 dark:bg-slate-800/80 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          </div>

          <div className="flex items-center gap-2 bg-card border border-border px-3 py-1 rounded-sm text-[11px] font-mono text-muted w-72 truncate justify-center">
            <span className="w-2 h-2 rounded-full bg-primary shrink-0"></span>
            <span>app.rankpilot.ai/dashboard/{activeTab}</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-primary bg-primary-tint px-2 py-0.5 rounded-full border border-emerald-200">
            <span>Verified System</span>
          </div>
        </div>

        {/* Tab Content Display Area */}
        <div className="p-5 sm:p-7 min-h-[440px] bg-bg/40">
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-card p-4 rounded-md border border-border shadow-xs">
                  <span className="text-[11px] font-medium text-muted block">SEO Health Score</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold font-mono text-text tnum">84</span>
                    <span className="text-xs text-muted font-mono">/ 100</span>
                  </div>
                  <span className="text-[10px] font-mono text-primary mt-1 block">+4.2 pts this month</span>
                </div>

                <div className="bg-card p-4 rounded-md border border-border shadow-xs">
                  <span className="text-[11px] font-medium text-muted block">GEO Entity Clarity</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold font-mono text-accent tnum">88</span>
                    <span className="text-xs text-muted font-mono">/ 100</span>
                  </div>
                  <span className="text-[10px] font-mono text-accent mt-1 block">Brand disambiguated</span>
                </div>

                <div className="bg-card p-4 rounded-md border border-border shadow-xs">
                  <span className="text-[11px] font-medium text-muted block">AEO Answer Readiness</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold font-mono text-text tnum">91</span>
                    <span className="text-xs text-muted font-mono">/ 100</span>
                  </div>
                  <span className="text-[10px] font-mono text-primary mt-1 block">Answer-first schema</span>
                </div>

                <div className="bg-card p-4 rounded-md border border-border shadow-xs">
                  <span className="text-[11px] font-medium text-muted block">Verified Fixes</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold font-mono text-text tnum">18</span>
                    <span className="text-xs text-muted font-mono">tasks</span>
                  </div>
                  <span className="text-[10px] font-mono text-primary mt-1 block">100% re-crawl verified</span>
                </div>
              </div>

              {/* Chart & Active Site Row */}
              <div className="bg-card p-5 rounded-md border border-border shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold font-head text-text">
                      Search Console Organic Growth (Last 30 Days)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-primary font-medium">● Clicks</span>
                    <span className="text-accent font-medium">● Impressions</span>
                  </div>
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockGscTrends.slice(0, 15)}>
                      <defs>
                        <linearGradient id="showcaseGreen" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                      <XAxis dataKey="date" stroke="#64748B" fontSize={10} fontFamily="IBM Plex Mono" />
                      <YAxis stroke="#64748B" fontSize={10} fontFamily="IBM Plex Mono" />
                      <Area type="monotone" dataKey="clicks" stroke="#059669" strokeWidth={2} fill="url(#showcaseGreen)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TECHNICAL AUDIT */}
          {activeTab === 'audits' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div>
                  <h4 className="text-xs font-bold font-head text-text">Audit Findings & Severity Scoring</h4>
                  <p className="text-[11px] text-muted">Transparent mathematical deductions mapped to exact URLs</p>
                </div>
                <span className="text-xs font-mono font-bold text-text">30 Checks Complete</span>
              </div>

              <div className="space-y-2.5">
                <div className="p-3.5 rounded-md bg-card border border-border shadow-xs flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-red-50 text-error border border-red-200">
                        Critical · -15 Pts
                      </span>
                      <span className="text-[11px] font-mono text-muted">/services/technical-seo</span>
                    </div>
                    <p className="text-xs font-semibold text-text">Missing H1 Heading in Primary DOM Hierarchy</p>
                    <p className="text-[11px] text-muted">Search engine crawlers and answer engines cannot resolve primary topical entity.</p>
                  </div>
                  <button className="px-3 h-8 bg-primary hover:bg-primary-hover text-white text-[11px] font-medium rounded-md shadow-xs shrink-0 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Fix with agent
                  </button>
                </div>

                <div className="p-3.5 rounded-md bg-card border border-border shadow-xs flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-warning border border-amber-200">
                        Warning · -8 Pts
                      </span>
                      <span className="text-[11px] font-mono text-muted">/blog/aeo-guide</span>
                    </div>
                    <p className="text-xs font-semibold text-text">Unclosed Schema.org Article Graph</p>
                    <p className="text-[11px] text-muted">JSON-LD lacks author entity reference; generative AI engines skip citation attribution.</p>
                  </div>
                  <button className="px-3 h-8 bg-card border border-border text-text hover:bg-slate-50 text-[11px] font-medium rounded-md shadow-xs shrink-0 flex items-center gap-1">
                    <span>Inspect code</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-md bg-card border border-border shadow-xs flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-primary-tint text-primary border border-emerald-200">
                        Good · Verified
                      </span>
                      <span className="text-[11px] font-mono text-muted">/pricing</span>
                    </div>
                    <p className="text-xs font-semibold text-text">Canonical URL & Self-Referencing Tag Verified</p>
                    <p className="text-[11px] text-muted">200 OK response with accurate rel=canonical tag.</p>
                  </div>
                  <span className="text-xs font-mono text-primary font-medium shrink-0 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> No deduction
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OPPORTUNITY FINDER */}
          {activeTab === 'gsc' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div>
                  <h4 className="text-xs font-bold font-head text-text">Striking-Distance Search Queries</h4>
                  <p className="text-[11px] text-muted">Google Search Console queries ranked 5–20 with high impression volume</p>
                </div>
                <span className="text-[11px] font-mono text-primary bg-primary-tint px-2 py-0.5 rounded-full border border-emerald-200">
                  High-Impact Targets
                </span>
              </div>

              <div className="bg-card rounded-md border border-border shadow-xs overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-border text-[10px] font-mono text-muted uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Query</th>
                      <th className="py-2.5 px-3 text-center">Position</th>
                      <th className="py-2.5 px-3 text-center">Impressions</th>
                      <th className="py-2.5 px-3 text-center">CTR</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-mono">
                    <tr className="hover:bg-bg/60">
                      <td className="py-2.5 px-3 font-sans font-medium text-text">b2b seo action management</td>
                      <td className="py-2.5 px-3 text-center font-bold text-text">6.4 <span className="text-primary text-[10px]">(+3)</span></td>
                      <td className="py-2.5 px-3 text-center tnum">18,400</td>
                      <td className="py-2.5 px-3 text-center text-muted">1.8%</td>
                      <td className="py-2.5 px-3 text-right font-sans">
                        <button className="px-2 py-1 bg-primary-tint text-primary border border-emerald-200 rounded text-[10px] font-semibold hover:bg-emerald-100">
                          Create Task
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-bg/60">
                      <td className="py-2.5 px-3 font-sans font-medium text-text">ai website audit for agencies</td>
                      <td className="py-2.5 px-3 text-center font-bold text-text">8.1 <span className="text-primary text-[10px]">(+2)</span></td>
                      <td className="py-2.5 px-3 text-center tnum">12,650</td>
                      <td className="py-2.5 px-3 text-center text-muted">2.4%</td>
                      <td className="py-2.5 px-3 text-right font-sans">
                        <button className="px-2 py-1 bg-primary-tint text-primary border border-emerald-200 rounded text-[10px] font-semibold hover:bg-emerald-100">
                          Create Task
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-bg/60">
                      <td className="py-2.5 px-3 font-sans font-medium text-text">generative engine optimization software</td>
                      <td className="py-2.5 px-3 text-center font-bold text-text">11.3 <span className="text-primary text-[10px]">(+5)</span></td>
                      <td className="py-2.5 px-3 text-center tnum">9,200</td>
                      <td className="py-2.5 px-3 text-center text-muted">1.2%</td>
                      <td className="py-2.5 px-3 text-right font-sans">
                        <button className="px-2 py-1 bg-primary-tint text-primary border border-emerald-200 rounded text-[10px] font-semibold hover:bg-emerald-100">
                          Create Task
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ACTION CENTER & TASK VERIFICATION */}
          {activeTab === 'actions' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div>
                  <h4 className="text-xs font-bold font-head text-text">Action Task Execution & Verification</h4>
                  <p className="text-[11px] text-muted">Automated re-crawls verify that code fixes were actually deployed in live HTML</p>
                </div>
                <span className="text-[11px] font-mono text-accent bg-accent-tint px-2 py-0.5 rounded-full border border-blue-200">
                  Re-Crawl Engine Active
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-md bg-card border border-emerald-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-primary bg-primary-tint px-2 py-0.5 rounded-full border border-emerald-200">
                      Completed — Verified
                    </span>
                    <span className="text-[11px] font-mono text-muted">Re-crawl: 2 mins ago</span>
                  </div>
                  <h5 className="text-xs font-bold text-text">Implement FAQPage Structured Schema on Pricing Page</h5>
                  <div className="p-2.5 rounded bg-bg border border-border text-[11px] font-mono text-muted space-y-1">
                    <p className="text-primary font-semibold">&gt; Re-crawl target: https://example.com/pricing</p>
                    <p>&gt; Valid FAQPage JSON-LD graph detected with 6 validated question entities.</p>
                    <p className="text-text font-bold">&gt; Resolution Confirmed: +15 Points restored to SEO Score.</p>
                  </div>
                </div>

                <div className="p-4 rounded-md bg-card border border-amber-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-warning bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Awaiting Re-Crawl
                    </span>
                    <span className="text-[11px] font-mono text-muted">Marked done by dev team</span>
                  </div>
                  <h5 className="text-xs font-bold text-text">Fix 404 Broken Internal Link on Homepage Footer</h5>
                  <p className="text-[11px] text-muted">Scheduled for automated re-crawl pass during next 6-hour cycle.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: EXECUTIVE REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div>
                  <h4 className="text-xs font-bold font-head text-text">Executive Client Performance Report</h4>
                  <p className="text-[11px] text-muted">White-label PDF report proving verified improvements and organic progress</p>
                </div>
                <button className="h-8 px-3 bg-primary hover:bg-primary-hover text-white text-[11px] font-medium rounded-md shadow-xs flex items-center gap-1.5">
                  <Download className="w-3 h-3" /> Export PDF
                </button>
              </div>

              <div className="p-5 rounded-md bg-card border border-border shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <span className="text-[10px] font-mono text-muted uppercase">Client Domain</span>
                    <h5 className="text-sm font-bold font-head text-text">Apex Digital — Monthly Progress Report</h5>
                  </div>
                  <span className="font-mono text-xs text-muted">Nov 1, 2026</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center font-mono">
                  <div className="p-3 rounded bg-bg border border-border">
                    <span className="text-[10px] text-muted block uppercase">Pages Audited</span>
                    <span className="text-lg font-bold text-text tnum">100</span>
                  </div>
                  <div className="p-3 rounded bg-bg border border-border">
                    <span className="text-[10px] text-muted block uppercase">Verified Fixes</span>
                    <span className="text-lg font-bold text-primary tnum">14</span>
                  </div>
                  <div className="p-3 rounded bg-bg border border-border">
                    <span className="text-[10px] text-muted block uppercase">Organic Clicks</span>
                    <span className="text-lg font-bold text-accent tnum">+28.2%</span>
                  </div>
                </div>

                <div className="p-3 rounded bg-primary-tint/30 border border-emerald-200 text-xs text-text">
                  <strong className="text-primary font-semibold">Executive Summary:</strong> Verified resolution of 3 critical canonical defects restored ranking stability across 12 high-intent product queries, driving a 28.2% increase in monthly Search Console organic clicks.
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: TRUST CENTER */}
          {activeTab === 'trust' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div>
                  <h4 className="text-xs font-bold font-head text-text">Deterministic Scoring & Evidence Breakdown</h4>
                  <p className="text-[11px] text-muted">100% transparent point deductions. Zero black-box AI hallucinations</p>
                </div>
                <Link href="/trust-and-methodology" className="text-xs text-accent hover:underline flex items-center gap-1">
                  Full Methodology <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-md bg-card border border-border shadow-xs space-y-1.5">
                  <span className="font-semibold text-text block">Category Weightings</span>
                  <div className="space-y-1 text-muted font-mono text-[11px]">
                    <div className="flex justify-between"><span>Technical Foundation:</span><strong className="text-text">30%</strong></div>
                    <div className="flex justify-between"><span>On-Page & Headings:</span><strong className="text-text">25%</strong></div>
                    <div className="flex justify-between"><span>Indexability & Links:</span><strong className="text-text">20%</strong></div>
                    <div className="flex justify-between"><span>AEO Direct Answer Readiness:</span><strong className="text-text">15%</strong></div>
                    <div className="flex justify-between"><span>GEO Entity Disambiguation:</span><strong className="text-text">10%</strong></div>
                  </div>
                </div>

                <div className="p-3.5 rounded-md bg-card border border-border shadow-xs space-y-1.5">
                  <span className="font-semibold text-text block">Read-Only Safety Guarantee</span>
                  <p className="text-muted leading-relaxed">
                    Our Google OAuth integration requests strictly read-only Search Console access. RankPilot never alters your robots.txt, sitemaps, or Google configurations.
                  </p>
                  <span className="text-[10px] font-mono text-primary font-medium block">
                    SSRF Boundary Guard: Active & Verified
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
