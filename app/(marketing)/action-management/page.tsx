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
    <div className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Module 07: Execution & Verification</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-navy tracking-tight">
          SEO Action Center & Verification
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-surface-muted leading-relaxed">
          The heart of RankPilot AI. Bridge the gap between finding SEO issues and getting them resolved and verified in production.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((s) => (
          <div key={s.title} className="bg-white p-7 rounded-2xl border border-surface-border shadow-sm space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-navy">{s.title}</h3>
            <p className="text-xs text-surface-muted leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link
          href="/dashboard/action-center"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition-all"
        >
          Open Action Center in Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
