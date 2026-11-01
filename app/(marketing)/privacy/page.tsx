import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Privacy & Data Protection</span>
        <h1 className="text-3xl font-extrabold text-navy tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-surface-muted">Last updated: November 2026</p>
      </div>

      <div className="bg-white p-8 sm:p-10 rounded-2xl border border-surface-border shadow-sm space-y-6 text-xs sm:text-sm text-surface-muted leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-navy">1. Information We Collect</h2>
          <p>
            RankPilot AI collects only the minimum necessary information to provide SEO intelligence services: account registration details (email, agency name), user-submitted client website URLs, and authorized Google Search Console metrics (clicks, impressions, query texts, average positions) retrieved via read-only OAuth 2.0.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-navy">2. How We Use Data</h2>
          <p>
            Data is used strictly to crawl public HTML pages, calculate audit scores, identify search ranking opportunities, and generate client reports. We do not sell your client data, and we never share Search Console metrics with third parties or competitors.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-navy">3. AI Data Usage Policy</h2>
          <p>
            When utilizing Google Gemini or AI analysis modules, only sanitized, minimum necessary evidence snippets are transmitted. We never send passwords, API secrets, OAuth tokens, or sensitive personal identity data to external AI models.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-navy">4. Data Retention & Deletion</h2>
          <p>
            When an agency deletes a website or deletes their account, all historical crawl records, audit findings, Search Console sync records, and Action Center tasks associated with that property are permanently deleted from our database.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-navy">5. Contact Us</h2>
          <p>
            For privacy inquiries or data removal requests, contact our privacy officer at <span className="font-semibold text-navy">privacy@rankpilot.ai</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
