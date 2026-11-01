'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function SeoOpportunityFinderPage() {
  const oppTypes = [
    {
      title: 'Striking Distance Queries (Positions 5–20)',
      desc: 'Target queries that Google already ranks on the cusp of page 1. With focused internal links and title refinements, these queries can rapidly move into the top 3.',
    },
    {
      title: 'High Impressions with Sub-Optimal CTR',
      desc: 'Identify URLs that receive thousands of impressions but fail to capture clicks. These represent prime opportunities for SERP snippet rewrites.',
    },
    {
      title: 'Declining CTR on Historic Winners',
      desc: 'Flag URLs whose click-through rates have slipped over 28-day intervals due to competitor changes or SERP layout shifts.',
    },
    {
      title: 'High-Volume Query Clusters',
      desc: 'Group related queries that indicate an opportunity to expand existing content or create dedicated supporting cluster pages.',
    },
  ];

  return (
    <div className="py-16 sm:py-24 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">Module 05: Organic Discovery</span>
        <h1 className="text-3xl sm:text-[48px] font-bold font-head text-text tracking-tight leading-[1.15]">
          SEO Opportunity Finder
        </h1>
        <p className="text-base text-muted leading-relaxed">
          Stop guessing keywords. RankPilot AI mines your real Google Search Console data to uncover high-ROI striking-distance queries and snippet fixes with measurable traffic upside.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {oppTypes.map((opp) => (
          <div key={opp.title} className="bg-card p-6 rounded-lg border border-border shadow-card space-y-3 hover:-translate-y-0.5 transition-transform duration-200">
            <div className="w-8 h-8 rounded-md bg-primary-tint border border-emerald-200 flex items-center justify-center text-primary font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold font-head text-text">{opp.title}</h3>
            <p className="text-xs text-muted leading-relaxed">{opp.desc}</p>
          </div>
        ))}
      </div>

      <div className="text-center pt-2">
        <Link
          href="/dashboard/opportunities"
          className="inline-flex items-center gap-2 px-6 h-10 rounded-md bg-primary hover:bg-primary-hover text-white font-medium text-sm shadow-xs transition-colors"
        >
          <span>Discover Opportunities in Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
