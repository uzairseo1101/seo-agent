'use client';

import React from 'react';
import DashboardHeader from '@/components/dashboard-header';
import { ShieldCheck, Lock, Eye, AlertCircle, FileCode2, Database } from 'lucide-react';

export default function TrustCenterPage() {
  return (
    <div>
      <DashboardHeader
        title="Trust, Methodology & Accuracy Center"
        subtitle="Full transparency into our safe crawler architecture, scoring formulas, data boundaries and AI guardrails"
      />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Core Principles */}
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

        {/* Detailed Methodology Sections */}
        <div className="bg-white rounded-xl border border-surface-border p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-sm font-bold text-navy mb-2 flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-brand-600" />
              1. What Our Safe Crawler Checks (and What It Does Not)
            </h2>
            <div className="text-xs text-surface-muted space-y-2 leading-relaxed">
              <p>
                <strong>What We Check:</strong> Missing/empty/long titles, meta descriptions, H1 hierarchy, canonical consistency, robots.txt, sitemaps, internal links, HTTP status codes, schema JSON-LD presence, mobile viewports, and open graph markup.
              </p>
              <p>
                <strong>What We Do Not Claim:</strong> We do not claim to measure real Core Web Vitals from static HTML alone. We do not claim access to private Google algorithm weights, and we never claim a 100% ranking guarantee.
              </p>
            </div>
          </div>

          <div className="border-t border-surface-border pt-6">
            <h2 className="text-sm font-bold text-navy mb-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-brand-600" />
              2. Proprietary GEO & AEO Scores
            </h2>
            <div className="text-xs text-surface-muted space-y-2 leading-relaxed">
              <p>
                <strong>GEO Score (Generative Engine Optimization):</strong> Evaluates brand entity clarity, author expertise signals (Schema.org Person), source transparency, and topical structure. Labeled as a proprietary diagnostic assessment.
              </p>
              <p>
                <strong>AEO Score (Answer Engine Optimization):</strong> Evaluates direct-answer formatting, question-based headings, and FAQPage schema readiness for conversational and answer engines.
              </p>
            </div>
          </div>

          <div className="border-t border-surface-border pt-6">
            <h2 className="text-sm font-bold text-navy mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-brand-600" />
              3. Prompt Injection Defense
            </h2>
            <div className="text-xs text-surface-muted leading-relaxed">
              Crawled webpage HTML is untrusted input. Our AI orchestrator parses webpage data within isolated non-executable data boundaries. System instructions cannot be overridden by text or scripts found inside crawled customer pages.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
