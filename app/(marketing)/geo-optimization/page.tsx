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
    <div className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Module 02: AI Citations</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-navy tracking-tight">
          Generative Engine Optimization (GEO)
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-surface-muted leading-relaxed">
          Prepare client content for AI search engines like ChatGPT Search, Perplexity, and Google AI Overviews by auditing brand entity clarity, author authority, and source transparency.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-surface-border p-8 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-navy flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-600" />
          GEO Factors Evaluated by RankPilot AI
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {geoSignals.map((signal) => (
            <div key={signal} className="flex items-start gap-2.5 text-xs text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{signal}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 space-y-2">
        <h3 className="font-bold text-navy flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          Honest Methodology Disclosure
        </h3>
        <p className="leading-relaxed">
          RankPilot AI does not claim proprietary access to undisclosed LLM algorithms, nor do we guarantee AI citations. Our GEO Score (0–100) is a proprietary evaluation of structured entity completeness, transparent authorship, and factual machine-readability.
        </p>
      </div>

      <div className="text-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition-all"
        >
          Audit Client GEO Readiness <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
