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
  Building,
  Clock,
  AlertTriangle,
  RefreshCw,
  Terminal,
  Download,
  HelpCircle,
  X
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
      q: 'Who should use RankPilot AI?',
      a: 'It is designed specifically for SEO freelancers, digital marketing agencies, independent consultants, and in-house SEO teams who manage multiple client websites or complex domains.',
    },
    {
      q: 'Is RankPilot AI designed for SEO agencies?',
      a: 'Yes. Agencies use our multi-domain dashboard to monitor client sites, assign prioritized tasks, verify that developer implementations solved detected issues, and generate white-label PDF executive reports.',
    },
    {
      q: 'Can SEO freelancers use RankPilot AI?',
      a: 'Yes. Freelancers use RankPilot AI to deliver the technical auditing and reporting capacity of a multi-person agency team without needing separate spreadsheet software.',
    },
    {
      q: 'How does the AI SEO agent analyze websites?',
      a: 'Our internal crawler makes safe, rate-limited HTTP requests to your public pages, evaluating HTML structure, meta tags, heading hierarchies, Core Web Vitals, and structured data schemas.',
    },
    {
      q: 'Does RankPilot AI check technical SEO?',
      a: 'Yes. It evaluates over 30 technical factors, including HTTP status codes, canonical consistency, robots.txt directives, noindex tags, XML sitemap presence, and page response latency.',
    },
    {
      q: 'Can RankPilot AI analyze GEO and AEO?',
      a: 'Yes. Beyond standard Google search factors, RankPilot evaluates Generative Engine Optimization (GEO) and Answer Engine Optimization (AEO) signals, such as Schema.org entity disambiguation and direct 40–60 word answer formatting.',
    },
    {
      q: 'Can I connect Google Search Console?',
      a: 'Yes. You can connect authorized Search Console properties with one click using secure Google OAuth 2.0 with read-only permissions.',
    },
    {
      q: 'How does the SEO Opportunity Finder work?',
      a: 'It cross-references your Search Console query data with audited page URLs to identify striking-distance keywords (ranked positions 5–20) that have high impressions and below-average CTR.',
    },
    {
      q: 'Can RankPilot AI identify keyword cannibalization?',
      a: 'Yes. The opportunity engine flags instances where multiple distinct URLs on your domain compete and split impressions for the exact same search query.',
    },
    {
      q: 'Can RankPilot AI investigate traffic drops?',
      a: 'Yes. The Traffic Drop Investigator compares performance across rolling 30-day date windows, isolating the exact pages and queries responsible for clicks or impression declines.',
    },
    {
      q: 'How does RankPilot prioritize SEO tasks?',
      a: 'Tasks are scored using a deterministic formula combining technical defect severity (Critical, High, Medium) with organic impression volume from Search Console.',
    },
    {
      q: 'Can I track completed SEO tasks?',
      a: 'Yes. The Action Center provides a complete task management board with statuses: Backlog, In Progress, Completed (Awaiting Re-Crawl), and Completed (Verified).',
    },
    {
      q: 'Does RankPilot verify completed fixes?',
      a: 'Yes. When you mark a task complete, RankPilot automatically re-crawls the affected URL and verifies whether the defect was actually resolved in live HTML.',
    },
    {
      q: 'Can I generate SEO client reports?',
      a: 'Yes. You can export client-ready executive PDF reports featuring white-label agency branding, verified improvements, and 30-day GSC growth trends.',
    },
    {
      q: 'Does RankPilot AI automatically change my website?',
      a: 'No. RankPilot AI operates in read-only mode for safety. It generates ready-to-deploy code snippets and recommendations, but you or your developers maintain 100% control over live code changes.',
    },
    {
      q: 'Does RankPilot guarantee better rankings?',
      a: 'No. We never make unprovable ranking guarantees. Search algorithms depend on hundreds of dynamic factors. RankPilot guarantees accurate diagnostics, prioritized workflows, and verified code implementations.',
    },
    {
      q: 'How does RankPilot protect website and Google data?',
      a: 'All Search Console API tokens are encrypted in transit and at rest. We enforce multi-tenant organization isolation and never share or sell client data to third parties.',
    },
    {
      q: 'What data does the AI use?',
      a: 'The AI uses the specific HTML DOM and GSC performance metrics of your audited website to draft contextual recommendations. It does not train public models on your proprietary data.',
    },
    {
      q: 'What are the limitations of RankPilot AI?',
      a: 'Our crawler currently analyzes up to 500 pages per audit pass. It requires public URL accessibility and does not bypass paywalls or password-protected staging servers without custom whitelisting.',
    },
  ];

  return (
    <div className="space-y-20 sm:space-y-28 pb-20">
      <SoftwareAppJsonLd />
      <FaqJsonLd faqs={faqs} />

      {/* =========================================================================
          SECTION 1 — HERO SECTION
          ========================================================================= */}
      <section className="pt-10 sm:pt-16 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-tint border border-emerald-200/80 text-primary text-xs font-mono font-medium">
            <Bot className="w-3.5 h-3.5" />
            <span>AI SEO intelligence and action management platform built for SEO professionals</span>
          </div>

          {/* H1 */}
          <h1 className="text-3xl sm:text-5xl lg:text-[48px] font-bold font-head text-text tracking-tight leading-[1.15]">
            Your SEO Intelligence.{' '}
            <span className="text-primary font-bold">From Insight to Action.</span>
          </h1>

          {/* Subheading (max 25 words) */}
          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Analyze websites, discover SEO, GEO and AEO opportunities, understand Google Search Console performance and manage every improvement from one AI-powered platform.
          </p>

          {/* CTAs: 1 Primary Button Rule */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="w-full sm:w-auto h-10 px-6 bg-primary hover:bg-primary-hover text-white text-xs font-medium rounded-md shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              Start Free
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <a
              href="#product-showcase"
              className="w-full sm:w-auto h-10 px-5 bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-text border border-border text-xs font-medium rounded-md shadow-xs transition-colors flex items-center justify-center"
            >
              Explore the Platform
            </a>
          </div>

          <p className="text-xs text-muted">
            Read-only safe Google Search Console integration · No credit card required
          </p>

          {/* AEO Definition Box */}
          <div className="p-3.5 rounded-md bg-card border border-border text-xs text-muted max-w-2xl mx-auto shadow-xs text-center leading-relaxed">
            <span className="font-semibold text-text">RankPilot AI</span> is an AI SEO intelligence and action management platform that audits websites, identifies striking-distance search opportunities, and verifies live code fixes automatically.
          </div>
        </div>

        {/* Hero Visual: Layered Browser Frame Preview */}
        <div className="mt-12 bg-card rounded-lg border border-border shadow-pop p-4 sm:p-6 max-w-5xl mx-auto">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            </div>
            <div className="flex items-center gap-2 bg-bg border border-border px-3 py-1 rounded-sm text-[11px] font-mono text-muted">
              <span className="w-2 h-2 rounded-full bg-primary shrink-0"></span>
              <span>app.rankpilot.ai/dashboard</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-primary bg-primary-tint px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Verification Active
            </div>
          </div>

          {/* 4 Health Dials */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-4">
            <div className="p-4 rounded-md bg-bg border border-border space-y-1">
              <span className="text-[11px] text-muted font-medium block">SEO Health Score</span>
              <p className="text-2xl font-bold font-mono text-text tnum">84 / 100</p>
              <span className="text-[10px] font-mono text-primary font-medium">+14 pts after fixes</span>
            </div>
            <div className="p-4 rounded-md bg-bg border border-border space-y-1">
              <span className="text-[11px] text-muted font-medium block">GEO Entity Clarity</span>
              <p className="text-2xl font-bold font-mono text-accent tnum">88 / 100</p>
              <span className="text-[10px] font-mono text-accent font-medium">Brand disambiguated</span>
            </div>
            <div className="p-4 rounded-md bg-bg border border-border space-y-1">
              <span className="text-[11px] text-muted font-medium block">AEO Answer Readiness</span>
              <p className="text-2xl font-bold font-mono text-text tnum">91 / 100</p>
              <span className="text-[10px] font-mono text-primary font-medium">Answer-first schema</span>
            </div>
            <div className="p-4 rounded-md bg-bg border border-border space-y-1">
              <span className="text-[11px] text-muted font-medium block">Verified Fixes</span>
              <p className="text-2xl font-bold font-mono text-text tnum">18 Tasks</p>
              <span className="text-[10px] font-mono text-primary font-medium">100% re-crawl verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2 — SOCIAL PROOF & TRUST STRIP
          ========================================================================= */}
      <section className="border-y border-border bg-card/60 py-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <p className="text-xs font-mono uppercase tracking-wider text-muted">
            Engineered with transparent methodology, deterministic scoring, and read-only data safety
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono text-muted pt-1">
            <div className="p-3 rounded-md bg-bg border border-border flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>Official Google OAuth 2.0</span>
            </div>
            <div className="p-3 rounded-md bg-bg border border-border flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>Schema.org Graph Validator</span>
            </div>
            <div className="p-3 rounded-md bg-bg border border-border flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>SSRF-Guarded Internal Crawler</span>
            </div>
            <div className="p-3 rounded-md bg-bg border border-border flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>100% Deterministic Deductions</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3 — PROBLEM STATEMENT: THE REAL COST OF DATA FRAGMENTATION
          ========================================================================= */}
      <section className="bg-bg py-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-medium text-error uppercase tracking-wider">
              The Reality of SEO Work
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-head text-text">
              SEO Work Is More Than Finding Problems.
            </h2>
            <p className="text-sm text-muted">
              Traditional tools dump thousands of rows of data into spreadsheets and leave you to figure out what matters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-2.5">
              <span className="text-[10px] font-mono text-error font-bold uppercase">Pain Point 01</span>
              <h3 className="text-sm font-bold font-head text-text">Too Many Tools, Disconnected Workflows</h3>
              <p className="text-xs text-muted leading-relaxed">
                Audits happen in one tool, rank tracking in another, Search Console in a third, and client tasks in spreadsheets. Nothing is connected.
              </p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-2.5">
              <span className="text-[10px] font-mono text-error font-bold uppercase">Pain Point 02</span>
              <h3 className="text-sm font-bold font-head text-text">Hours Lost to Manual Analysis</h3>
              <p className="text-xs text-muted leading-relaxed">
                SEOs spend 15+ hours per client every month reviewing raw crawler outputs just to identify which five technical fixes move the needle.
              </p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-2.5">
              <span className="text-[10px] font-mono text-error font-bold uppercase">Pain Point 03</span>
              <h3 className="text-sm font-bold font-head text-text">Opportunities Hidden in Data</h3>
              <p className="text-xs text-muted leading-relaxed">
                High-impression queries ranked on positions 5–20 get lost in bloated Search Console datasets without automated prioritization.
              </p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-2.5">
              <span className="text-[10px] font-mono text-error font-bold uppercase">Pain Point 04</span>
              <h3 className="text-sm font-bold font-head text-text">Recommendations Without Priorities</h3>
              <p className="text-xs text-muted leading-relaxed">
                Legacy audit tools deliver 50-page laundry lists that treat a missing image alt tag with the exact same urgency as a broken canonical URL.
              </p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-2.5">
              <span className="text-[10px] font-mono text-error font-bold uppercase">Pain Point 05</span>
              <h3 className="text-sm font-bold font-head text-text">Client Work Is Difficult to Track</h3>
              <p className="text-xs text-muted leading-relaxed">
                Developers mark tasks done in Jira or email, but agencies have no automated way to verify whether the fix is actually live in production HTML.
              </p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-2.5">
              <span className="text-[10px] font-mono text-error font-bold uppercase">Pain Point 06</span>
              <h3 className="text-sm font-bold font-head text-text">The Monthly Reporting Grind</h3>
              <p className="text-xs text-muted leading-relaxed">
                Assembling screenshots, charts, and executive summaries takes hours of non-billable agency time every single month.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4 — INTRODUCE THE SOLUTION: THE CONNECTED LIFECYCLE
          ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
            Connected Operating System
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-head text-text">
            Meet Your AI SEO Intelligence and Action Platform.
          </h2>
          <p className="text-sm text-muted">
            RankPilot AI unites website diagnostics, search performance data, and task management into one continuous operational flow.
          </p>
        </div>

        {/* 7-Node Lifecycle Interactive Graphic */}
        <div className="bg-card rounded-lg border border-border p-6 sm:p-8 shadow-card">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
            <div className="p-3.5 rounded-md bg-bg border border-border space-y-1">
              <span className="text-xs font-mono text-primary font-bold block">01</span>
              <span className="text-xs font-bold font-head text-text block">Analyze</span>
              <span className="text-[11px] text-muted block">SSRF crawl & scores</span>
            </div>
            <div className="p-3.5 rounded-md bg-bg border border-border space-y-1">
              <span className="text-xs font-mono text-accent font-bold block">02</span>
              <span className="text-xs font-bold font-head text-text block">Discover</span>
              <span className="text-[11px] text-muted block">GSC rank targets</span>
            </div>
            <div className="p-3.5 rounded-md bg-bg border border-border space-y-1">
              <span className="text-xs font-mono text-primary font-bold block">03</span>
              <span className="text-xs font-bold font-head text-text block">Prioritize</span>
              <span className="text-[11px] text-muted block">Severity math</span>
            </div>
            <div className="p-3.5 rounded-md bg-bg border border-border space-y-1">
              <span className="text-xs font-mono text-accent font-bold block">04</span>
              <span className="text-xs font-bold font-head text-text block">Execute</span>
              <span className="text-[11px] text-muted block">Ready Schema code</span>
            </div>
            <div className="p-3.5 rounded-md bg-bg border border-border space-y-1">
              <span className="text-xs font-mono text-primary font-bold block">05</span>
              <span className="text-xs font-bold font-head text-text block">Monitor</span>
              <span className="text-[11px] text-muted block">Track 30-day trends</span>
            </div>
            <div className="p-3.5 rounded-md bg-bg border border-border space-y-1">
              <span className="text-xs font-mono text-accent font-bold block">06</span>
              <span className="text-xs font-bold font-head text-text block">Verify</span>
              <span className="text-[11px] text-muted block">Automated re-crawl</span>
            </div>
            <div className="p-3.5 rounded-md bg-bg border border-border space-y-1">
              <span className="text-xs font-mono text-primary font-bold block">07</span>
              <span className="text-xs font-bold font-head text-text block">Report</span>
              <span className="text-[11px] text-muted block">White-label PDF</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5 — WHAT YOUR AI SEO AGENT HELPS YOU DO (7 CAPABILITIES)
          ========================================================================= */}
      <section className="bg-bg py-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-head text-text">
              Everything You Need to Move from Data to Execution.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-2.5">
              <div className="w-8 h-8 rounded-md bg-primary-tint text-primary flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold font-head text-text">Website SEO Intelligence</h3>
              <p className="text-xs text-muted leading-relaxed">
                Scan pages for 30+ technical issues with zero false positives. Identify broken links, canonical defects, and speed bottlenecks.
              </p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-2.5">
              <div className="w-8 h-8 rounded-md bg-accent-tint text-accent flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold font-head text-text">GEO and AEO Analysis</h3>
              <p className="text-xs text-muted leading-relaxed">
                Audit content clarity, Schema.org entity graphs, and answer-first sentence structures required for citation by ChatGPT, Perplexity, and AI Overviews.
              </p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-2.5">
              <div className="w-8 h-8 rounded-md bg-primary-tint text-primary flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold font-head text-text">Google Search Console Intelligence</h3>
              <p className="text-xs text-muted leading-relaxed">
                Direct OAuth 2.0 integration synchronizes query-level impressions, clicks, and CTR, mapping performance directly to audited pages.
              </p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-2.5">
              <div className="w-8 h-8 rounded-md bg-accent-tint text-accent flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold font-head text-text">SEO Opportunity Finder</h3>
              <p className="text-xs text-muted leading-relaxed">
                Algorithmically flags striking-distance keywords (ranked positions 5–20) with high search volume, pinpointing immediate ranking gains.
              </p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-2.5">
              <div className="w-8 h-8 rounded-md bg-primary-tint text-primary flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold font-head text-text">SEO Action Center</h3>
              <p className="text-xs text-muted leading-relaxed">
                Converts diagnostic findings into assigned, sprint-ready tasks with estimated completion time and developer instructions.
              </p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-2.5">
              <div className="w-8 h-8 rounded-md bg-accent-tint text-accent flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold font-head text-text">Automated Fix Verification</h3>
              <p className="text-xs text-muted leading-relaxed">
                When a task is marked complete, the agent automatically re-crawls the affected URL and inspects the live DOM to verify resolution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6 — HOW RANKPILOT AI WORKS: STEP-BY-STEP WORKFLOW
          ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
            Operational Blueprint
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-head text-text">
            From Website Analysis to Verified SEO Progress.
          </h2>
          <p className="text-sm text-muted">
            A transparent, reliable 7-step process designed for serious SEO practitioners.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-2.5">
            <span className="font-mono text-xl font-bold text-primary block">Step 01</span>
            <h3 className="text-sm font-bold font-head text-text">Connect Your Website</h3>
            <p className="text-xs text-muted leading-relaxed">
              Add your domain name. Multi-tenant storage isolates client data securely with zero risk.
            </p>
          </div>

          <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-2.5">
            <span className="font-mono text-xl font-bold text-accent block">Step 02</span>
            <h3 className="text-sm font-bold font-head text-text">Analyze Your SEO</h3>
            <p className="text-xs text-muted leading-relaxed">
              The SSRF-guarded crawler inspects pages and calculates transparent mathematical health scores.
            </p>
          </div>

          <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-2.5">
            <span className="font-mono text-xl font-bold text-primary block">Step 03</span>
            <h3 className="text-sm font-bold font-head text-text">Connect Search Console</h3>
            <p className="text-xs text-muted leading-relaxed">
              Link authorized GSC data via official OAuth 2.0 to access actual organic traffic and ranking trends.
            </p>
          </div>

          <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-2.5">
            <span className="font-mono text-xl font-bold text-accent block">Step 04</span>
            <h3 className="text-sm font-bold font-head text-text">Discover Opportunities</h3>
            <p className="text-xs text-muted leading-relaxed">
              Uncover high-impression queries in striking distance (positions 5–20) and isolate traffic drops.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-2.5">
            <span className="font-mono text-xl font-bold text-primary block">Step 05</span>
            <h3 className="text-sm font-bold font-head text-text">Prioritize Your Work</h3>
            <p className="text-xs text-muted leading-relaxed">
              Filter by category (technical, content, GEO, AEO) and severity in the Action Center.
            </p>
          </div>

          <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-2.5">
            <span className="font-mono text-xl font-bold text-accent block">Step 06</span>
            <h3 className="text-sm font-bold font-head text-text">Track & Verify Improvements</h3>
            <p className="text-xs text-muted leading-relaxed">
              Mark tasks completed. The agent re-crawls the target URL, compares evidence, and confirms resolution.
            </p>
          </div>

          <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-2.5">
            <span className="font-mono text-xl font-bold text-primary block">Step 07</span>
            <h3 className="text-sm font-bold font-head text-text">Report Your Progress</h3>
            <p className="text-xs text-muted leading-relaxed">
              Deliver polished executive PDF summaries to clients proving the measurable impact of completed work.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7 — INTERACTIVE PRODUCT SHOWCASE (AUTHENTIC SOFTWARE DEMONSTRATION)
          ========================================================================= */}
      <section id="product-showcase" className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
            Authentic Application Showcase
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-head text-text">
            See the Intelligence Behind Your SEO Workflow.
          </h2>
          <p className="text-sm text-muted">
            Inspect the real interface used by SEO professionals to manage audits, opportunities, and client deliverables.
          </p>
        </div>

        {/* Live Multi-Tab Showcase Component */}
        <ProductShowcase />
      </section>

      {/* =========================================================================
          SECTION 8 — WHY RANKPILOT AI IS DIFFERENT
          ========================================================================= */}
      <section className="bg-bg py-14">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
              True Differentiation
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-head text-text">
              Not Just Another SEO Audit. A Better Way to Manage SEO Work.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-2.5">
              <h3 className="text-sm font-bold font-head text-text">Evidence Before Recommendations</h3>
              <p className="text-xs text-muted leading-relaxed">
                We never deliver a generic "fix your title tag" recommendation without providing the exact affected URL, the current HTML snippet, and the technical explanation of why it matters.
              </p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-2.5">
              <h3 className="text-sm font-bold font-head text-text">Insights Connected to Actions</h3>
              <p className="text-xs text-muted leading-relaxed">
                Findings do not die in an Excel export. Every audit finding and GSC opportunity can be turned into an organized action item with one click.
              </p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-2.5">
              <h3 className="text-sm font-bold font-head text-text">SEO Data in Context</h3>
              <p className="text-xs text-muted leading-relaxed">
                Combining site crawl data with Search Console metrics reveals which technical errors actually suppress high-impression queries.
              </p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-2.5">
              <h3 className="text-sm font-bold font-head text-text">Priorities That Make Sense</h3>
              <p className="text-xs text-muted leading-relaxed">
                Rather than treating 200 minor warnings with equal weight, our scoring engine mathematically prioritizes critical blockers that harm indexation.
              </p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-2.5">
              <h3 className="text-sm font-bold font-head text-text">Verification, Not Just Checkboxes</h3>
              <p className="text-xs text-muted leading-relaxed">
                Avoid relying on manual developer promises. RankPilot re-crawls the exact page to verify that the fix is live in production.
              </p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-2.5">
              <h3 className="text-sm font-bold font-head text-text">One Organized Agency Workflow</h3>
              <p className="text-xs text-muted leading-relaxed">
                Replace four disconnected subscription tools with one unified intelligence and execution platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9 — BUILT FOR YOUR SEO WORKFLOW (3 AUDIENCE MODULES)
          ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-mono font-medium text-accent uppercase tracking-wider">
            Tailored Solutions
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-head text-text">
            Tailored Workflows for Every SEO Practitioner.
          </h2>
        </div>

        {/* Audience Selector Tabs */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setActiveAudienceTab('freelancers')}
            className={`px-4 py-2 text-xs font-medium rounded-md border transition-all ${
              activeAudienceTab === 'freelancers'
                ? 'bg-card border-primary text-primary font-semibold shadow-xs'
                : 'bg-bg text-muted border-border hover:text-text'
            }`}
          >
            For SEO Freelancers
          </button>
          <button
            onClick={() => setActiveAudienceTab('agencies')}
            className={`px-4 py-2 text-xs font-medium rounded-md border transition-all ${
              activeAudienceTab === 'agencies'
                ? 'bg-card border-primary text-primary font-semibold shadow-xs'
                : 'bg-bg text-muted border-border hover:text-text'
            }`}
          >
            For SEO Agencies
          </button>
          <button
            onClick={() => setActiveAudienceTab('inhouse')}
            className={`px-4 py-2 text-xs font-medium rounded-md border transition-all ${
              activeAudienceTab === 'inhouse'
                ? 'bg-card border-primary text-primary font-semibold shadow-xs'
                : 'bg-bg text-muted border-border hover:text-text'
            }`}
          >
            For In-House SEO Teams
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="bg-card rounded-lg border border-border p-6 sm:p-8 shadow-card max-w-4xl mx-auto">
          {activeAudienceTab === 'freelancers' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <span className="text-xs font-mono font-bold text-muted uppercase">Freelancers & Solo Consultants</span>
              <h3 className="text-xl font-bold font-head text-text">
                Manage More SEO Work Without Managing More Spreadsheets.
              </h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                Solo consultants handle everything from technical crawls to client reporting. RankPilot AI automates the time-consuming data collation, generates prioritized client action plans, and verifies code fixes, allowing you to double your client roster without burning out.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-muted pt-2">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> Up to 3 client domains monitored</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> Fast 25-page technical audits</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> GSC striking distance keyword finder</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> 1-click executive client reports</li>
              </ul>
            </div>
          )}

          {activeAudienceTab === 'agencies' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <span className="text-xs font-mono font-bold text-primary uppercase">SEO & Digital Marketing Agencies</span>
              <h3 className="text-xl font-bold font-head text-text">
                Bring Your Client SEO Work Into One Organized Workflow.
              </h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                Manage multiple client domains, track team action items, and prove retainer ROI with automated re-crawl verification. Eliminate the monthly reporting scramble with white-label, executive client PDF deliverables.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-muted pt-2">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> Multi-domain agency monitoring (up to 15 sites)</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> White-label branding on executive reports</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> Automated re-audit verification after task completion</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> Priority agent execution queue</li>
              </ul>
            </div>
          )}

          {activeAudienceTab === 'inhouse' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <span className="text-xs font-mono font-bold text-accent uppercase">In-House SEO Experts & Directors</span>
              <h3 className="text-xl font-bold font-head text-text">
                Turn Organic Search Insights Into Clear Priorities.
              </h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                Bridge the gap between SEO strategy and developer sprint tickets. Hand engineering teams prioritized tickets with ready-to-deploy Schema.org code, exact URL targets, and clear evidence of impact.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-muted pt-2">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> Mathematical priority scoring for Jira sprints</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> Ready-to-deploy Schema.org JSON-LD snippets</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> Traffic drop root-cause investigation</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> Transparent audit history & trendlines</li>
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 10 — TRUST & TRANSPARENCY (OUR CORE PHILOSOPHY)
          ========================================================================= */}
      <section className="bg-card border-y border-border py-14">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-medium text-accent uppercase tracking-wider">
              Transparent Methodology
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-head text-text">
              Know Why the Agent Recommends Something.
            </h2>
            <p className="text-sm text-muted">
              We believe SEO tools should be accountable. Every finding is backed by evidence, not black-box speculation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-md bg-bg border border-border space-y-1.5">
              <span className="text-xs font-bold font-head text-text block">Deterministic Scoring</span>
              <p className="text-xs text-muted leading-relaxed">
                Category weightings (Technical 30%, On-Page 25%, Indexability 20%, AEO 15%, GEO 10%) are mathematically verified. Deductions are consistent and transparent.
              </p>
            </div>

            <div className="p-4 rounded-md bg-bg border border-border space-y-1.5">
              <span className="text-xs font-bold font-head text-text block">Read-Only Safety</span>
              <p className="text-xs text-muted leading-relaxed">
                We connect to Google Search Console via official OAuth 2.0 with read-only permissions. We never alter your sitemaps, robots.txt, or live site code.
              </p>
            </div>

            <div className="p-4 rounded-md bg-bg border border-border space-y-1.5">
              <span className="text-xs font-bold font-head text-text block">Evidence-Backed Insights</span>
              <p className="text-xs text-muted leading-relaxed">
                Every finding displays the raw HTTP status code, response headers, or HTML DOM elements that triggered the alert.
              </p>
            </div>

            <div className="p-4 rounded-md bg-bg border border-border space-y-1.5">
              <span className="text-xs font-bold font-head text-text block">Explicit Limitations</span>
              <p className="text-xs text-muted leading-relaxed">
                We clearly document crawler boundaries, sample sizes, and rate limits so you always know what was inspected.
              </p>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/trust-and-methodology"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
            >
              Explore our full scoring methodology
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 11 — CLIENT RESULTS & VERIFIED CASE STUDY FRAMEWORK
          ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
            Verified Outcomes
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-head text-text">
            Real SEO Work. Measurable Progress.
          </h2>
          <p className="text-xs text-muted">
            How structured action management turns technical fixes into verified organic visibility.
          </p>
        </div>

        {/* Methodology Demonstration Container */}
        <div className="bg-card rounded-lg border border-border p-6 sm:p-8 shadow-card max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <span className="text-[10px] font-mono text-muted uppercase">Methodology Case Demonstration</span>
              <h4 className="text-sm font-bold font-head text-text">E-Commerce Information Architecture Restructure</h4>
            </div>
            <span className="text-xs font-mono text-primary bg-primary-tint px-2.5 py-0.5 rounded-full border border-emerald-200">
              Verified Fix
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 rounded bg-bg border border-border">
              <span className="text-[10px] text-muted block uppercase">Initial Challenge</span>
              <span className="text-text font-medium block mt-1">45 orphaned category URLs & unclosed schema graph</span>
            </div>
            <div className="p-3 rounded bg-bg border border-border">
              <span className="text-[10px] text-muted block uppercase">Action Executed</span>
              <span className="text-text font-medium block mt-1">Deployed breadcrumb schema & internal link re-routing</span>
            </div>
            <div className="p-3 rounded bg-bg border border-border">
              <span className="text-[10px] text-muted block uppercase">Re-Crawl Verification</span>
              <span className="text-primary font-bold block mt-1">100% Verified in DOM within 48 hours</span>
            </div>
          </div>

          <p className="text-xs text-muted italic pt-1">
            Note: [ADD REAL CASE STUDY: Verified client case studies will be published here upon completion of authorized pilot agency deployments].
          </p>
        </div>
      </section>

      {/* =========================================================================
          SECTION 12 — PRICING PREVIEW
          ========================================================================= */}
      <section className="bg-bg py-14">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
              Transparent Pricing
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-head text-text">
              Transparent Pricing Built for Growing Agencies.
            </h2>
            <p className="text-sm text-muted">
              Predictable monthly and annual plans. No per-seat penalties, no surprise credit overages.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="pt-2 flex items-center justify-center gap-3 text-xs font-medium">
              <span className={!isAnnualPricing ? 'text-text font-bold' : 'text-muted'}>Monthly</span>
              <button
                type="button"
                role="switch"
                aria-checked={isAnnualPricing}
                onClick={() => setIsAnnualPricing(!isAnnualPricing)}
                className="w-12 h-6 rounded-full bg-slate-200 dark:bg-slate-700 p-0.5 transition-colors relative"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white dark:bg-slate-900 shadow-xs transition-transform ${
                    isAnnualPricing ? 'translate-x-6 bg-primary' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={isAnnualPricing ? 'text-text font-bold flex items-center gap-1.5' : 'text-muted flex items-center gap-1.5'}>
                <span>Annual billing</span>
                <span className="text-[10px] font-mono font-bold text-primary bg-primary-tint border border-emerald-200/80 px-2 py-0.5 rounded-full">
                  Save 20% [confirm]
                </span>
              </span>
            </div>
          </div>

          {/* 3 Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
            {PRICING_CONFIG.tiers.map((tier) => {
              const price = isAnnualPricing ? tier.annualMonthlyPrice : tier.monthlyPrice;
              return (
                <div
                  key={tier.id}
                  className={`bg-card rounded-lg p-6 shadow-card flex flex-col justify-between relative transition-all ${
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
                        <span className="text-3xl font-bold font-mono text-text tnum">
                          ${price}
                        </span>
                        <span className="text-xs text-muted font-mono">/ month</span>
                      </div>
                      <p className="mt-2 text-xs text-muted">
                        {tier.tagline}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <ul className="space-y-2 text-xs text-muted">
                        {tier.features.slice(0, 5).map((f, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="text-text">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6">
                    <Link
                      href={tier.ctaHref}
                      className={`w-full h-10 flex items-center justify-center rounded-md text-xs font-medium transition-colors ${
                        tier.primaryCta
                          ? 'bg-primary hover:bg-primary-hover text-white shadow-xs'
                          : 'border border-border bg-card hover:bg-slate-50 text-text shadow-xs'
                      }`}
                    >
                      {tier.ctaText}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center pt-2">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
            >
              Compare full feature matrix & limits
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 13 — COMPREHENSIVE FAQS (20 QUESTIONS)
          ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
            Detailed Answers
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-head text-text">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-muted">
            Direct, factual explanations of RankPilot AI's capabilities, data handling, and limitations.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-2.5">
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

      {/* =========================================================================
          SECTION 14 — FINAL CONVERSION CTA BAND
          ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-lg border border-border p-8 sm:p-12 text-center space-y-6 shadow-pop">
          <div className="max-w-xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold font-head text-text">
              Spend Less Time Sorting SEO Data. More Time Moving SEO Forward.
            </h2>
            <p className="text-xs sm:text-sm text-muted">
              Bring website analysis, search performance insights and SEO action management into one organized workflow.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10 px-6 bg-primary hover:bg-primary-hover text-white text-xs font-medium rounded-md shadow-xs transition-colors"
            >
              Get Started with RankPilot AI
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/features"
              className="w-full sm:w-auto inline-flex items-center justify-center h-10 px-5 bg-card hover:bg-slate-50 border border-border text-xs font-medium text-text rounded-md shadow-xs"
            >
              Explore Features & Workflows
            </Link>
          </div>

          <p className="text-[11px] text-muted">
            Complimentary pilot access · No credit card required · Read-only safe integrations
          </p>
        </div>
      </section>
    </div>
  );
}
