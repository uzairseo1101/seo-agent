'use client';

import React from 'react';
import Link from 'next/link';
import { CheckSquare, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ActionManagementPage() {
  const steps = [
    {
      title: 'Automated Task Creation',
      desc: 'Technical audit findings and GSC opportunities convert directly into manageable tasks with full URL citations, reasons, and instructions.',
    },
    {
      title: 'Evidence-Based Prioritization',
      desc: 'Every task is scored as Critical, High, Medium, or Low based on verified severity and traffic potential — not arbitrary urgency.',
    },
    {
      title: 'Agency Collaboration Workflow',
      desc: 'Track tasks through To Do, In Progress, Completed, or Dismissed statuses with custom agency notes and due dates.',
    },
    {
      title: 'Automated Re-Crawl Verification',
      desc: 'Once marked complete, our crawler rechecks the URL. If the issue is fixed, it becomes "Completed — Verified". If not, it is flagged as "Still Unresolved".',
    },
  ];

  return (
    <div className="py-16 sm:py-24 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">Module 07: Execution & Verification</span>
        <h1 className="text-3xl sm:text-[48px] font-bold font-head text-text tracking-tight leading-[1.15]">
          SEO Action Center & Verification
        </h1>
        <p className="text-base text-muted leading-relaxed">
          The heart of RankPilot AI. Bridge the gap between finding SEO issues and getting them resolved and verified in production.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {steps.map((s) => (
          <div key={s.title} className="bg-card p-6 rounded-lg border border-border shadow-card space-y-3 hover:-translate-y-0.5 transition-transform duration-200">
            <div className="w-8 h-8 rounded-md bg-primary-tint border border-emerald-200 text-primary flex items-center justify-center font-bold">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold font-head text-text">{s.title}</h3>
            <p className="text-xs text-muted leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="text-center pt-2">
        <Link
          href="/dashboard/action-center"
          className="inline-flex items-center gap-2 px-6 h-10 rounded-md bg-primary hover:bg-primary-hover text-white font-medium text-sm shadow-xs transition-colors"
        >
          <span>Open Action Center in Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
