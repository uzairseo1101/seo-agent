import React from 'react';
import Link from 'next/link';
import { FileText, Printer, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AgencyReportingPage() {
  return (
    <div className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Module 08: Client Communication</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-navy tracking-tight">
          Agency Client Reporting
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-surface-muted leading-relaxed">
          Deliver executive reports that prove your agency&apos;s impact. Showcase verified technical fixes, SEO/GEO/AEO score trajectories, and Search Console growth with zero fluff.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-surface-border p-8 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-navy flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-600" />
          Standard Sections in Every Agency Report
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            Client website & designated reporting period
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            SEO Health, GEO Authority, and AEO Readiness Scores
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            Score trajectories compared to previous audit periods
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            Verified resolved issues (with live recheck timestamps)
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            Active roadmap tasks currently in progress
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            Organic Search Console clicks and impression volume
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            Methodology statements and confidence boundaries
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            Clean print & PDF styling ready for client delivery
          </li>
        </ul>
      </div>

      <div className="text-center">
        <Link
          href="/dashboard/reports"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition-all"
        >
          View Client Reports in Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
