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
    <div className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Module 05: Organic Discovery</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-navy tracking-tight">
          SEO Opportunity Finder
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-surface-muted leading-relaxed">
          Stop guessing keywords. RankPilot AI mines your real Google Search Console data to uncover high-ROI striking-distance queries and snippet fixes with measurable traffic upside.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {oppTypes.map((opp) => (
          <div key={opp.title} className="bg-white p-7 rounded-2xl border border-surface-border shadow-sm space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-brand-600 font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-navy">{opp.title}</h3>
            <p className="text-xs text-surface-muted leading-relaxed">{opp.desc}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link
          href="/dashboard/opportunities"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition-all"
        >
          Discover Opportunities in Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
