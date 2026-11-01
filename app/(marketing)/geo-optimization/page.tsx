'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function GeoOptimizationPage() {
  const geoSignals = [
    'Organization & Brand entity clarity in structured data',
    'Verified author identification (Schema.org Person markup)',
    'External credential links (sameAs citations to LinkedIn, Wikidata, Google Scholar)',
    'Factual claim verification & reference attribution signals',
    'Machine-readable content structure for LLM ingestion',
    'Transparent About Us and editorial policy disclosures',
  ];

  return (
    <div className="py-16 sm:py-24 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">Module 02: AI Citations</span>
        <h1 className="text-3xl sm:text-[48px] font-bold font-head text-text tracking-tight leading-[1.15]">
          Generative Engine Optimization (GEO)
        </h1>
        <p className="text-base text-muted leading-relaxed">
          Prepare client content for AI search engines like ChatGPT Search, Perplexity, and Google AI Overviews by auditing brand entity clarity, author authority, and source transparency.
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-6 sm:p-8 shadow-card space-y-6 max-w-4xl mx-auto">
        <h2 className="text-lg font-bold font-head text-text flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span>GEO Factors Evaluated by RankPilot AI</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {geoSignals.map((signal) => (
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
          <span>Honest Methodology Disclosure</span>
        </h3>
        <p className="text-muted leading-relaxed">
          RankPilot AI does not claim proprietary access to undisclosed LLM algorithms, nor do we guarantee AI citations. Our GEO Score (0–100) is a proprietary evaluation of structured entity completeness, transparent authorship, and factual machine-readability.
        </p>
      </div>

      <div className="text-center pt-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 h-10 rounded-md bg-primary hover:bg-primary-hover text-white font-medium text-sm shadow-xs transition-colors"
        >
          <span>Audit Client GEO Readiness</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
