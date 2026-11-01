'use client';

import React, { useState } from 'react';
import DashboardHeader from '@/components/dashboard-header';
import {
  ShieldCheck,
  Lock,
  Eye,
  AlertCircle,
  FileCode2,
  Database,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  HelpCircle,
  Cpu
} from 'lucide-react';

export default function TrustCenterPage() {
  const [activeTab, setActiveTab] = useState<'crawler' | 'scoring' | 'ai' | 'security'>('crawler');

  return (
    <div>
      <DashboardHeader
        title="Trust, Methodology & Accuracy Center"
        subtitle="Full transparency into our safe crawler architecture, scoring formulas, data boundaries and AI guardrails"
      />

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Core Principles Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-surface-border shadow-sm">
            <ShieldCheck className="w-6 h-6 text-emerald-600 mb-2" />
            <h3 className="text-sm font-bold text-navy">Read-Only Safety</h3>
            <p className="text-xs text-surface-muted mt-1 leading-relaxed">
              RankPilot AI never modifies customer websites, never writes to CMS instances, and never touches live robots.txt or sitemaps.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-surface-border shadow-sm">
            <Lock className="w-6 h-6 text-brand-600 mb-2" />
            <h3 className="text-sm font-bold text-navy">Anti-SSRF Protection</h3>
            <p className="text-xs text-surface-muted mt-1 leading-relaxed">
              Our crawler strictly blocks loopbacks, private RFC-1918 subnets, AWS metadata endpoints, and non-standard ports.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-surface-border shadow-sm">
            <Eye className="w-6 h-6 text-indigo-600 mb-2" />
            <h3 className="text-sm font-bold text-navy">Evidence-Backed Only</h3>
            <p className="text-xs text-surface-muted mt-1 leading-relaxed">
              Every audit finding links to actual DOM / HTTP header evidence. Hallucinated or invented SEO scores are strictly rejected.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-surface-border pb-1">
          <button
            onClick={() => setActiveTab('crawler')}
            className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors ${activeTab === 'crawler' ? 'bg-indigo-50 text-brand-700 border border-indigo-200' : 'text-surface-muted hover:text-navy'}`}
          >
            Crawler Mechanics
          </button>
          <button
            onClick={() => setActiveTab('scoring')}
            className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors ${activeTab === 'scoring' ? 'bg-indigo-50 text-brand-700 border border-indigo-200' : 'text-surface-muted hover:text-navy'}`}
          >
            Scoring Formulas
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors ${activeTab === 'ai' ? 'bg-indigo-50 text-brand-700 border border-indigo-200' : 'text-surface-muted hover:text-navy'}`}
          >
            AI Guardrails & Injection Defense
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors ${activeTab === 'security' ? 'bg-indigo-50 text-brand-700 border border-indigo-200' : 'text-surface-muted hover:text-navy'}`}
          >
            Privacy & RLS Security
          </button>
        </div>

        {/* Tab Content 1: Crawler Mechanics */}
        {activeTab === 'crawler' && (
          <div className="bg-white rounded-xl border border-surface-border p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-bold text-navy mb-2 flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-brand-600" />
                Lightweight Safe Crawler Implementation
              </h3>
              <p className="text-xs text-surface-muted leading-relaxed">
                RankPilot AI operates a safe internal crawler using Node.js fetch and Cheerio HTML DOM parsing, avoiding heavy headless browser overhead while honoring strict safety parameters:
              </p>
              <ul className="mt-3 space-y-2 text-xs text-slate-700 list-disc list-inside pl-2">
                <li><strong>Pre-Crawl DNS Resolution:</strong> Destination IPs are resolved and validated before initiating HTTP requests.</li>
                <li><strong>SSRF IP Filters:</strong> Rejects loopback (`127.0.0.1`, `::1`), private networks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and AWS cloud metadata (`169.254.169.254`).</li>
                <li><strong>Port Whitelist:</strong> Only standard HTTP (port 80) and HTTPS (port 443) are permitted.</li>
                <li><strong>Rate Throttling:</strong> 400ms delay between fetches to prevent server strain.</li>
                <li><strong>Robots.txt & Sitemap:</strong> Honors Disallow directives for User-Agent: RankPilotAI-AuditBot and User-Agent: *.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab Content 2: Scoring Formulas */}
        {activeTab === 'scoring' && (
          <div className="bg-white rounded-xl border border-surface-border p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-bold text-navy mb-2 flex items-center gap-2">
                <Database className="w-4 h-4 text-brand-600" />
                Transparent 0–100 Mathematical Scoring Formulas
              </h3>
              <p className="text-xs text-surface-muted leading-relaxed">
                No black-box scores. All calculations start at a baseline of 100 points, with deductions weighted by verifiable severity:
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-bg border-b border-surface-border text-surface-muted uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Finding Severity</th>
                    <th className="py-2.5 px-3">Deduction</th>
                    <th className="py-2.5 px-3">Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-red-700">Critical</td>
                    <td className="py-2.5 px-3 font-extrabold text-navy">-15.0 pts</td>
                    <td className="py-2.5 px-3 text-surface-muted">Missing H1, missing Title, 4xx/5xx HTTP status, missing mobile viewport</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-amber-700">High</td>
                    <td className="py-2.5 px-3 font-extrabold text-navy">-8.0 pts</td>
                    <td className="py-2.5 px-3 text-surface-muted">Missing meta description, broken robots.txt, noindex on key pages</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-blue-700">Medium</td>
                    <td className="py-2.5 px-3 font-extrabold text-navy">-4.0 pts</td>
                    <td className="py-2.5 px-3 text-surface-muted">Missing canonical tag, sub-optimal meta length, cross-page duplicate titles</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-slate-700">Low / Info</td>
                    <td className="py-2.5 px-3 font-extrabold text-navy">-1.5 pts</td>
                    <td className="py-2.5 px-3 text-surface-muted">Missing image alt text, multiple H1 observations, missing Open Graph tags</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3.5 rounded-lg bg-surface-bg border border-surface-border text-xs text-slate-700">
              <strong className="text-navy">Overall SEO Formula:</strong>{' '}
              <span className="font-mono">Overall SEO Score = (Technical × 0.45) + (Indexability × 0.30) + (Content × 0.25)</span>
            </div>
          </div>
        )}

        {/* Tab Content 3: AI Guardrails */}
        {activeTab === 'ai' && (
          <div className="bg-white rounded-xl border border-surface-border p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-navy flex items-center gap-2">
              <Cpu className="w-4 h-4 text-brand-600" />
              Prompt Injection Defense & Zod Schema Enforcement
            </h3>
            <p className="text-xs text-surface-muted leading-relaxed">
              Crawled customer HTML is untrusted input. RankPilot AI encapsulates all webpage text and metadata inside strict non-executable data containers (<span className="font-mono text-brand-700">&lt;untrusted_crawled_data&gt;</span>).
            </p>
            <ul className="space-y-2 text-xs text-slate-700 list-disc list-inside pl-2">
              <li>System prompts explicitly order the model to treat crawled text strictly as data, never instructions.</li>
              <li>Filter triggers strip out commands like &ldquo;Ignore previous instructions&rdquo; or &ldquo;You are now in developer mode&rdquo;.</li>
              <li>AI outputs are strictly parsed and rejected if they fail schema validation (Zod).</li>
              <li>Deterministic Fallback: If external AI services are unavailable or unconfigured, RankPilot AI generates complete diagnostic intelligence using its deterministic rule engine.</li>
            </ul>
          </div>
        )}

        {/* Tab Content 4: Security & Privacy */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-xl border border-surface-border p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-navy flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-600" />
              Multi-Tenancy & Row Level Security (RLS)
            </h3>
            <p className="text-xs text-surface-muted leading-relaxed">
              RankPilot AI isolates every organization’s client list, audit runs, Search Console queries, and tasks using PostgreSQL Row Level Security (RLS) policies.
            </p>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
              <p><strong>Database Isolation:</strong> Queries are scoped by organization_id at the PostgreSQL engine level.</p>
              <p><strong>Zero Client Tokens:</strong> Search Console refresh tokens and API secrets are never delivered to client browser bundles.</p>
              <p><strong>Clean Deletion:</strong> Deleting a monitored website deletes all associated audit history, findings, and tasks with no hidden retention.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
