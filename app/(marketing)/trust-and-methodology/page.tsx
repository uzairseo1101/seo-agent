import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, AlertCircle, FileCode2, Database, ArrowRight } from 'lucide-react';

export default function TrustAndMethodologyPage() {
  return (
    <div className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Integrity & Standards</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-navy tracking-tight">
          Trust & Methodology Framework
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-surface-muted leading-relaxed">
          How RankPilot AI collects data, audits web properties, evaluates search opportunities, and preserves client security.
        </p>
      </div>

      <div className="space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-surface-border shadow-sm text-xs sm:text-sm text-surface-muted leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-navy flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-brand-600" />
            1. Safe Crawler Mechanics & SSRF Protection
          </h2>
          <p>
            RankPilot AI uses an in-house lightweight crawler built on safe Node.js fetch and Cheerio DOM parsing. Our crawler enforces:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-700">
            <li>Strict URL validation (HTTP/HTTPS schemes only; standard ports 80 and 443).</li>
            <li>DNS pre-resolution IP checking: blocks loopbacks (127.0.0.1, ::1), private RFC-1918 ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16), and cloud metadata services (169.254.169.254).</li>
            <li>Robots.txt compliance and conservative request throttling (500ms delay between requests).</li>
            <li>Conservative sample caps (25 pages per audit in development mode, depth limit of 2).</li>
          </ul>
        </section>

        <section className="space-y-3 pt-6 border-t border-surface-border">
          <h2 className="text-base font-bold text-navy flex items-center gap-2">
            <Database className="w-5 h-5 text-brand-600" />
            2. Proprietary Scoring Disclosures (SEO, GEO, AEO)
          </h2>
          <p>
            Our health scores are calculated using transparent formulas:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-700">
            <li><strong>SEO Score (0–100):</strong> Evaluates verified technical health, crawlability, canonical compliance, metadata lengths, and heading hierarchy.</li>
            <li><strong>GEO Score (0–100):</strong> Evaluates brand entity presence, author credential markup (Schema.org Person), and structured transparency. It is not an official search engine ranking factor.</li>
            <li><strong>AEO Score (0–100):</strong> Evaluates direct Q&A formatting and concise answer summaries for conversational assistants.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-6 border-t border-surface-border">
          <h2 className="text-base font-bold text-navy flex items-center gap-2">
            <Lock className="w-5 h-5 text-brand-600" />
            3. Read-Only AI Guardrails & Prompt Injection Protection
          </h2>
          <p>
            The RankPilot AI orchestrator is strictly read-only. It cannot modify client websites, edit live CMS databases, or alter robots.txt. Webpage HTML is treated strictly as untrusted data, preventing prompt injection attacks from overriding system logic.
          </p>
        </section>

        <section className="space-y-3 pt-6 border-t border-surface-border">
          <h2 className="text-base font-bold text-navy flex items-center gap-2">
            <Eye className="w-5 h-5 text-brand-600" />
            4. Multi-Tenant Data Isolation (Row Level Security)
          </h2>
          <p>
            Every database query is strictly scoped to your agency&apos;s organization ID via PostgreSQL Row Level Security (RLS). Users from one agency can never access, view, or modify data from another agency.
          </p>
        </section>
      </div>

      <div className="text-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition-all"
        >
          Explore the Trust Center in Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
