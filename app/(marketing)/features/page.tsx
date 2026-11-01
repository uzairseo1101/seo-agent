import React from 'react';
import Link from 'next/link';
import {
  FileSearch,
  Search,
  CheckSquare,
  Sparkles,
  TrendingDown,
  FileText,
  ShieldCheck,
  Bell,
  ArrowRight
} from 'lucide-react';

export default function FeaturesPage() {
  const featureList = [
    {
      title: 'Safe Technical SEO Auditor',
      desc: 'In-house Cheerio/Fetch crawler engineered with anti-SSRF protection. Checks 30+ technical standards including titles, meta tags, H1/H2 hierarchy, canonical consistency, robots.txt, sitemaps, and status codes.',
      icon: FileSearch,
      href: '/seo-website-audit',
    },
    {
      title: 'GEO (Generative Engine Optimization)',
      desc: 'Assess entity clarity, author expertise credentials, Schema.org Person markup, and source transparency required for modern AI citation models.',
      icon: Sparkles,
      href: '/geo-optimization',
    },
    {
      title: 'AEO (Answer Engine Optimization)',
      desc: 'Evaluate direct-answer completeness, concise 40–60 word answer summaries, and FAQPage structured data readiness for conversational search agents.',
      icon: Sparkles,
      href: '/aeo-optimization',
    },
    {
      title: 'Google Search Console Intelligence',
      desc: 'Direct read-only OAuth 2.0 synchronization. Ingest clicks, impressions, CTR, and average positions with historical comparison intervals.',
      icon: Search,
      href: '/gsc-intelligence',
    },
    {
      title: 'SEO Opportunity Discovery',
      desc: 'Pinpoint queries ranking in striking distance (positions 5–20) with high impressions and sub-optimal click-through rates for quick organic wins.',
      icon: Sparkles,
      href: '/seo-opportunity-finder',
    },
    {
      title: 'Traffic Drop Investigator',
      desc: 'Analyze 28-day vs previous 28-day performance to diagnose page-level and query-level organic drops with deterministic percentage calculations.',
      icon: TrendingDown,
      href: '/traffic-drop-analysis',
    },
    {
      title: 'Action Center & Task Verification',
      desc: 'Connect every audit finding and GSC opportunity to an actionable agency task. When marked completed, automated re-crawls verify whether the fix succeeded.',
      icon: CheckSquare,
      href: '/action-management',
    },
    {
      title: 'Agency Client Reporting',
      desc: 'Generate executive-ready client visibility reports showing audit scores, resolved critical issues, open roadmaps, and verified Search Console growth.',
      icon: FileText,
      href: '/agency-reporting',
    },
    {
      title: 'Trust & Accuracy Engine',
      desc: 'Every finding contains verifiable HTML/HTTP evidence. Transparent scoring formulas, zero AI hallucinations, and full methodology documentation.',
      icon: ShieldCheck,
      href: '/trust-and-methodology',
    },
  ];

  return (
    <div className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Platform Capabilities</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-navy tracking-tight">
          Every tool your agency needs to turn SEO findings into verified results
        </h1>
        <p className="text-sm sm:text-base text-surface-muted leading-relaxed">
          Explore the modular architecture of RankPilot AI designed specifically for digital marketing teams managing multiple client websites.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featureList.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="bg-white p-7 rounded-2xl border border-surface-border shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-brand-600 mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-navy">{f.title}</h3>
                <p className="text-xs text-surface-muted leading-relaxed mt-2">{f.desc}</p>
              </div>
              <Link href={f.href} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 pt-2">
                Learn more <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
