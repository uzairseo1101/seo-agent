'use client';

import React from 'react';
import Link from 'next/link';
import { FileSearch, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function SeoWebsiteAuditPage() {
  const auditChecks = [
    'Missing or empty Title Tags & length validation',
    'Meta description length, presence, and duplicate checks',
    'Heading structure (H1 hierarchy, multiple H1 observations)',
    'Canonical tag presence and self-referential consistency',
    'Robots.txt accessibility, syntax, and sitemap references',
    'Meta robots & X-Robots-Tag indexability signals',
    'Internal link discovery, broken link signals, and descriptive anchors',
    'HTTP status code validation (200, 301, 302, 404, 500)',
    'Structured Data detection (Schema.org JSON-LD presence)',
    'Mobile viewport declaration and basic responsiveness signals',
    'Language attributes and hreflang configuration checks',
  ];

  return (
    <div className="py-16 sm:py-24 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">Module 01: Audit Intelligence</span>
        <h1 className="text-3xl sm:text-[48px] font-bold font-head text-text tracking-tight leading-[1.15]">
          Safe Technical SEO Audits Built for Action
        </h1>
        <p className="text-base text-muted leading-relaxed">
          Evaluate 30+ technical and on-page standards with our lightweight, SSRF-safe crawler. Every finding includes exact HTML evidence and translates directly into an Action Center task.
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-6 sm:p-8 shadow-card space-y-6 max-w-4xl mx-auto">
        <h2 className="text-lg font-bold font-head text-text flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-primary" />
          <span>Technical Checks Performed on Every Crawl</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {auditChecks.map((check) => (
            <div key={check} className="flex items-start gap-2.5 text-xs text-text">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>{check}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-lg bg-bg border border-border space-y-3 max-w-4xl mx-auto">
        <h3 className="text-sm font-bold font-head text-text flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Safe Crawler Guarantees</span>
        </h3>
        <p className="text-xs text-muted leading-relaxed">
          Our crawler honors robots.txt, respects crawl rate limits, and uses strict anti-SSRF protections to block private IP ranges (127.0.0.1, 10.0.0.0/8, 192.168.0.0/16, AWS metadata 169.254.169.254) and non-standard ports. Initial development audits are capped at a safe 25-page sample.
        </p>
      </div>

      <div className="text-center pt-2">
        <Link
          href="/dashboard/audits"
          className="inline-flex items-center gap-2 px-6 h-10 rounded-md bg-primary hover:bg-primary-hover text-white font-medium text-sm shadow-xs transition-colors"
        >
          <span>Run Website Audit in Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
