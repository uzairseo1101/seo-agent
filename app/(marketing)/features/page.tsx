'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  TrendingUp,
  FileText,
  Layers,
  BarChart3,
  Sparkles,
  Bot,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Check,
  ExternalLink
} from 'lucide-react';
import { BreadcrumbsJsonLd, SoftwareAppJsonLd, FaqJsonLd } from '@/components/seo/json-ld';

export default function FeaturesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    {
      id: 'audits',
      title: 'AI Site Audits',
      summary: 'Deep technical audits covering speed, links, indexing, and meta tags.',
      bullets: [
        'Crawls up to 500 pages per audit pass with SSRF-safe protections.',
        'Calculates transparent mathematical deductions with zero hallucinations.',
        'Maps every issue to the exact URL and line of defective HTML code.',
      ],
      howItWorks: 'The agent requests your live pages, computes technical deductions, and organizes findings by severity.',
    },
    {
      id: 'keywords',
      title: 'Keyword Research and Clustering',
      summary: 'Find high-intent keyword groups and striking-distance ranking targets.',
      bullets: [
        'Direct Google Search Console sync isolates positions 5 to 20.',
        'Filters queries with high impressions but below-average CTR.',
        'Clusters related search terms by user intent and topical entities.',
      ],
      howItWorks: 'The agent analyzes historical GSC performance to uncover queries closest to page-one breakthrough.',
    },
    {
      id: 'content',
      title: 'Content Briefs and Writing Assistant',
      summary: 'Structured briefs designed for search engines and answer engines alike.',
      bullets: [
        'Generates comprehensive H1-H3 outlines based on top-ranking SERPs.',
        'Identifies missing entities, question headings, and semantic keywords.',
        'Recommends strategic internal link targets across your existing URLs.',
      ],
      howItWorks: 'The agent evaluates top competitor structures and drafts detailed briefs ready for your copywriters.',
    },
    {
      id: 'competitor',
      title: 'Competitor Analysis',
      summary: 'Uncover keyword gaps, missing pages, and backlink opportunities.',
      bullets: [
        'Detects keywords where competitors outrank you on high-value terms.',
        'Compares technical health and schema implementations side-by-side.',
        'Pinpoints unaddressed subtopics to capture incremental organic traffic.',
      ],
      howItWorks: 'The agent compares your domain against rival sites to highlight actionable market opportunities.',
    },
    {
      id: 'rank-tracking',
      title: 'Rank Tracking',
      summary: 'Accurate ranking trajectories powered by verified search console data.',
      bullets: [
        'Tracks daily click and impression trends without scraping proxies.',
        'Monitors average position changes across primary target keywords.',
        'Triggers automated alerts when critical URLs experience traffic drops.',
      ],
      howItWorks: 'The agent synchronizes real GSC performance metrics and flags significant SERP movements.',
    },
    {
      id: 'aeo-geo',
      title: 'AI Search Readiness: AEO and GEO Checks',
      summary: 'Optimize your content for citations by ChatGPT, Perplexity, and Google AI Overviews.',
      bullets: [
        'Inspects schema validity: FAQPage, Article, Organization, and HowTo.',
        'Checks for direct, concise 40-60 word answers beneath question headings.',
        'Evaluates entity clarity so AI models can cite your brand authoritatively.',
      ],
      howItWorks: 'The agent parses your content against Generative Engine Optimization best practices and scores citation readiness.',
    },
    {
      id: 'reports',
      title: 'Client Reports',
      summary: 'White-label, executive PDF reports delivered in a single click.',
      bullets: [
        'Showcases verified improvements with before-and-after re-crawl proof.',
        'Customizable with your agency logo, primary color tokens, and notes.',
        'Clean, non-technical executive summaries designed for business owners.',
      ],
      howItWorks: 'The agent aggregates completed action items and GSC metrics into a printable, professional report.',
    },
    {
      id: 'agent-chat',
      title: 'Agent Chat',
      summary: 'Direct natural-language command interface for custom SEO operations.',
      bullets: [
        'Execute complex workflows by typing simple plain-English instructions.',
        'Provides step-by-step reasoning and transparent execution logs.',
        'Never modifies live code without your explicit review and sign-off.',
      ],
      howItWorks: 'The agent interprets your goals, coordinates crawler and database operations, and drafts ready solutions.',
    },
  ];

  const faqs = [
    {
      q: 'Can I run audits on client websites without adding tracking scripts?',
      a: 'Yes. Our crawler is completely non-intrusive. It fetches public HTML just like a search engine bot, requiring zero code snippets, tracking pixels, or CMS plugins.',
    },
    {
      q: 'How does the agent verify that an SEO fix was implemented correctly?',
      a: 'When you mark a task completed, the agent triggers an automated targeted re-crawl of the exact affected URL, checking if the required tags, schemas, or headings are present in the live DOM.',
    },
    {
      q: 'Does RankPilot AI support multi-language websites?',
      a: 'Yes. The crawler detects hreflang tags, UTF-8 charsets, and language metadata, enabling technical audits and keyword analysis across international client websites.',
    },
    {
      q: 'What makes your AEO and GEO checks different from traditional SEO?',
      a: 'Traditional SEO checks keyword frequency and backlinks. Our AEO and GEO analyzers check entity disambiguation, Schema.org graph integrity, and answer-first sentence structure required by generative search engines.',
    },
    {
      q: 'Can I export raw data for custom agency spreadsheets?',
      a: 'Yes. In addition to branded PDF reports, all audit findings, keyword matrices, and action items can be exported in structured CSV and JSON formats.',
    },
  ];

  return (
    <div className="py-12 sm:py-20 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
      <BreadcrumbsJsonLd
        items={[
          { name: 'Home', url: 'https://rankpilot.ai' },
          { name: 'Features', url: 'https://rankpilot.ai/features' },
        ]}
      />
      <SoftwareAppJsonLd />
      <FaqJsonLd faqs={faqs} />
      {/* 1. HERO */}
      <section className="text-center space-y-5 max-w-3xl mx-auto">
        <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
          Complete SEO Toolset
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold font-head text-text tracking-tight leading-[1.15]">
          AI SEO agent features built for real SEO work
        </h1>

        {/* Answer-First Intro (40-60 words) */}
        <p className="text-base text-muted max-w-2xl mx-auto leading-relaxed">
          RankPilot AI is an autonomous SEO agent built for freelancers and agencies. It crawls websites, monitors Google Search Console data, prioritizes high-impact technical fixes, and verifies client improvements automatically. Explore how it works in our{' '}
          <Link href="/how-it-works" className="text-accent underline font-medium">
            step-by-step walkthrough
          </Link>.
        </p>

        <div className="pt-2">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 h-10 px-6 bg-primary hover:bg-primary-hover text-white text-xs font-medium rounded-md shadow-xs transition-colors"
          >
            Start free
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 2. 8 ALTERNATING ROWS */}
      <section className="space-y-16">
        {features.map((feature, idx) => {
          const isReversed = idx % 2 === 1;
          return (
            <div
              key={feature.id}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                isReversed ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className={`space-y-4 ${isReversed ? 'lg:order-2' : ''}`}>
                <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-primary">
                  <span>Feature 0{idx + 1}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-head text-text">
                  {feature.title}
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                  {feature.summary}
                </p>

                <ul className="space-y-2.5 text-xs text-muted pt-1">
                  {feature.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2.5">
                      <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span className="text-text">{bullet}</span>
                    </li>
                  ))}
                </ul>

                <div className="p-3 rounded-md bg-card border border-border text-xs text-muted">
                  <strong className="text-text">How it works:</strong> {feature.howItWorks}
                </div>
              </div>

              {/* Visual Mockup Card */}
              <div className={`bg-card rounded-lg border border-border p-6 shadow-card space-y-3 ${
                isReversed ? 'lg:order-1' : ''
              }`}>
                <div className="flex items-center justify-between pb-3 border-b border-border text-xs">
                  <span className="font-bold text-text font-head flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    {feature.title} Preview
                  </span>
                  <span className="font-mono text-[10px] text-primary bg-primary-tint px-2 py-0.5 rounded-full border border-emerald-200">
                    Live System
                  </span>
                </div>

                <div className="p-4 rounded-md bg-bg border border-border space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-text">Automated Analysis Pass</span>
                    <span className="font-mono text-[11px] text-accent">Active</span>
                  </div>
                  <p className="text-muted text-[11px]">
                    Continuous background evaluation ensuring optimal indexation, content depth, and answer-engine readiness.
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. MINI HOW THE AGENT WORKS (3 Steps) */}
      <section className="bg-bg py-12 rounded-lg border border-border p-6 sm:p-8 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">
            Quick Overview
          </span>
          <h2 className="text-2xl font-bold font-head text-text">
            How the agent works in 3 steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-2">
            <span className="font-mono font-bold text-primary text-xl">1</span>
            <h3 className="text-sm font-bold font-head text-text">Ask or connect</h3>
            <p className="text-xs text-muted">Enter a domain or ask a task in plain English.</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-2">
            <span className="font-mono font-bold text-accent text-xl">2</span>
            <h3 className="text-sm font-bold font-head text-text">Agent analyzes & acts</h3>
            <p className="text-xs text-muted">The agent crawls pages, queries GSC, and drafts fixes.</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-5 shadow-card space-y-2">
            <span className="font-mono font-bold text-primary text-xl">3</span>
            <h3 className="text-sm font-bold font-head text-text">Verify & share</h3>
            <p className="text-xs text-muted">Approve changes, confirm fixes with re-crawls, and export reports.</p>
          </div>
        </div>
      </section>

      {/* 4. COMPARISON: MANUAL VS RANKPILOT */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl font-bold font-head text-text">
            Doing SEO manually vs. with RankPilot AI
          </h2>
          <p className="text-xs text-muted">Compare time commitments, operational costs, and client delivery consistency.</p>
        </div>

        <div className="bg-card rounded-lg border border-border shadow-card overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-border">
              <tr className="h-12 text-[11px] font-mono text-muted uppercase">
                <th className="py-3 px-4 font-semibold">Metric</th>
                <th className="py-3 px-4 font-semibold text-center">Doing SEO Manually</th>
                <th className="py-3 px-4 font-semibold text-center text-primary">With RankPilot AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-sans">
              <tr className="h-12 hover:bg-bg/60 transition-colors">
                <td className="py-3 px-4 font-medium text-text">Time Spent per Client Monthly</td>
                <td className="py-3 px-4 text-center text-muted">15–25 Hours</td>
                <td className="py-3 px-4 text-center font-bold text-primary">2–3 Hours</td>
              </tr>
              <tr className="h-12 hover:bg-bg/60 transition-colors">
                <td className="py-3 px-4 font-medium text-text">Monthly Software Tool Stack Cost</td>
                <td className="py-3 px-4 text-center text-muted">$400–$800 / month</td>
                <td className="py-3 px-4 text-center font-bold text-primary">From $49 / month</td>
              </tr>
              <tr className="h-12 hover:bg-bg/60 transition-colors">
                <td className="py-3 px-4 font-medium text-text">Audit Execution Speed</td>
                <td className="py-3 px-4 text-center text-muted">Several hours to days</td>
                <td className="py-3 px-4 text-center font-bold text-primary">2–5 Minutes</td>
              </tr>
              <tr className="h-12 hover:bg-bg/60 transition-colors">
                <td className="py-3 px-4 font-medium text-text">Fix Verification Certainty</td>
                <td className="py-3 px-4 text-center text-muted">Manual re-checking prone to oversight</td>
                <td className="py-3 px-4 text-center font-bold text-primary">100% Automated Re-Crawl Proof</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. INTEGRATIONS ROW */}
      <section className="bg-card border border-border rounded-lg p-6 text-center space-y-4 shadow-xs">
        <span className="text-xs font-mono font-medium text-muted uppercase tracking-wider">
          Connected Ecosystem
        </span>
        <h3 className="text-base font-bold font-head text-text">
          Seamless connections with your core search stack
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-muted">
          <span className="px-3 py-1.5 rounded-md border border-border bg-bg text-text font-medium">Google Search Console (OAuth 2.0)</span>
          <span className="px-3 py-1.5 rounded-md border border-border bg-bg">[confirm] Google Analytics 4 (GA4)</span>
          <span className="px-3 py-1.5 rounded-md border border-border bg-bg">[confirm] WordPress & Webflow Webhooks</span>
        </div>
      </section>

      {/* 6. FEATURES FAQ */}
      <section className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold font-head text-text">
            Features FAQ
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
            Put RankPilot AI to work on your websites
          </h2>
          <p className="text-xs sm:text-sm text-muted">
            Start free, explore all 8 core features, and generate your first verified client report today.
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
    </div>
  );
}
