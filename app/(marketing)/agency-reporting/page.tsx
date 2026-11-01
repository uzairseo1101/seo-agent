'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Printer, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AgencyReportingPage() {
  return (
    <div className="py-16 sm:py-24 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">Module 08: Client Communication</span>
        <h1 className="text-3xl sm:text-[48px] font-bold font-head text-text tracking-tight leading-[1.15]">
          Agency Client Reporting
        </h1>
        <p className="text-base text-muted leading-relaxed">
          Deliver executive reports that prove your agency&apos;s impact. Showcase verified technical fixes, SEO/GEO/AEO score trajectories, and Search Console growth with zero fluff.
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-6 sm:p-8 shadow-card space-y-6 max-w-4xl mx-auto">
        <h2 className="text-lg font-bold font-head text-text flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <span>Standard Sections in Every Agency Report</span>
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-text">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            Client website & designated reporting period
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            SEO Health, GEO Authority, and AEO Readiness Scores
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            Score trajectories compared to previous audit periods
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            Verified resolved issues (with live recheck timestamps)
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            Active roadmap tasks currently in progress
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            Organic Search Console clicks and impression volume
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            Methodology statements and confidence boundaries
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            Clean print & PDF styling ready for client delivery
          </li>
        </ul>
      </div>

      <div className="text-center pt-2">
        <Link
          href="/dashboard/reports"
          className="inline-flex items-center gap-2 px-6 h-10 rounded-md bg-primary hover:bg-primary-hover text-white font-medium text-sm shadow-xs transition-colors"
        >
          <span>View Client Reports in Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
