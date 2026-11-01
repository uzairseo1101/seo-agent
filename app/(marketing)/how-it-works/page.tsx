import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

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
    <div className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600">The 8-Step Operational Engine</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-navy tracking-tight">
          How RankPilot AI Powers Agency SEO Operations
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-surface-muted leading-relaxed">
          From the initial crawl to verified production fixes and client reports: a systematic, evidence-backed workflow designed to replace spreadsheets.
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((step) => (
          <div key={step.num} className="bg-white p-6 sm:p-8 rounded-2xl border border-surface-border shadow-sm flex flex-col sm:flex-row items-start gap-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-brand-600 font-extrabold text-base shrink-0">
              {step.num}
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-navy tracking-wide">{step.title}</h3>
              <p className="text-xs sm:text-sm text-surface-muted leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition-all"
        >
          Try the Workflow in Agency Dashboard
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
