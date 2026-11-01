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
    <div className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Module 01: Audit Intelligence</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-navy tracking-tight">
          Safe Technical SEO Audits Built for Action
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-surface-muted leading-relaxed">
          Evaluate 30+ technical and on-page standards with our lightweight, SSRF-safe crawler. Every finding includes exact HTML evidence and translates directly into an Action Center task.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-surface-border p-8 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-navy flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-brand-600" />
          Technical Checks Performed on Every Crawl
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {auditChecks.map((check) => (
            <div key={check} className="flex items-start gap-2.5 text-xs text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{check}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-50 border border-surface-border space-y-3">
        <h3 className="text-sm font-bold text-navy flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Safe Crawler Guarantees
        </h3>
        <p className="text-xs text-surface-muted leading-relaxed">
          Our crawler honors robots.txt, respects crawl rate limits, and uses strict anti-SSRF protections to block private IP ranges (127.0.0.1, 10.0.0.0/8, 192.168.0.0/16, AWS metadata 169.254.169.254) and non-standard ports. Initial development audits are capped at a safe 25-page sample.
        </p>
      </div>

      <div className="text-center">
        <Link
          href="/dashboard/audits"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition-all"
        >
          Run Website Audit in Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
