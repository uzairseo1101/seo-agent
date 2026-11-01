'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Bot,
  Search,
  FileText,
  TrendingUp,
  BarChart3,
  Layers,
  ChevronDown,
  Check,
  ExternalLink,
  Users,
  Briefcase,
  Building
} from 'lucide-react';
import ProductTour from '@/components/product-tour';
import { SoftwareAppJsonLd, FaqJsonLd } from '@/components/seo/json-ld';

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'What is an AI SEO agent?',
      a: 'An AI SEO agent is autonomous software that handles end-to-end search engine optimization tasks. Unlike static dashboards, an agent actively crawls your pages, identifies technical defects, monitors Google Search Console performance, uncovers keyword gaps, and drafts prioritized fixes for your team to approve.',
    },
    {
      q: 'How is RankPilot AI different from tools like Semrush or Ahrefs?',
      a: 'Traditional SEO platforms provide massive data dumps and leave the manual analysis to you. RankPilot AI connects data directly to execution. It translates complex crawler outputs into plain-English action items, verifies fixes through automated re-crawls, and generates client-ready executive reports in one click.',
    },
    {
      q: 'Can the agent really fix SEO issues, or only find them?',
      a: 'The agent finds issues, diagnoses root causes, and drafts ready-to-use solutions such as Schema.org JSON-LD code, meta descriptions, and heading structures. You remain in complete control: you approve recommended changes before they are applied, and the agent re-checks pages to verify resolution.',
    },
    {
      q: 'Is it good for freelancers and agencies?',
      a: 'Yes. Freelancers use RankPilot AI to deliver the technical output of a multi-person SEO team alone. Digital marketing agencies use our multi-domain dashboards, automated verification pipelines, and white-label client reports to scale their client rosters without hiring additional technical headcount.',
    },
    {
      q: 'Does it help with AI search (AEO and GEO)?',
      a: 'Yes. Beyond standard Google rankings, RankPilot AI evaluates pages for Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO). It checks entity clarity, direct answer structure, and structured data schemas so your content gets cited by ChatGPT, Perplexity, Claude, and Google AI Overviews.',
    },
    {
      q: 'Which data sources does it use?',
      a: '[confirm] RankPilot AI integrates directly with Google Search Console via official OAuth 2.0 APIs, uses an internal SSRF-guarded crawler for page-level analysis, and connects with leading LLM reasoning engines. It accesses your search performance data in strictly read-only mode.',
    },
    {
      q: 'Is my client data safe?',
      a: 'Yes. We enforce read-only API access to your search performance accounts. We never sell, share, or train public AI models on your private client URLs or proprietary ranking queries. All data storage is protected by organization-level multi-tenant isolation.',
    },
    {
      q: 'Can I try it for free?',
      a: 'Yes. You can start exploring RankPilot AI with our complimentary starter plan. You can run site audits, connect Google Search Console, and test agent action workflows with no credit card required.',
    },
  ];

  return (
    <div className="space-y-20 sm:space-y-28 pb-20">
      <SoftwareAppJsonLd />
      <FaqJsonLd faqs={faqs} />
      {/* 1. HERO SECTION */}
      <section className="pt-12 sm:pt-20 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-tint border border-emerald-200/80 text-primary text-xs font-mono font-medium">
            <Bot className="w-3.5 h-3.5" />
            <span>AI SEO agent for freelancers, agencies and SEO teams</span>
          </div>

          {/* H1 */}
          <h1 className="text-3xl sm:text-5xl lg:text-[48px] font-bold font-head text-text tracking-tight leading-[1.15]">
            Your AI SEO agent that audits, researches and{' '}
            <span className="text-primary font-bold">fixes</span> SEO for you
          </h1>

          {/* Subheading (max 25 words) */}
          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Tell the agent what you need in plain English. It audits your site, finds keywords, writes content briefs and builds client reports in minutes.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="w-full sm:w-auto h-10 px-6 bg-primary hover:bg-primary-hover text-white text-xs font-medium rounded-md shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              Start free
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <a
              href="#product-tour"
              className="w-full sm:w-auto h-10 px-5 bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-text border border-border text-xs font-medium rounded-md shadow-xs transition-colors flex items-center justify-center"
            >
              Watch how it works
            </a>
          </div>

          <p className="text-xs text-muted">
            No credit card required · Free plan available [confirm]
          </p>

          {/* AEO Definition Line */}
          <div className="p-3 rounded-md bg-card border border-border text-xs text-muted max-w-xl mx-auto shadow-xs text-center">
            <span className="font-semibold text-text">RankPilot AI</span> is an AI SEO agent that audits websites, discovers striking-distance keyword opportunities, and verifies technical fixes automatically.
          </div>
        </div>

        {/* Dashboard Preview Card with Soft Shadow */}
        <div className="mt-12 bg-card rounded-lg border border-border shadow-pop p-4 sm:p-6 max-w-5xl mx-auto">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400"></span>
              <span className="w-3 h-3 rounded-full bg-amber-400"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
            </div>
            <span className="font-mono text-xs text-muted">app.rankpilot.ai/dashboard</span>
            <div className="flex items-center gap-2 text-xs font-mono text-primary bg-primary-tint px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Agent Online
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-md bg-bg border border-border space-y-1">
              <span className="text-xs text-muted">SEO Health Score</span>
              <p className="text-2xl font-bold font-mono text-text tnum">84 / 100</p>
              <span className="text-[11px] text-primary font-medium">+14 pts this month</span>
            </div>
            <div className="p-4 rounded-md bg-bg border border-border space-y-1">
              <span className="text-xs text-muted">AEO / GEO Engine Score</span>
              <p className="text-2xl font-bold font-mono text-accent tnum">91 / 100</p>
              <span className="text-[11px] text-accent font-medium">Ready for AI citations</span>
            </div>
            <div className="p-4 rounded-md bg-bg border border-border space-y-1">
              <span className="text-xs text-muted">Verified Fixes</span>
              <p className="text-2xl font-bold font-mono text-text tnum">18 Completed</p>
              <span className="text-[11px] text-muted font-medium">100% re-crawl verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST STRIP */}
      <section className="border-y border-border bg-card/60 py-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <p className="text-xs font-mono uppercase tracking-wider text-muted">
            Trusted by independent consultants and digital marketing agencies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-60 text-xs font-mono text-muted">
            <span className="px-3 py-1.5 rounded-md border border-border bg-bg">[ADD CUSTOMER LOGO 1]</span>
            <span className="px-3 py-1.5 rounded-md border border-border bg-bg">[ADD CUSTOMER LOGO 2]</span>
            <span className="px-3 py-1.5 rounded-md border border-border bg-bg">[ADD CUSTOMER LOGO 3]</span>
            <span className="px-3 py-1.5 rounded-md border border-border bg-bg">[ADD CUSTOMER LOGO 4]</span>
          </div>
        </div>
      </section>

      {/* 3. PRODUCT TOUR (Interactive Horizontal Component) */}
      <section id="product-tour" className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20 space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
            Interactive Product Tour
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-head text-text">
            See the AI SEO agent in action
          </h2>
          <p className="text-sm text-muted">
            Watch how RankPilot AI handles an audit from your first prompt to verified growth.
          </p>
        </div>

        <ProductTour />
      </section>

      {/* 4. PROBLEM TO SOLUTION (3 Cards) */}
      <section className="bg-bg py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
              Before vs. After
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-head text-text">
              Turn tedious SEO work into automated progress
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-3">
              <span className="text-xs font-mono text-error font-medium block">Problem</span>
              <h3 className="text-base font-bold font-head text-text">Hours of manual audits</h3>
              <p className="text-xs text-muted leading-relaxed">
                Manually clicking through spreadsheets and endless crawler tabs to find broken links and missing tags.
              </p>
              <div className="pt-2 border-t border-border">
                <span className="text-xs font-mono text-primary font-medium block">Solution</span>
                <p className="text-xs font-semibold text-text mt-0.5">
                  The agent audits a full site in minutes.
                </p>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-3">
              <span className="text-xs font-mono text-error font-medium block">Problem</span>
              <h3 className="text-base font-bold font-head text-text">Scattered tools and spreadsheets</h3>
              <p className="text-xs text-muted leading-relaxed">
                Juggling rank trackers, crawler software, content docs, and task managers with no single source of truth.
              </p>
              <div className="pt-2 border-t border-border">
                <span className="text-xs font-mono text-primary font-medium block">Solution</span>
                <p className="text-xs font-semibold text-text mt-0.5">
                  One place for keywords, audits, content and reports.
                </p>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-3">
              <span className="text-xs font-mono text-error font-medium block">Problem</span>
              <h3 className="text-base font-bold font-head text-text">Slow client reporting</h3>
              <p className="text-xs text-muted leading-relaxed">
                Spending hours every month compiling screenshots and explaining technical metrics to clients.
              </p>
              <div className="pt-2 border-t border-border">
                <span className="text-xs font-mono text-primary font-medium block">Solution</span>
                <p className="text-xs font-semibold text-text mt-0.5">
                  Branded, client-ready reports in one click.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (4 Short Steps) */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
            Simple 4-Step Flow
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-head text-text">
            How the agent works
          </h2>
          <p className="text-sm text-muted">
            From your first prompt to verified client improvements.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-3">
            <span className="font-mono text-2xl font-bold text-primary block">01</span>
            <h3 className="text-sm font-bold font-head text-text">Connect your site</h3>
            <p className="text-xs text-muted leading-relaxed">
              Add your domain and connect Google Search Console with read-only OAuth.
            </p>
          </div>

          <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-3">
            <span className="font-mono text-2xl font-bold text-primary block">02</span>
            <h3 className="text-sm font-bold font-head text-text">Ask the agent</h3>
            <p className="text-xs text-muted leading-relaxed">
              Type your SEO objective in plain English or pick a suggested workflow.
            </p>
          </div>

          <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-3">
            <span className="font-mono text-2xl font-bold text-primary block">03</span>
            <h3 className="text-sm font-bold font-head text-text">Watch it work</h3>
            <p className="text-xs text-muted leading-relaxed">
              Follow real-time crawler logs as the agent identifies issues and opportunities.
            </p>
          </div>

          <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-3">
            <span className="font-mono text-2xl font-bold text-primary block">04</span>
            <h3 className="text-sm font-bold font-head text-text">Review, fix and share</h3>
            <p className="text-xs text-muted leading-relaxed">
              Approve fixes, verify resolution with automated re-crawls, and export reports.
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
          >
            See the full walkthrough
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 6. FEATURES PREVIEW (6 Cards) */}
      <section className="bg-bg py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-head text-text">
              Everything you need for modern SEO
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-2.5">
              <div className="w-8 h-8 rounded-md bg-primary-tint text-primary flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold font-head text-text">AI site audits</h3>
              <p className="text-xs text-muted leading-relaxed">
                Scan pages for 30+ technical issues with zero false positives.
              </p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-2.5">
              <div className="w-8 h-8 rounded-md bg-accent-tint text-accent flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold font-head text-text">Keyword research</h3>
              <p className="text-xs text-muted leading-relaxed">
                Identify striking-distance search queries positioned for rapid ranking gains.
              </p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-2.5">
              <div className="w-8 h-8 rounded-md bg-primary-tint text-primary flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold font-head text-text">Content briefs and writing help</h3>
              <p className="text-xs text-muted leading-relaxed">
                Generate search-intent outlines and entity-rich topic briefs in seconds.
              </p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-2.5">
              <div className="w-8 h-8 rounded-md bg-accent-tint text-accent flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold font-head text-text">Competitor analysis</h3>
              <p className="text-xs text-muted leading-relaxed">
                Spot ranking gaps and content deficits across competing market domains.
              </p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-2.5">
              <div className="w-8 h-8 rounded-md bg-primary-tint text-primary flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold font-head text-text">Rank tracking</h3>
              <p className="text-xs text-muted leading-relaxed">
                Monitor organic impressions and click trajectories with real GSC data.
              </p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-2.5">
              <div className="w-8 h-8 rounded-md bg-accent-tint text-accent flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold font-head text-text">Client reports</h3>
              <p className="text-xs text-muted leading-relaxed">
                Export branded, white-label PDF executive reports with verified fixes.
              </p>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/features"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
            >
              Explore all features
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. WHO IT'S FOR (3 Cards) */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
            Tailored Workflows
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-head text-text">
            Built for modern SEO practitioners
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-3">
            <div className="w-8 h-8 rounded-md bg-primary-tint text-primary flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono text-muted uppercase">Freelancers</span>
            <h3 className="text-base font-bold font-head text-text">Do the work of a small team, alone</h3>
            <p className="text-xs text-muted leading-relaxed">
              Automate deep technical audits and client reporting so you can take on more client accounts with less stress.
            </p>
          </div>

          <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-3">
            <div className="w-8 h-8 rounded-md bg-accent-tint text-accent flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono text-accent uppercase">Agencies</span>
            <h3 className="text-base font-bold font-head text-text">Serve more clients without hiring more people</h3>
            <p className="text-xs text-muted leading-relaxed">
              Standardize client deliverables with automated verification pipelines and branded client report exports.
            </p>
          </div>

          <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-3">
            <div className="w-8 h-8 rounded-md bg-primary-tint text-primary flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono text-muted uppercase">In-house SEO teams</span>
            <h3 className="text-base font-bold font-head text-text">Spend less time on reports, more on strategy</h3>
            <p className="text-xs text-muted leading-relaxed">
              Eliminate hours of manual data collation and keep your engineering teams focused on verified high-impact fixes.
            </p>
          </div>
        </div>
      </section>

      {/* 8. WHY AEO/GEO MATTERS */}
      <section className="bg-card border-y border-border py-14">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-xs font-mono font-medium text-accent uppercase tracking-wider">
              Answer Engine & Generative Optimization
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-head text-text">
              Rank in Google and get cited by AI
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Search is shifting to conversational answer engines. RankPilot AI evaluates your pages for answer-first content, structured schema markup, and entity clarity so ChatGPT, Perplexity, Claude, and Google AI Overviews cite your brand.
            </p>
          </div>
        </div>
      </section>

      {/* 9. SOCIAL PROOF (Marked Placeholders) */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
            Verified Experiences
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-head text-text">
            What practitioners say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-3">
            <p className="text-xs text-muted italic">
              "[ADD REAL TESTIMONIAL: Quote from an agency founder highlighting how the automated verification saved them 15 hours per client every month]."
            </p>
            <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
              <span className="font-semibold text-text">[ADD REAL NAME]</span>
              <span className="text-muted font-mono">[ADD AGENCY NAME]</span>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-3">
            <p className="text-xs text-muted italic">
              "[ADD REAL TESTIMONIAL: Quote from an SEO freelancer explaining how plain-English agent tasks allowed them to double their client roster]."
            </p>
            <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
              <span className="font-semibold text-text">[ADD REAL NAME]</span>
              <span className="text-muted font-mono">[ADD ROLE]</span>
            </div>
          </div>
        </div>
      </section>

      {/* 10. PRICING TEASER (3 Mini Cards) */}
      <section className="bg-bg py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
              Simple Pricing
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-head text-text">
              Predictable plans for growing teams
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-3">
              <span className="text-xs font-bold font-head text-muted uppercase">Freelancer</span>
              <p className="text-2xl font-bold font-mono text-text">$49 <span className="text-xs text-muted font-normal">/ mo</span></p>
              <p className="text-xs text-muted">For solo SEO consultants managing individual websites.</p>
            </div>

            <div className="bg-card rounded-lg border-2 border-primary p-5 shadow-card space-y-3 relative">
              <span className="absolute -top-2.5 right-4 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                Most popular
              </span>
              <span className="text-xs font-bold font-head text-primary uppercase">Agency</span>
              <p className="text-2xl font-bold font-mono text-text">$149 <span className="text-xs text-muted font-normal">/ mo</span></p>
              <p className="text-xs text-muted">For marketing agencies managing multiple client campaigns.</p>
            </div>

            <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-3">
              <span className="text-xs font-bold font-head text-muted uppercase">Team</span>
              <p className="text-2xl font-bold font-mono text-text">$299 <span className="text-xs text-muted font-normal">/ mo</span></p>
              <p className="text-xs text-muted">For high-volume teams requiring custom crawl limits.</p>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
            >
              See full pricing and feature comparison
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 11. FAQ ACCORDION (8 Questions matching FAQPage schema) */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
            Common Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-head text-text">
            Frequently asked questions
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-card rounded-md border border-border shadow-xs overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 text-sm font-semibold font-head text-text hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
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
                  <div className="px-4 pb-4 text-xs text-muted leading-relaxed border-t border-border pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 12. FINAL CTA BAND */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-lg border border-border p-8 sm:p-12 text-center space-y-6 shadow-pop">
          <div className="max-w-xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold font-head text-text">
              Let your AI SEO agent do the heavy lifting
            </h2>
            <p className="text-sm text-muted">
              Connect your domain, run your first audit, and start uncovering high-impact search opportunities in minutes.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 h-10 px-6 bg-primary hover:bg-primary-hover text-white text-xs font-medium rounded-md shadow-xs transition-colors"
            >
              Start free
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
