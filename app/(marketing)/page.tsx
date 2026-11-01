import React from 'react';
import Link from 'next/link';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  FileSearch,
  Search,
  CheckSquare,
  BarChart3,
  Layers,
  Repeat
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-24 py-12 sm:py-20">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-700">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>The Action-Oriented SEO Intelligence Platform for Agencies</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-navy tracking-tight leading-[1.15]">
          Turn SEO Data into <br className="hidden sm:inline" />
          <span className="text-brand-600">Evidence-Backed Actions</span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-surface-muted leading-relaxed">
          Connect your website. Discover SEO, GEO and AEO opportunities. Get prioritized tasks, monitor performance with Google Search Console, and verify improvements automatically.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
          >
            Launch Agency Workspace
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-surface-border hover:bg-slate-50 text-navy font-semibold text-sm shadow-sm transition-all"
          >
            See How It Works
          </Link>
        </div>

        {/* Workflow Chain */}
        <div className="pt-8">
          <p className="text-xs uppercase tracking-wider font-bold text-surface-muted mb-4">
            The Complete Operational Workflow
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-navy">
            {['CONNECT', 'ANALYZE', 'DISCOVER', 'PRIORITIZE', 'NOTIFY', 'EXECUTE', 'VERIFY', 'REPORT'].map((step, idx) => (
              <React.Fragment key={step}>
                <span className="px-3 py-1.5 rounded-lg bg-white border border-surface-border shadow-xs">
                  {step}
                </span>
                {idx < 7 && <span className="text-slate-400">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiation Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy text-white rounded-3xl p-8 sm:p-14 shadow-xl">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">The Problem with Traditional SEO Tools</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-2 text-white">
              Why build another generic SEO audit PDF generator?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
              Most audit tools spit out a 50-page PDF with hundreds of generic warnings that nobody reads. RankPilot AI connects every single finding to actual agency work, establishes clear prioritization, and verifies live fixes via automated re-audits.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-indigo-400 font-mono text-xs font-bold">01. Evidence First</span>
              <h3 className="text-sm font-bold text-white">Verified HTML & HTTP Data</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                No hallucinated errors. Every finding cites exact lines, DOM snippets, and status codes.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-indigo-400 font-mono text-xs font-bold">02. Direct Action Tasks</span>
              <h3 className="text-sm font-bold text-white">Action Center Pipeline</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Convert discovered issues and high-ROI GSC opportunities into trackable tasks with step-by-step instructions.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-indigo-400 font-mono text-xs font-bold">03. Automated Verification</span>
              <h3 className="text-sm font-bold text-white">Live Re-Crawl Recheck</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                When a task is marked complete, our crawler rechecks the URL to confirm the fix actually solved the issue.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-indigo-400 font-mono text-xs font-bold">04. GEO & AEO Ready</span>
              <h3 className="text-sm font-bold text-white">Beyond Traditional SEO</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Audit Generative Engine Optimization (brand entity clarity) and Answer Engine Optimization (direct answer markup).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy">
            The Modern SEO Agency Operating System
          </h2>
          <p className="text-sm text-surface-muted leading-relaxed">
            Eliminate fragmented tools, spreadsheets, and manual rechecking. Manage discovery, prioritization, execution, and reporting in one unified dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-7 rounded-2xl border border-surface-border shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-brand-600">
              <FileSearch className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-navy">Website SEO, GEO & AEO Auditor</h3>
            <p className="text-xs text-surface-muted leading-relaxed">
              Safe in-house crawler with anti-SSRF protection. Audits 30+ technical standards, schema markup, entity clarity, and direct-answer structures.
            </p>
            <Link href="/seo-website-audit" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">
              Learn about Auditor <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-surface-border shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-navy">Google Search Console Intelligence</h3>
            <p className="text-xs text-surface-muted leading-relaxed">
              Read-only OAuth integration. Uncover striking-distance queries (positions 5–20) and investigate 28-day traffic drops deterministically.
            </p>
            <Link href="/gsc-intelligence" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">
              Explore GSC Engine <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-surface-border shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-navy">SEO Action Center & Verification</h3>
            <p className="text-xs text-surface-muted leading-relaxed">
              Prioritize agency work by impact. Automatically re-check URLs on future crawl passes to verify whether completed tasks actually resolved issues.
            </p>
            <Link href="/action-management" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">
              Explore Action Center <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Methodology Callout */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-slate-50 border border-surface-border rounded-2xl p-8 space-y-4">
        <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto" />
        <h3 className="text-lg font-bold text-navy">Built on Trust, Accuracy and Safety</h3>
        <p className="max-w-2xl mx-auto text-xs text-surface-muted leading-relaxed">
          RankPilot AI operates on read-only principles. We never edit client websites, never make unverified ranking claims, and protect every organization with strict Row Level Security (RLS).
        </p>
        <Link
          href="/trust-and-methodology"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
        >
          Read our Trust & Methodology Standards <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </section>
    </div>
  );
}
