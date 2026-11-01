'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Search,
  Sparkles,
  Bot,
  Terminal,
  ChevronDown,
  FileText,
  Clock,
  Layers,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { BreadcrumbsJsonLd, HowToJsonLd, FaqJsonLd } from '@/components/seo/json-ld';

export default function HowItWorksPage() {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const examplePrompts = [
    {
      category: 'Audit',
      prompt: 'Audit example.com and list the top 10 fixes by impact.',
    },
    {
      category: 'Keywords',
      prompt: 'Find 20 low-competition keywords for a bakery in Austin.',
    },
    {
      category: 'Content',
      prompt: "Write a content brief for 'how to choose running shoes'.",
    },
    {
      category: 'Reports',
      prompt: 'Create a monthly SEO report for my client and summarize the wins.',
    },
    {
      category: 'AI search',
      prompt: 'Check if my pricing page is ready to be cited by AI search engines.',
    },
  ];

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const faqs = [
    {
      q: 'How does an AI SEO agent work?',
      a: 'The agent combines autonomous web crawling with AI reasoning. When you give it a command, it scans your site HTML, queries your connected Search Console data, calculates transparent health deductions, and produces step-by-step tasks with ready-to-deploy code.',
    },
    {
      q: 'Do I need SEO experience?',
      a: 'No deep technical background is required. RankPilot AI translates obscure crawler errors into plain English. It explains why each issue matters, what impact it has, and exactly how to resolve it.',
    },
    {
      q: 'What can I ask the agent to do?',
      a: 'You can ask the agent to run full technical audits, detect keyword gaps, find striking-distance queries, write structured content briefs, diagnose sudden traffic drops, and export client-facing performance reports.',
    },
    {
      q: 'Does the agent change my website by itself?',
      a: 'Never without your explicit approval. The agent operates with read-only safety. It prepares code, schema snippets, and copy recommendations, but you inspect and approve every change before implementation.',
    },
    {
      q: 'How long does a full site audit take?',
      a: '[confirm] A typical site audit of 25 to 100 pages completes in approximately 2 to 5 minutes, running background checks on meta tags, Core Web Vitals, schemas, and links simultaneously.',
    },
    {
      q: 'Which data sources and integrations does it use?',
      a: '[confirm] The agent integrates with Google Search Console through secure Google OAuth 2.0, utilizes an internal SSRF-guarded crawler, and references current search engine and answer engine ranking guidelines.',
    },
    {
      q: 'How is it different from a regular SEO tool?',
      a: 'Regular tools only show charts and tables, leaving all the thinking and task creation to you. RankPilot AI is an active agent: it manages work, drafts solutions, re-audits pages to verify completed fixes, and automates client deliverables.',
    },
  ];

  return (
    <div className="py-12 sm:py-20 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
      <BreadcrumbsJsonLd
        items={[
          { name: 'Home', url: 'https://rankpilot.ai' },
          { name: 'How It Works', url: 'https://rankpilot.ai/how-it-works' },
        ]}
      />
      <HowToJsonLd />
      <FaqJsonLd faqs={faqs} />
      {/* 1. HERO */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-tint border border-emerald-200/80 text-primary text-xs font-mono font-medium">
          <Bot className="w-3.5 h-3.5" />
          <span>How RankPilot AI works</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold font-head text-text tracking-tight leading-[1.15]">
          How the AI SEO agent works: from your first prompt to a finished SEO report
        </h1>

        <p className="text-base text-muted max-w-xl mx-auto leading-relaxed">
          Tell the agent what you need. It does the research, finds the problems and suggests fixes. You review and approve.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/signup"
            className="w-full sm:w-auto h-10 px-6 bg-primary hover:bg-primary-hover text-white text-xs font-medium rounded-md shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            Start free
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <a
            href="#walkthrough"
            className="w-full sm:w-auto h-10 px-5 bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-text border border-border text-xs font-medium rounded-md shadow-xs transition-colors flex items-center justify-center"
          >
            See the agent in action
          </a>
        </div>

        {/* Quick Answer Box (40-60 words) */}
        <div className="p-4 rounded-md bg-card border border-border text-xs text-muted max-w-2xl mx-auto shadow-xs text-left leading-relaxed">
          <span className="font-semibold text-text block mb-1">Quick Answer:</span>
          RankPilot AI is an AI SEO agent. You give it a task in plain English, such as "audit my site". The agent crawls your pages, checks keywords and technical issues, and returns a prioritized list of fixes and a client-ready report. You stay in control and approve every change.
        </div>
      </section>

      {/* 2. 4-STEP OVERVIEW STEPPER */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
            High-Level Process
          </span>
          <h2 className="text-2xl font-bold font-head text-text">
            4 simple steps to automated SEO progress
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-2.5">
            <span className="text-xs font-mono font-bold text-primary bg-primary-tint px-2.5 py-1 rounded-full border border-emerald-200">
              Step 01
            </span>
            <h3 className="text-sm font-bold font-head text-text">Connect your site</h3>
            <p className="text-xs text-muted leading-relaxed">
              Add your domain name and optionally link Google Search Console for real ranking data [confirm].
            </p>
          </div>

          <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-2.5">
            <span className="text-xs font-mono font-bold text-accent bg-accent-tint px-2.5 py-1 rounded-full border border-blue-200">
              Step 02
            </span>
            <h3 className="text-sm font-bold font-head text-text">Ask the agent</h3>
            <p className="text-xs text-muted leading-relaxed">
              Give a command like "Audit my landing page" or choose from pre-built agency workflows.
            </p>
          </div>

          <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-2.5">
            <span className="text-xs font-mono font-bold text-primary bg-primary-tint px-2.5 py-1 rounded-full border border-emerald-200">
              Step 03
            </span>
            <h3 className="text-sm font-bold font-head text-text">Watch it work</h3>
            <p className="text-xs text-muted leading-relaxed">
              Follow the real-time execution timeline as the agent crawls and computes deductions.
            </p>
          </div>

          <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-2.5">
            <span className="text-xs font-mono font-bold text-accent bg-accent-tint px-2.5 py-1 rounded-full border border-blue-200">
              Step 04
            </span>
            <h3 className="text-sm font-bold font-head text-text">Review, fix & share</h3>
            <p className="text-xs text-muted leading-relaxed">
              Inspect prioritized action items, verify resolutions automatically, and export reports.
            </p>
          </div>
        </div>
      </section>

      {/* 3. DETAILED WALKTHROUGH (Alternating visual blocks) */}
      <section id="walkthrough" className="space-y-16 scroll-mt-20">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
            Deep Walkthrough
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-head text-text">
            Every step explained with live visuals
          </h2>
        </div>

        {/* Step 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-mono text-primary font-bold uppercase">Step 1</span>
            <h2 className="text-xl sm:text-2xl font-bold font-head text-text">
              Connect your website in 30 seconds
            </h2>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Start by entering your client or personal website domain. You can also connect Google Search Console with a single click to synchronize organic impressions, CTR, and search queries.
            </p>
            <div className="p-3 rounded-md bg-card border border-border text-xs space-y-1.5 shadow-xs">
              <p><strong className="text-text">What you do:</strong> Enter domain name (e.g. example.com) and click connect.</p>
              <p><strong className="text-text">What the agent does:</strong> Validates domain DNS, initializes multi-tenant storage, and schedules an initial crawler pass.</p>
            </div>
          </div>
          {/* Visual: Add Website Form */}
          <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs font-bold font-head text-text">Add Monitored Website</span>
              <span className="text-[10px] font-mono text-primary bg-primary-tint px-2 py-0.5 rounded-full">Safe Mode</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-text block mb-1">Website Domain</label>
                <input
                  type="text"
                  readOnly
                  value="https://myagencysite.com"
                  className="w-full text-xs px-3 h-10 rounded-md border border-border bg-bg text-text font-mono"
                />
              </div>
              <button className="w-full h-10 rounded-md bg-card border border-border text-xs font-medium text-text flex items-center justify-center gap-2 hover:bg-slate-50">
                <Search className="w-4 h-4 text-accent" />
                Connect Google Search Console
              </button>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center lg:flex-row-reverse">
          <div className="lg:order-2 space-y-4">
            <span className="text-xs font-mono text-accent font-bold uppercase">Step 2</span>
            <h2 className="text-xl sm:text-2xl font-bold font-head text-text">
              Ask the agent what to analyze
            </h2>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Interact using simple English prompts. Whether you need a 25-page technical crawl or striking-distance keyword detection, the agent interprets your goal and drafts the plan.
            </p>
            <div className="p-3 rounded-md bg-card border border-border text-xs space-y-1.5 shadow-xs">
              <p><strong className="text-text">What you do:</strong> Type your prompt or click a suggested prompt chip.</p>
              <p><strong className="text-text">What the agent does:</strong> Deconstructs the request into specific crawler, GSC, and scoring tasks.</p>
            </div>
          </div>
          {/* Visual: Chat Box */}
          <div className="lg:order-1 bg-card rounded-lg border border-border p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <div className="w-6 h-6 rounded-full bg-accent-tint text-accent flex items-center justify-center font-bold text-xs">AI</div>
              <span className="text-xs font-bold text-text">Agent Interaction</span>
            </div>
            <div className="bg-primary-tint border border-emerald-200/80 text-text p-3 rounded-md text-xs font-medium">
              "Audit example.com and find the top 10 fixes by impact."
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-1 rounded-sm bg-bg border border-border text-[11px] text-muted">Find striking distance queries</span>
              <span className="px-2 py-1 rounded-sm bg-bg border border-border text-[11px] text-muted">Check Schema.org code</span>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-mono text-primary font-bold uppercase">Step 3</span>
            <h2 className="text-xl sm:text-2xl font-bold font-head text-text">
              Watch autonomous background execution
            </h2>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Follow every step in a live vertical timeline. Transparent execution logs confirm crawler safety, IP verification, and mathematical score calculations.
            </p>
            <div className="p-3 rounded-md bg-card border border-border text-xs space-y-1.5 shadow-xs">
              <p><strong className="text-text">What you do:</strong> Sit back while the agent processes the pipeline.</p>
              <p><strong className="text-text">What the agent does:</strong> Fetches pages safely, parses heading structures, and computes transparent health deductions.</p>
            </div>
          </div>
          {/* Visual: Live Timeline + Log */}
          <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-4">
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-text font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Crawl 25 internal pages
                </span>
                <span className="font-mono text-[11px] text-muted">1.4s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-text font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Evaluate SEO, GEO & AEO health
                </span>
                <span className="font-mono text-[11px] text-muted">0.9s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-accent font-medium">
                  <RefreshCw className="w-3.5 h-3.5 text-accent animate-spin" /> Generate prioritized tasks
                </span>
                <span className="font-mono text-[11px] text-accent">Active</span>
              </div>
            </div>
            <div className="p-2.5 rounded-md bg-[#F1F5F9] dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300">
              &gt; [Verification] Calculated SEO Score: 84/100
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center lg:flex-row-reverse">
          <div className="lg:order-2 space-y-4">
            <span className="text-xs font-mono text-accent font-bold uppercase">Step 4</span>
            <h2 className="text-xl sm:text-2xl font-bold font-head text-text">
              Review, fix and verify improvements
            </h2>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Every finding turns into an actionable task. Once you mark a task complete, the agent automatically re-crawls the affected URL to verify that the issue was actually solved before generating the client report.
            </p>
            <div className="p-3 rounded-md bg-card border border-border text-xs space-y-1.5 shadow-xs">
              <p><strong className="text-text">What you do:</strong> Review recommended fixes, click "Fix with agent", and mark items done.</p>
              <p><strong className="text-text">What the agent does:</strong> Re-fetches the live URL, confirms fix presence, updates the health score, and compiles the report.</p>
            </div>
          </div>
          {/* Visual: Audit Results + Fix */}
          <div className="lg:order-1 bg-card rounded-lg border border-border p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs font-bold text-text">Action Task Verification</span>
              <span className="text-[10px] font-mono text-primary bg-primary-tint px-2 py-0.5 rounded-full">Re-Check Passed</span>
            </div>
            <div className="p-3 rounded-md bg-bg border border-border space-y-1.5 text-xs">
              <span className="text-[10px] font-mono font-bold uppercase text-error bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                Critical Fixed
              </span>
              <p className="font-semibold text-text">Add Missing H1 Heading on /services</p>
              <p className="text-muted text-[11px]">Re-audit verified: Valid H1 heading now detected in live HTML.</p>
            </div>
            <button className="w-full h-9 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-medium shadow-xs">
              Export Client PDF Report
            </button>
          </div>
        </div>
      </section>

      {/* 4. EXAMPLE PROMPTS */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
            Copyable Commands
          </span>
          <h2 className="text-2xl font-bold font-head text-text">
            Example prompts you can give the agent
          </h2>
          <p className="text-xs text-muted">
            The agent explains what it will do before it makes any change.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {examplePrompts.map((p, idx) => (
            <div
              key={idx}
              className="bg-card rounded-lg border border-border p-4 shadow-card flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase text-muted tracking-wider">
                  {p.category}
                </span>
                <p className="text-xs font-medium text-text leading-relaxed">
                  "{p.prompt}"
                </p>
              </div>
              <button
                onClick={() => handleCopy(p.prompt, idx)}
                className="self-end text-[11px] font-mono text-muted hover:text-text flex items-center gap-1 hover:underline"
              >
                {copiedIdx === idx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-primary" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy prompt</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 5. YOU STAY IN CONTROL (3 Cards) */}
      <section className="bg-bg py-12 rounded-lg border border-border p-6 sm:p-8 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
            Safe Architecture
          </span>
          <h2 className="text-2xl font-bold font-head text-text">
            You stay in complete control
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-2">
            <h3 className="text-sm font-bold font-head text-text">You approve every change</h3>
            <p className="text-xs text-muted leading-relaxed">
              The agent provides recommendations, code snippets, and structured tasks, but never touches live production code without your sign-off.
            </p>
          </div>

          <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-2">
            <h3 className="text-sm font-bold font-head text-text">Your data stays yours [confirm]</h3>
            <p className="text-xs text-muted leading-relaxed">
              We access Search Console data via read-only APIs and never train public models on your proprietary queries or client lists.
            </p>
          </div>

          <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-2">
            <h3 className="text-sm font-bold font-head text-text">See every step</h3>
            <p className="text-xs text-muted leading-relaxed">
              Full transparent activity logs show crawler requests, IP addresses checked, and exact formulas behind score deductions.
            </p>
          </div>
        </div>
      </section>

      {/* 6. WHO IT HELPS (3 Cards) */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-mono font-medium text-accent uppercase tracking-wider">
            Target Audience
          </span>
          <h2 className="text-2xl font-bold font-head text-text">
            Who benefits from an AI SEO agent?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-2.5">
            <span className="text-xs font-bold font-head text-muted uppercase">Freelancers</span>
            <p className="text-xs text-muted leading-relaxed">
              Deliver complete agency-level audit packages and monthly progress reports with zero manual spreadsheet work.
            </p>
          </div>

          <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-2.5">
            <span className="text-xs font-bold font-head text-primary uppercase">Agencies</span>
            <p className="text-xs text-muted leading-relaxed">
              Standardize task management and prove ROI to multiple clients with automated re-crawl verification.
            </p>
          </div>

          <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-2.5">
            <span className="text-xs font-bold font-head text-muted uppercase">In-house SEOs</span>
            <p className="text-xs text-muted leading-relaxed">
              Bridge the communication gap with developer teams by handing them ready-made Schema code and validated tickets.
            </p>
          </div>
        </div>
      </section>

      {/* 7. COMPARISON TABLE */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl font-bold font-head text-text">
            How RankPilot AI compares to traditional approaches
          </h2>
        </div>

        <div className="bg-card rounded-lg border border-border shadow-card overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-border">
              <tr className="h-12 text-[11px] font-mono text-muted uppercase">
                <th className="py-3 px-4 font-semibold">Workflow Requirement</th>
                <th className="py-3 px-4 font-semibold text-center">Manual Work</th>
                <th className="py-3 px-4 font-semibold text-center">Traditional Tools</th>
                <th className="py-3 px-4 font-semibold text-center text-primary">RankPilot AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-sans">
              <tr className="h-12 hover:bg-bg/60 transition-colors">
                <td className="py-3 px-4 font-medium text-text">Setup time</td>
                <td className="py-3 px-4 text-center text-muted">Days</td>
                <td className="py-3 px-4 text-center text-muted">Hours</td>
                <td className="py-3 px-4 text-center font-bold text-primary">2 Minutes</td>
              </tr>
              <tr className="h-12 hover:bg-bg/60 transition-colors">
                <td className="py-3 px-4 font-medium text-text">Time per audit</td>
                <td className="py-3 px-4 text-center text-muted">4–8 Hours</td>
                <td className="py-3 px-4 text-center text-muted">30–60 Minutes</td>
                <td className="py-3 px-4 text-center font-bold text-primary">2–5 Minutes</td>
              </tr>
              <tr className="h-12 hover:bg-bg/60 transition-colors">
                <td className="py-3 px-4 font-medium text-text">Needs an expert to read results</td>
                <td className="py-3 px-4 text-center text-muted">Yes</td>
                <td className="py-3 px-4 text-center text-muted">Yes</td>
                <td className="py-3 px-4 text-center font-bold text-primary">No (Plain English)</td>
              </tr>
              <tr className="h-12 hover:bg-bg/60 transition-colors">
                <td className="py-3 px-4 font-medium text-text">Plain-English commands</td>
                <td className="py-3 px-4 text-center text-muted">N/A</td>
                <td className="py-3 px-4 text-center text-muted">No</td>
                <td className="py-3 px-4 text-center font-bold text-primary">Yes (Full Agent)</td>
              </tr>
              <tr className="h-12 hover:bg-bg/60 transition-colors">
                <td className="py-3 px-4 font-medium text-text">Client-ready reports</td>
                <td className="py-3 px-4 text-center text-muted">Manual assembly</td>
                <td className="py-3 px-4 text-center text-muted">Basic templates</td>
                <td className="py-3 px-4 text-center font-bold text-primary">1-Click Verified</td>
              </tr>
              <tr className="h-12 hover:bg-bg/60 transition-colors">
                <td className="py-3 px-4 font-medium text-text">AI search (AEO/GEO) checks</td>
                <td className="py-3 px-4 text-center text-muted">Rarely done</td>
                <td className="py-3 px-4 text-center text-muted">Limited</td>
                <td className="py-3 px-4 text-center font-bold text-primary">Built-In Standard</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 8. FAQ */}
      <section className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold font-head text-text">
            Frequently asked questions about the agent
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-card rounded-md border border-border shadow-xs overflow-hidden"
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

      {/* Date & Final CTA */}
      <div className="text-center text-[11px] font-mono text-muted">
        Last updated: November 1, 2026
      </div>

      <div className="bg-card rounded-lg border border-border p-8 sm:p-12 text-center space-y-6 shadow-pop">
        <div className="max-w-xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold font-head text-text">
            See how it works on your own site
          </h2>
          <p className="text-xs sm:text-sm text-muted">
            Run a complimentary audit in minutes and receive prioritized, verified actions.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10 px-6 bg-primary hover:bg-primary-hover text-white text-xs font-medium rounded-md shadow-xs transition-colors"
          >
            Start free
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/pricing"
            className="w-full sm:w-auto inline-flex items-center justify-center h-10 px-5 bg-card hover:bg-slate-50 border border-border text-xs font-medium text-text rounded-md shadow-xs"
          >
            View pricing plans
          </Link>
        </div>
      </div>
    </div>
  );
}
