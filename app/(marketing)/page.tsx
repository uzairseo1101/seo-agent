'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Bot,
  Search,
  BarChart3,
  ChevronDown,
  Check,
  RefreshCw,
  ExternalLink,
  Layers,
  Zap,
  Globe,
  SlidersHorizontal,
  FileCheck2
} from 'lucide-react';
import ProductShowcase from '@/components/product-showcase';
import { SoftwareAppJsonLd, FaqJsonLd } from '@/components/seo/json-ld';
import { PRICING_CONFIG } from '@/lib/pricing-config';

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeAudienceTab, setActiveAudienceTab] = useState<'freelancers' | 'agencies' | 'inhouse'>('agencies');
  const [isAnnualPricing, setIsAnnualPricing] = useState(false);

  const faqs = [
    {
      q: 'What is RankPilot AI?',
      a: 'RankPilot AI is an AI-powered SEO intelligence and action management platform built for SEO professionals. It crawls websites, monitors Google Search Console data, algorithmically prioritizes technical fixes, and verifies completed work through automated re-crawls.',
    },
    {
      q: 'Who is RankPilot AI designed for?',
      a: 'RankPilot AI is built specifically for SEO agencies, independent consultants, freelancers, and in-house growth teams who manage multiple client domains or high-volume organic search properties.',
    },
    {
      q: 'How does RankPilot AI analyze websites?',
      a: 'Our internal SSRF-safe crawler inspects HTML structure, response codes, canonical tags, heading hierarchies, Core Web Vitals, Schema.org entity graphs, and Answer Engine Optimization (AEO) readiness.',
    },
    {
      q: 'How does Google Search Console connect?',
      a: 'You connect via official Google OAuth 2.0 with read-only permissions. We never modify your live site, DNS, robots.txt, or sitemaps. Your credentials are securely isolated and encrypted.',
    },
    {
      q: 'How does automated fix verification work?',
      a: 'When you or your developer marks an SEO task complete, RankPilot automatically re-crawls the exact target URL and checks the live HTML DOM to confirm the issue is truly resolved before updating the status to Completed (Verified).',
    },
    {
      q: 'Can I generate white-label client reports?',
      a: 'Yes. You can export client-ready executive PDF reports featuring verified fixes, organic keyword improvements, and Search Console growth charts.',
    },
    {
      q: 'Does RankPilot AI automatically edit my website code?',
      a: 'No. RankPilot operates in read-only mode for safety. It provides ready-to-deploy Schema.org JSON-LD snippets and precise code recommendations, but you retain 100% control over production code changes.',
    },
    {
      q: 'What makes RankPilot different from traditional SEO tools?',
      a: 'Traditional tools dump thousands of spreadsheet rows and leave you to figure out what matters. RankPilot closes the loop: it audits, pairs issues with Search Console impact, creates prioritized action tasks, and verifies fixes with automated re-crawls.',
    },
  ];

  return (
    <div className="space-y-24 sm:space-y-32 pb-24">
      <SoftwareAppJsonLd />
      <FaqJsonLd faqs={faqs} />

      {/* =========================================================================
          SECTION 1 — HERO SECTION
          ========================================================================= */}
      <section className="pt-12 sm:pt-20 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-tint border border-emerald-200/80 text-primary text-xs font-medium shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>AI SEO Intelligence & Action Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-head text-text tracking-tight leading-[1.12]">
            Your SEO Intelligence.{' '}
            <span className="text-primary block sm:inline">From Audit to Verified Action.</span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Audit websites with 30+ deterministic checks, unlock Search Console striking-distance opportunities, and verify developer fixes with automated re-crawls.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="w-full sm:w-auto h-11 px-6 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 group"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#product-showcase"
              className="w-full sm:w-auto h-11 px-6 bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-text border border-border text-sm font-medium rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              Explore Live Platform
            </a>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Official Google OAuth 2.0 (Read-Only)
            </span>
            <span className="text-border hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Automated Re-Crawl Verification
            </span>
            <span className="text-border hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-primary" />
              No Credit Card Required
            </span>
          </div>
        </div>

        {/* Hero Product Frame Preview */}
        <div className="mt-14 bg-card rounded-2xl border border-border shadow-pop p-4 sm:p-7 max-w-5xl mx-auto transition-all">
          {/* Window Chrome Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400"></span>
              <span className="w-3 h-3 rounded-full bg-amber-400"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
            </div>
            <div className="flex items-center gap-2 bg-bg border border-border px-4 py-1.5 rounded-md text-xs font-mono text-muted">
              <span className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse"></span>
              <span>app.rankpilot.ai/dashboard</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary-tint px-3 py-1 rounded-full border border-emerald-200">
              <Check className="w-3.5 h-3.5" />
              <span>Real-Time Engine</span>
            </div>
          </div>

          {/* Metric KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
            <div className="p-4 rounded-xl bg-bg border border-border space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Technical SEO</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-head text-text">88 <span className="text-xs font-normal text-muted">/ 100</span></p>
              <p className="text-[11px] text-primary font-medium">+14 pts after fixes</p>
            </div>

            <div className="p-4 rounded-xl bg-bg border border-border space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>GEO Entity Graph</span>
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-head text-accent">91 <span className="text-xs font-normal text-muted">/ 100</span></p>
              <p className="text-[11px] text-accent font-medium">Brand disambiguated</p>
            </div>

            <div className="p-4 rounded-xl bg-bg border border-border space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>AEO Readiness</span>
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-head text-text">85 <span className="text-xs font-normal text-muted">/ 100</span></p>
              <p className="text-[11px] text-muted">Direct answer coverage</p>
            </div>

            <div className="p-4 rounded-xl bg-bg border border-border space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Fix Verification</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-head text-text">100%</p>
              <p className="text-[11px] text-primary font-medium">14 tasks verified in HTML</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2 — THE 3-PILLAR CLOSED-LOOP WORKFLOW
          ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider">
            A Complete Operational Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-head text-text tracking-tight">
            Stop Sorting Spreadsheets. Start Moving SEO Forward.
          </h2>
          <p className="text-sm sm:text-base text-muted leading-relaxed">
            RankPilot AI unites website diagnostics, Search Console performance, and task verification into one continuous workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="bg-card rounded-2xl border border-border p-7 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-primary flex items-center justify-center font-bold text-sm border border-emerald-200 dark:border-emerald-900/60">
              01
            </div>
            <div>
              <h3 className="text-lg font-bold font-head text-text">Diagnose & Discover</h3>
              <p className="text-xs text-primary font-medium mt-0.5">Automated Multi-Dimensional Auditing</p>
            </div>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Crawl pages with 30+ technical checks for canonicals, status codes, and speed. Scan Schema.org entity graphs for GEO and AEO direct answer readiness. Connect Search Console to surface striking-distance keywords.
            </p>
            <div className="pt-2 border-t border-border space-y-2 text-xs text-muted">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>SSRF-guarded crawler</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Positions 5–20 opportunity finder</span>
              </div>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-card rounded-2xl border border-border p-7 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-accent flex items-center justify-center font-bold text-sm border border-blue-200 dark:border-blue-900/60">
              02
            </div>
            <div>
              <h3 className="text-lg font-bold font-head text-text">Prioritize & Plan</h3>
              <p className="text-xs text-accent font-medium mt-0.5">Impact-Driven Task Management</p>
            </div>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Never get lost in a 50-page laundry list again. RankPilot algorithmically ranks every task by combining technical severity with real impression volume from Google Search Console.
            </p>
            <div className="pt-2 border-t border-border space-y-2 text-xs text-muted">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>Deterministic severity formula</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>Sprint-ready developer instructions</span>
              </div>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-card rounded-2xl border border-border p-7 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm border border-purple-200 dark:border-purple-900/60">
              03
            </div>
            <div>
              <h3 className="text-lg font-bold font-head text-text">Verify & Deliver</h3>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-0.5">Automated Proof of Work</p>
            </div>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              When a developer marks a task done, RankPilot automatically re-crawls the live URL to verify that HTML changes actually fixed the issue. Generate white-label PDF executive reports with one click.
            </p>
            <div className="pt-2 border-t border-border space-y-2 text-xs text-muted">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Live DOM verification engine</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>White-label executive client reports</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3 — AUTHENTIC INTERACTIVE PRODUCT SHOWCASE
          ========================================================================= */}
      <section id="product-showcase" className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider">
            Interactive Product Tour
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-head text-text tracking-tight">
            See the Platform in Action.
          </h2>
          <p className="text-sm sm:text-base text-muted">
            Explore the authentic interface used by SEO teams to run audits, prioritize fixes, and verify code implementations.
          </p>
        </div>

        {/* Live Interactive Tabs Component */}
        <ProductShowcase />
      </section>

      {/* =========================================================================
          SECTION 4 — TAILORED WORKFLOWS (AUDIENCE SELECTOR)
          ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="text-xs font-mono font-semibold text-accent uppercase tracking-wider">
            Built for Your Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-head text-text tracking-tight">
            Designed for High-Performing Teams.
          </h2>
        </div>

        {/* Audience Selector Tabs */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setActiveAudienceTab('agencies')}
            className={`px-5 py-2.5 text-xs sm:text-sm font-medium rounded-lg border transition-all ${
              activeAudienceTab === 'agencies'
                ? 'bg-card border-primary text-primary font-semibold shadow-xs'
                : 'bg-bg text-muted border-border hover:text-text'
            }`}
          >
            For SEO Agencies
          </button>
          <button
            onClick={() => setActiveAudienceTab('freelancers')}
            className={`px-5 py-2.5 text-xs sm:text-sm font-medium rounded-lg border transition-all ${
              activeAudienceTab === 'freelancers'
                ? 'bg-card border-primary text-primary font-semibold shadow-xs'
                : 'bg-bg text-muted border-border hover:text-text'
            }`}
          >
            For Solo Consultants
          </button>
          <button
            onClick={() => setActiveAudienceTab('inhouse')}
            className={`px-5 py-2.5 text-xs sm:text-sm font-medium rounded-lg border transition-all ${
              activeAudienceTab === 'inhouse'
                ? 'bg-card border-primary text-primary font-semibold shadow-xs'
                : 'bg-bg text-muted border-border hover:text-text'
            }`}
          >
            For In-House Teams
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="bg-card rounded-2xl border border-border p-7 sm:p-10 shadow-xs max-w-4xl mx-auto">
          {activeAudienceTab === 'agencies' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <span className="text-xs font-mono font-semibold text-primary uppercase">Multi-Client Agency Operations</span>
              <h3 className="text-xl sm:text-2xl font-bold font-head text-text">
                Scale Your Client Retainers with Measurable Proof of Work.
              </h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                Manage all your client websites under one organization. Assign sprint-ready technical tasks to developers, verify implementations with automated re-crawls, and eliminate manual reporting hours with white-label executive client PDFs.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs text-muted">
                <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-primary shrink-0" /> Multi-domain organization monitoring</div>
                <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-primary shrink-0" /> White-label PDF branding for client presentations</div>
                <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-primary shrink-0" /> Automated re-crawl verification after developer fixes</div>
                <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-primary shrink-0" /> Read-only Google Search Console data isolation</div>
              </div>
            </div>
          )}

          {activeAudienceTab === 'freelancers' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <span className="text-xs font-mono font-semibold text-primary uppercase">Solo Consultants & Freelancers</span>
              <h3 className="text-xl sm:text-2xl font-bold font-head text-text">
                Deliver Enterprise-Grade Audits Without Spreadsheet Chaos.
              </h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                Handle auditing, priority planning, and client deliverables with the efficiency of a multi-person team. RankPilot automates data collation and generates structured recommendations with drop-in Schema.org code.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs text-muted">
                <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-primary shrink-0" /> Instant 30+ check technical audits</div>
                <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-primary shrink-0" /> High-impression striking distance keyword targets</div>
                <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-primary shrink-0" /> Ready-to-copy Schema.org JSON-LD snippets</div>
                <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-primary shrink-0" /> 1-click executive client reports</div>
              </div>
            </div>
          )}

          {activeAudienceTab === 'inhouse' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <span className="text-xs font-mono font-semibold text-accent uppercase">In-House Growth & SEO Directors</span>
              <h3 className="text-xl sm:text-2xl font-bold font-head text-text">
                Turn SEO Insights into Prioritized Developer Tickets.
              </h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                Bridge the communication gap between SEO strategy and software engineering. Hand your dev team prioritized tickets with exact DOM targets, clear evidence, and automated verification upon deployment.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs text-muted">
                <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-primary shrink-0" /> Mathematical severity scoring for sprint planning</div>
                <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-primary shrink-0" /> Traffic drop root-cause diagnostics</div>
                <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-primary shrink-0" /> Generative Engine & Answer Engine Optimization</div>
                <div className="flex items-center gap-2.5"><Check className="w-4 h-4 text-primary shrink-0" /> Multi-tenant team role management</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 5 — TRANSPARENT PRICING
          ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider">
            Simple, Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-head text-text tracking-tight">
            Plans Built to Scale with Your Growth.
          </h2>
          <p className="text-sm sm:text-base text-muted">
            Predictable billing. No per-seat penalties, no surprise credit overages.
          </p>

          {/* Monthly / Annual Billing Switch */}
          <div className="pt-3 flex items-center justify-center gap-3 text-xs font-medium">
            <span className={!isAnnualPricing ? 'text-text font-bold' : 'text-muted'}>Monthly</span>
            <button
              type="button"
              role="switch"
              aria-checked={isAnnualPricing}
              onClick={() => setIsAnnualPricing(!isAnnualPricing)}
              className="w-12 h-6 rounded-full bg-slate-200 dark:bg-slate-700 p-0.5 transition-colors relative cursor-pointer"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white dark:bg-slate-900 shadow-xs transition-transform ${
                  isAnnualPricing ? 'translate-x-6 bg-primary' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={isAnnualPricing ? 'text-text font-bold flex items-center gap-1.5' : 'text-muted flex items-center gap-1.5'}>
              <span>Annual billing</span>
              <span className="text-[10px] font-mono font-bold text-primary bg-primary-tint border border-emerald-200 px-2 py-0.5 rounded-full">
                Save ~17% (2 months free)
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto items-stretch">
          {PRICING_CONFIG.tiers.map((tier) => {
            const price = isAnnualPricing ? tier.annualMonthlyEquivalent : tier.monthlyPrice;
            return (
              <div
                key={tier.id}
                className={`bg-card rounded-2xl p-6 shadow-xs flex flex-col justify-between relative transition-all ${
                  tier.popular
                    ? 'border-2 border-primary shadow-pop'
                    : 'border border-border'
                }`}
              >
                {tier.popular && tier.badge && (
                  <div className="absolute -top-3 right-6 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                    {tier.badge}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <span className={`text-xs font-bold uppercase tracking-wider font-head ${
                      tier.popular ? 'text-primary' : 'text-muted'
                    }`}>
                      {tier.name}
                    </span>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-bold font-head text-text tnum">
                        ${price === 0 ? '0' : price.toFixed(price % 1 === 0 ? 0 : 2)}
                      </span>
                      <span className="text-xs text-muted font-mono">/ month</span>
                    </div>
                    {tier.id !== 'free' && isAnnualPricing && (
                      <span className="text-[11px] font-mono text-primary block mt-1">
                        Billed annually (${tier.annualPrice}/yr) • Save ${tier.annualSavings}
                      </span>
                    )}
                    {tier.id === 'free' && (
                      <span className="text-[11px] font-mono text-muted block mt-1">
                        Free forever, no card needed
                      </span>
                    )}
                    <p className="mt-2 text-xs text-muted leading-relaxed min-h-[36px]">
                      {tier.tagline}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border">
                    <ul className="space-y-2 text-xs text-muted">
                      {tier.features.slice(0, 5).map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span className="text-text">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6">
                  <Link
                    href={`${tier.ctaHref}${isAnnualPricing ? '&billing=annual' : '&billing=monthly'}`}
                    className={`w-full h-10 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                      tier.primaryCta
                        ? 'bg-primary hover:bg-primary-hover text-white shadow-xs'
                        : 'border border-border bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-text shadow-xs'
                    }`}
                  >
                    {tier.ctaText}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 6 — FREQUENTLY ASKED QUESTIONS
          ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider">
            Direct Answers
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-head text-text tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-muted">
            Clear, transparent details about our methodology, integrations, and capabilities.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-card rounded-xl border border-border shadow-xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 text-sm font-semibold font-head text-text hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-muted leading-relaxed border-t border-border pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 7 — FINAL CONVERSION CTA BANNER
          ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-2xl border border-border p-8 sm:p-14 text-center space-y-6 shadow-pop">
          <div className="max-w-xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold font-head text-text tracking-tight">
              Ready to Upgrade Your SEO Operations?
            </h2>
            <p className="text-sm sm:text-base text-muted leading-relaxed">
              Connect your domain, run deep audits, and experience automated fix verification in minutes.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-7 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/features"
              className="w-full sm:w-auto inline-flex items-center justify-center h-11 px-6 bg-card hover:bg-slate-50 dark:hover:bg-slate-800 border border-border text-sm font-medium text-text rounded-lg shadow-xs"
            >
              Explore All Features
            </Link>
          </div>

          <p className="text-xs text-muted">
            Read-only safe Google OAuth 2.0 · No credit card required · Instant setup
          </p>
        </div>
      </section>
    </div>
  );
}
