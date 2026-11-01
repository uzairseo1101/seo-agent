'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'CONNECT',
      desc: 'Register your agency workspace and add monitored client domains. Connect Google Search Console with read-only OAuth 2.0 permissions to pull verified search performance data.',
    },
    {
      num: '02',
      title: 'ANALYZE',
      desc: 'Our safe internal crawler analyzes client websites with anti-SSRF protections, evaluating 30+ technical health standards alongside proprietary GEO (brand entity clarity) and AEO (direct answer readiness) metrics.',
    },
    {
      num: '03',
      title: 'DISCOVER',
      desc: 'The intelligence engine crosses audit findings with Search Console impressions to discover striking-distance keywords (positions 5–20) and high-impression pages suffering from sub-optimal click-through rates.',
    },
    {
      num: '04',
      title: 'PRIORITIZE',
      desc: 'Findings and opportunities are scored by severity, estimated traffic impact, and ease of fix. Transparent priority rules categorize issues as Critical, High, Medium, or Low without arbitrary AI grading.',
    },
    {
      num: '05',
      title: 'NOTIFY',
      desc: 'Your team receives in-app notifications for critical technical breakages, 28-day traffic drops, and newly uncovered high-ROI query opportunities.',
    },
    {
      num: '06',
      title: 'EXECUTE',
      desc: 'Convert findings into Action Center tasks with step-by-step instructions. Assign tasks to team members or copy technical details directly to developers.',
    },
    {
      num: '07',
      title: 'VERIFY',
      desc: 'When an agency marks a task completed, RankPilot AI schedules an automated re-crawl of the affected URL. The system compares before-and-after evidence to confirm whether the issue was actually fixed.',
    },
    {
      num: '08',
      title: 'REPORT',
      desc: 'Generate transparent, agency-branded client reports showcasing verified issue resolutions, historical SEO/GEO/AEO score improvements, and Search Console organic growth.',
    },
  ];

  return (
    <div className="py-16 sm:py-24 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">The 8-Step Operational Engine</span>
        <h1 className="text-3xl sm:text-[48px] font-bold font-head text-text tracking-tight leading-[1.15]">
          How RankPilot AI Powers Agency SEO
        </h1>
        <p className="text-base text-muted leading-relaxed">
          From the initial crawl to verified production fixes and client reports: a systematic, evidence-backed workflow designed to replace spreadsheets.
        </p>
      </div>

      <div className="space-y-4 max-w-4xl mx-auto">
        {steps.map((step) => (
          <div key={step.num} className="bg-card p-6 rounded-lg border border-border shadow-card flex flex-col sm:flex-row items-start gap-5">
            <div className="w-10 h-10 rounded-md bg-primary-tint border border-emerald-200 flex items-center justify-center text-primary font-mono font-bold text-sm shrink-0">
              {step.num}
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold font-head text-text tracking-wide">{step.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 h-10 rounded-md bg-primary hover:bg-primary-hover text-white font-medium text-sm shadow-xs transition-colors"
        >
          <span>Try Workflow in Agency Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
