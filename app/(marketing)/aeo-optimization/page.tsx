'use client';

import React from 'react';
import Link from 'next/link';
import { HelpCircle, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AeoOptimizationPage() {
  const aeoSignals = [
    'Question-based heading structures (What, Why, How, Best practices)',
    'Direct 40–60 word answer summaries front-loaded in content',
    'FAQPage Schema JSON-LD validation matching visible on-page content',
    'Definition clarity & glossary structure evaluation',
    'List & step formatting for voice and assistant extraction',
    'Content hierarchy and answer completeness checks',
  ];

  return (
    <div className="py-16 sm:py-24 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">Module 03: Direct Answers</span>
        <h1 className="text-3xl sm:text-[48px] font-bold font-head text-text tracking-tight leading-[1.15]">
          Answer Engine Optimization (AEO)
        </h1>
        <p className="text-base text-muted leading-relaxed">
          Structure client pages for featured snippets and conversational voice assistants. Audit Q&A content formatting, concise answer summaries, and schema alignment.
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-6 sm:p-8 shadow-card space-y-6 max-w-4xl mx-auto">
        <h2 className="text-lg font-bold font-head text-text flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          <span>AEO Signals Inspected by RankPilot AI</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aeoSignals.map((signal) => (
            <div key={signal} className="flex items-start gap-2.5 text-xs text-text">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>{signal}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-lg bg-bg border border-border text-xs text-text space-y-2 max-w-4xl mx-auto">
        <h3 className="font-bold font-head text-text flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Truth in Rich Results</span>
        </h3>
        <p className="text-muted leading-relaxed">
          Adding FAQ schema does not guarantee Google will display a rich snippet. RankPilot AI ensures structured data strictly matches visible page text to prevent spam penalties and improve snippet eligibility.
        </p>
      </div>

      <div className="text-center pt-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 h-10 rounded-md bg-primary hover:bg-primary-hover text-white font-medium text-sm shadow-xs transition-colors"
        >
          <span>Check AEO Readiness in Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
