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
    <div className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Module 03: Direct Answers</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-navy tracking-tight">
          Answer Engine Optimization (AEO)
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-surface-muted leading-relaxed">
          Structure client pages for featured snippets and conversational voice assistants. Audit Q&A content formatting, concise answer summaries, and schema alignment.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-surface-border p-8 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-navy flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-brand-600" />
          AEO Signals Inspected by RankPilot AI
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aeoSignals.map((signal) => (
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
          Truth in Rich Results
        </h3>
        <p className="leading-relaxed">
          Adding FAQ schema does not guarantee Google will display a rich snippet. RankPilot AI ensures structured data strictly matches visible page text to prevent spam penalties and improve snippet eligibility.
        </p>
      </div>

      <div className="text-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition-all"
        >
          Check AEO Readiness in Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
