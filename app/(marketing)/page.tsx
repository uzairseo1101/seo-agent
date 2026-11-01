'use client';

import React, { useState } from 'react';
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
  Bot,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Layers,
  Clock,
  ChevronRight,
  Activity
} from 'lucide-react';

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="space-y-0">
      {/* 1. HERO SECTION (White Background) */}
      <section className="bg-card py-16 sm:py-24 border-b border-border transition-colors">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-tint border border-emerald-200/80 text-xs font-medium text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered SEO Intelligence & Action Management</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-[48px] font-bold font-head text-text tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Turn SEO Data into <span className="text-primary">Verified Actions</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base text-muted leading-relaxed">
            Connect your website. Discover SEO, GEO and AEO opportunities. Get prioritized agency tasks, monitor search performance, and verify fixes automatically with AI intelligence.
          </p>

          {/* Action CTAs: Exactly ONE Primary Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 h-10 rounded-md bg-primary hover:bg-primary-hover text-white font-medium text-sm shadow-xs transition-colors"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 h-10 rounded-md bg-card border border-border hover:bg-slate-50 dark:hover:bg-slate-800 text-text font-medium text-sm shadow-xs transition-colors"
            >
              See How It Works
            </Link>
          </div>

          {/* Realistic Dashboard Preview with Soft Shadow */}
          <div className="pt-8 max-w-5xl mx-auto">
            <div className="rounded-lg border border-border bg-card p-4 sm:p-6 shadow-card transition-all text-left space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                  <span className="text-xs font-mono text-muted ml-2">app.rankpilot.ai/dashboard</span>
                </div>
                <span className="text-[11px] font-mono font-medium text-primary bg-primary-tint px-2 py-0.5 rounded-full">
                  Live Verification Engine
                </span>
              </div>

              {/* Mock Dashboard Rows */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-md bg-bg border border-border space-y-1">
                  <span className="text-xs text-muted font-medium">Technical SEO Score</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-text">88</span>
                    <span className="text-xs font-mono text-primary font-medium">+4.2</span>
                  </div>
                  <span className="text-[11px] text-muted block">30+ automated checks passed</span>
                </div>

                <div className="p-4 rounded-md bg-bg border border-border space-y-1">
                  <span className="text-xs text-muted font-medium">GEO & AEO Authority</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-text">92</span>
                    <span className="text-xs font-mono text-primary font-medium">Optimal</span>
                  </div>
                  <span className="text-[11px] text-muted block">Entity schemas & direct answers</span>
                </div>

                <div className="p-4 rounded-md bg-bg border border-border space-y-1">
                  <span className="text-xs text-muted font-medium">Action Center Pipeline</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-text">14</span>
                    <span className="text-xs font-mono text-accent font-medium">3 verified</span>
                  </div>
                  <span className="text-[11px] text-muted block">Automated re-crawl active</span>
                </div>
              </div>

              {/* Sample Task Step Timeline in Preview */}
              <div className="p-3.5 rounded-md bg-bg border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <span className="font-medium text-text">Latest Re-Audit:</span>
                  <span className="text-muted">Missing Organization Schema on Homepage</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-primary font-medium bg-primary-tint px-2 py-0.5 rounded-full border border-emerald-200">
                    completed_verified
                  </span>
                  <span className="text-muted">8.2s crawl</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SOCIAL PROOF / TRUSTED BY AGENCIES (Light Gray #F8FAFC) */}
      <section className="bg-bg py-12 border-b border-border transition-colors">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <p className="text-xs uppercase font-medium tracking-wider text-muted font-head">
            Engineered for Modern SEO & Digital Marketing Agencies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-70 grayscale hover:grayscale-0 transition-all text-xs font-semibold text-text">
            <span className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-primary" /> Growth Digital Partners</span>
            <span className="flex items-center gap-1.5"><Search className="w-4 h-4 text-accent" /> Apex Search Advisory</span>
            <span className="flex items-center gap-1.5"><Compass className="w-4 h-4 text-primary" /> Beacon SEO Labs</span>
            <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-accent" /> MetricFlow Agency</span>
          </div>
        </div>
      </section>

      {/* 3. 3 CORE FEATURES (White Background) */}
      <section className="bg-card py-16 sm:py-24 border-b border-border transition-colors">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-[32px] font-bold font-head text-text tracking-tight">
              3 Core Pillars of Intelligent Action
            </h2>
            <p className="text-base text-muted">
              Stop generating 50-page audit PDFs that get ignored. Run real workflows that connect diagnosis to verified client execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-card p-6 rounded-lg border border-border shadow-card space-y-3.5 hover:-translate-y-0.5 transition-transform duration-200">
              <div className="w-10 h-10 rounded-md bg-primary-tint border border-emerald-200 flex items-center justify-center text-primary">
                <FileSearch className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-head text-text">
                SEO, GEO & AEO Auditor
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Safe Cheerio crawler with anti-SSRF protection. Audits 30+ technical standards, Schema.org entities, and direct answer readiness for Perplexity and ChatGPT search.
              </p>
              <Link href="/seo-website-audit" className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
                Explore Auditor <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="bg-card p-6 rounded-lg border border-border shadow-card space-y-3.5 hover:-translate-y-0.5 transition-transform duration-200">
              <div className="w-10 h-10 rounded-md bg-accent-tint border border-blue-200 flex items-center justify-center text-accent">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-head text-text">
                GSC Intelligence & Drops
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Read-only OAuth integration. Uncover striking distance keywords (positions 5–20), high impression / low CTR targets, and investigate 28-day traffic drops with root hypotheses.
              </p>
              <Link href="/gsc-intelligence" className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
                View Search Console Tools <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="bg-card p-6 rounded-lg border border-border shadow-card space-y-3.5 hover:-translate-y-0.5 transition-transform duration-200">
              <div className="w-10 h-10 rounded-md bg-primary-tint border border-emerald-200 flex items-center justify-center text-primary">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-head text-text">
                Action Center & Verification
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Convert discovered issues into prioritized tasks. When completed, automated re-crawls programmatically confirm if fixes actually resolved the underlying problem.
              </p>
              <Link href="/action-management" className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
                See Verification Engine <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW THE AGENT WORKS (3 STEPS) (Light Gray #F8FAFC) */}
      <section className="bg-bg py-16 sm:py-24 border-b border-border transition-colors">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-muted uppercase tracking-wider">
              <span>Operational Pipeline</span>
            </div>
            <h2 className="text-2xl sm:text-[32px] font-bold font-head text-text tracking-tight">
              How the RankPilot Agent Works
            </h2>
            <p className="text-base text-muted">
              Three transparent steps connecting discovery directly to verified client progress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg bg-card border border-border shadow-card space-y-3">
              <span className="font-mono text-sm font-bold text-primary bg-primary-tint px-2.5 py-1 rounded-sm inline-block">
                01
              </span>
              <h3 className="text-base font-bold font-head text-text">Connect & Ingest</h3>
              <p className="text-sm text-muted leading-relaxed">
                Link client domain and Google Search Console via read-only OAuth. Run polite in-house crawls with strict anti-SSRF protections and zero data modification.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card border border-border shadow-card space-y-3">
              <span className="font-mono text-sm font-bold text-accent bg-accent-tint px-2.5 py-1 rounded-sm inline-block">
                02
              </span>
              <h3 className="text-base font-bold font-head text-text">Prioritize Real Actions</h3>
              <p className="text-sm text-muted leading-relaxed">
                Deterministic scoring weights findings by revenue potential and technical severity. High-priority issues automatically become trackable team tasks.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card border border-border shadow-card space-y-3">
              <span className="font-mono text-sm font-bold text-primary bg-primary-tint px-2.5 py-1 rounded-sm inline-block">
                03
              </span>
              <h3 className="text-base font-bold font-head text-text">Verify Live Fixes</h3>
              <p className="text-sm text-muted leading-relaxed">
                When agency devs complete a task, our crawler re-checks the target URL. Verified outcomes flow directly into printable executive client reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. AGENCY REPORT PREVIEW (White Background) */}
      <section className="bg-card py-16 sm:py-24 border-b border-border transition-colors">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
                Client-Ready Deliverables
              </span>
              <h2 className="text-2xl sm:text-[32px] font-bold font-head text-text tracking-tight">
                White-Label Reports That Prove Agency Value
              </h2>
              <p className="text-base text-muted leading-relaxed">
                Show clients exactly what was discovered, what was executed, and what was independently verified by the re-audit engine. No bloated PDFs or hand-waving claims.
              </p>
              <ul className="space-y-2.5 text-sm text-muted pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Executive summary with transparent mathematical scoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Verified improvements list with before/after evidence</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>28-day Google Search Console performance benchmarks</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/dashboard/reports"
                  className="inline-flex items-center gap-2 text-sm font-medium text-text bg-card hover:bg-slate-50 border border-border h-10 px-4 rounded-md shadow-xs transition-colors"
                >
                  <span>Preview Sample Report</span>
                  <ExternalLink className="w-3.5 h-3.5 text-muted" />
                </Link>
              </div>
            </div>

            {/* Report Card Mockup */}
            <div className="p-6 rounded-lg bg-bg border border-border shadow-card space-y-4 font-sans text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <span className="font-bold text-text text-sm font-head">Executive SEO Performance Report</span>
                  <p className="text-muted text-[11px]">Prepared for saasflow.io • Agency Edition</p>
                </div>
                <span className="font-mono text-primary font-bold bg-primary-tint px-2 py-0.5 rounded-full border border-emerald-200">
                  Verified
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-card rounded-md border border-border">
                  <span className="text-muted block text-[10px]">Overall SEO Health</span>
                  <span className="text-lg font-bold font-mono text-text">88/100</span>
                </div>
                <div className="p-3 bg-card rounded-md border border-border">
                  <span className="text-muted block text-[10px]">Tasks Verified</span>
                  <span className="text-lg font-bold font-mono text-primary">6 Complete</span>
                </div>
                <div className="p-3 bg-card rounded-md border border-border">
                  <span className="text-muted block text-[10px]">AEO Readiness</span>
                  <span className="text-lg font-bold font-mono text-text">92/100</span>
                </div>
              </div>

              <div className="p-3 bg-card rounded-md border border-border space-y-2">
                <span className="font-semibold text-text block">Completed & Verified Actions:</span>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-text">
                    <span>✓ Missing Organization schema added</span>
                    <span className="text-primary font-medium">Verified</span>
                  </div>
                  <div className="flex items-center justify-between text-text">
                    <span>✓ Duplicate H1 tags resolved on /pricing</span>
                    <span className="text-primary font-medium">Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRICING (FREELANCER, AGENCY, TEAM) (Light Gray #F8FAFC) */}
      <section className="bg-bg py-16 sm:py-24 border-b border-border transition-colors">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-[32px] font-bold font-head text-text tracking-tight">
              Predictable, Transparent Pricing
            </h2>
            <p className="text-base text-muted">
              Start free during pilot validation. Scale to agency tiers as your client roster expands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Freelancer */}
            <div className="bg-card p-6 rounded-lg border border-border shadow-card flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider font-head">Freelancer</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-text">$0</span>
                  <span className="text-xs text-muted">/ pilot</span>
                </div>
                <p className="text-xs text-muted">Ideal for independent consultants validating initial client sites.</p>
                <ul className="space-y-2 text-xs text-muted pt-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> 2 Client Websites</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> 25 Pages per Audit</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Action Center Pipeline</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Automated Re-Crawl Verification</li>
                </ul>
              </div>
              <Link
                href="/dashboard"
                className="w-full text-center text-xs font-medium h-10 flex items-center justify-center rounded-md border border-border text-text hover:bg-slate-50 transition-colors"
              >
                Start Free
              </Link>
            </div>

            {/* Agency (Featured - Single Primary CTA) */}
            <div className="bg-card p-6 rounded-lg border-2 border-primary shadow-card flex flex-col justify-between space-y-6 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full">
                Most Popular
              </span>
              <div className="space-y-4">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider font-head">Agency</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-text">$79</span>
                  <span className="text-xs text-muted">/ month</span>
                </div>
                <p className="text-xs text-muted">Designed for digital marketing agencies managing multiple clients.</p>
                <ul className="space-y-2 text-xs text-muted pt-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> 15 Client Websites</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Unlimited Re-Crawl Verifications</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Google Search Console Sync</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> White-Label PDF Reports</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Multi-Tenant Role Isolation</li>
                </ul>
              </div>
              <Link
                href="/dashboard"
                className="w-full text-center text-xs font-medium h-10 flex items-center justify-center rounded-md bg-primary hover:bg-primary-hover text-white shadow-xs transition-colors"
              >
                Launch Agency Plan
              </Link>
            </div>

            {/* Team */}
            <div className="bg-card p-6 rounded-lg border border-border shadow-card flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider font-head">Team & Enterprise</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-text">$149</span>
                  <span className="text-xs text-muted">/ month</span>
                </div>
                <p className="text-xs text-muted">For expanding agencies needing higher crawl limits and multiple seats.</p>
                <ul className="space-y-2 text-xs text-muted pt-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> 50 Client Websites</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Dedicated Account Manager</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Custom Client Subdomains</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Priority Gemini Analysis</li>
                </ul>
              </div>
              <Link
                href="/dashboard"
                className="w-full text-center text-xs font-medium h-10 flex items-center justify-center rounded-md border border-border text-text hover:bg-slate-50 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ (White Background) */}
      <section className="bg-card py-16 sm:py-24 border-b border-border transition-colors">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-[32px] font-bold font-head text-text tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-base text-muted">
              Clear answers regarding security, data safety, and our verification methodology.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "How does the automated re-crawl verification work?",
                a: "When a team member marks an action item as completed, RankPilot AI re-crawls that exact URL. It re-evaluates the technical rule (e.g. title length, schema validity, meta description) and assigns an independent status: completed_verified or still_unresolved."
              },
              {
                q: "Does RankPilot AI modify or write to client websites?",
                a: "No. RankPilot AI operates strictly on read-only principles. We never inject tracking code, alter sitemaps, or modify live server code without your agency's direct manual execution."
              },
              {
                q: "What security protections prevent crawler abuse?",
                a: "Our in-house crawler incorporates an anti-SSRF guard that blocks loopback IPs (127.0.0.1), RFC-1918 private subnets, cloud metadata endpoints (169.254.169.254), and non-standard network ports. We also cap page sizes to 2MB and enforce an 8-second timeout."
              },
              {
                q: "How are AI recommendations validated?",
                a: "All AI insights are passed through a prompt-injection firewall and strictly validated against Zod schemas. If the AI output fails schema validation, the system falls back safely to deterministic analytical rules."
              }
            ].map((faq, idx) => (
              <div key={idx} className="border border-border rounded-md bg-card overflow-hidden">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between text-sm font-semibold text-text hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-200 ${openFaq === idx ? 'rotate-180 text-primary' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 pt-1 text-xs text-muted leading-relaxed border-t border-border/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA SECTION (Light Gray #F8FAFC) */}
      <section className="bg-bg py-16 sm:py-24 transition-colors">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-[32px] font-bold font-head text-text tracking-tight">
              Ready to Upgrade Your Agency Operations?
            </h2>
            <p className="text-base text-muted">
              Connect your first website in 60 seconds. Experience real, evidence-backed SEO intelligence.
            </p>
          </div>

          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 h-10 rounded-md bg-primary hover:bg-primary-hover text-white font-medium text-sm shadow-xs transition-colors"
            >
              <span>Launch Agency Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
