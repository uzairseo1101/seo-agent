'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="py-16 sm:py-24 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="space-y-2 max-w-4xl mx-auto">
        <span className="text-xs font-mono font-medium text-primary uppercase tracking-wider">Legal Agreement</span>
        <h1 className="text-3xl sm:text-[48px] font-bold font-head text-text tracking-tight leading-[1.15]">Terms of Service</h1>
        <p className="text-xs font-mono text-muted">Last updated: November 2026</p>
      </div>

      <div className="bg-card p-8 sm:p-10 rounded-lg border border-border shadow-card space-y-6 text-xs sm:text-sm text-muted leading-relaxed max-w-4xl mx-auto">
        <section className="space-y-2">
          <h2 className="text-base font-bold font-head text-text">1. Acceptance of Terms</h2>
          <p>
            By accessing or using RankPilot AI, you agree to be bound by these Terms of Service. If you are using the service on behalf of an agency or organization, you represent that you have authority to bind that entity to these terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-head text-text">2. Permitted Use & Crawler Boundaries</h2>
          <p>
            You agree only to submit websites and domains that you own, represent, or have authorization to audit. You agree not to use the crawler to target private infrastructure, bypass access controls, or overload external servers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-head text-text">3. Proprietary Diagnostics Disclaimer</h2>
          <p>
            RankPilot AI provides diagnostic analysis, technical suggestions, and search data synchronization. We make no guarantees regarding specific ranking increases, search engine indexation, or AI citation inclusions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-head text-text">4. Limitation of Liability</h2>
          <p>
            RankPilot AI is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis during MVP beta validation. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold font-head text-text">5. Termination</h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate these terms, attempt SSRF exploits, abuse crawler rate limits, or engage in unauthorized activity.
          </p>
        </section>
      </div>
    </div>
  );
}
