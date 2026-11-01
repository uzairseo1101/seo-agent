'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, ShieldCheck } from 'lucide-react';

export default function MarketingFooter() {
  return (
    <footer className="bg-card border-t border-border text-muted transition-colors">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Definition Column */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white shadow-xs">
                <Compass className="w-4.5 h-4.5" />
              </div>
              <span className="font-head font-bold text-lg text-text tracking-tight">
                RankPilot <span className="text-primary font-semibold">AI</span>
              </span>
            </Link>
            <p className="text-sm text-muted max-w-sm leading-relaxed">
              RankPilot AI is an AI SEO agent that audits websites, discovers striking-distance keyword opportunities, and verifies technical fixes automatically.
            </p>
            {/* About Block with placeholder */}
            <div className="p-3.5 rounded-md bg-bg border border-border text-xs text-muted max-w-sm space-y-1">
              <p className="font-semibold text-text">About RankPilot AI</p>
              <p className="leading-relaxed">
                Built for SEO freelancers, digital agencies, and in-house teams. [ADD REAL INFO: Company background, headquarters location, and team mission].
              </p>
            </div>
          </div>

          {/* Navigation Links Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-text uppercase tracking-wider font-head">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/how-it-works" className="hover:text-text transition-colors">How it works</Link></li>
              <li><Link href="/features" className="hover:text-text transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-text transition-colors">Pricing</Link></li>
              <li><Link href="/signin" className="hover:text-text transition-colors">Sign in</Link></li>
              <li><Link href="/signup" className="hover:text-text transition-colors">Sign up</Link></li>
            </ul>
          </div>

          {/* Legal & Contact Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-text uppercase tracking-wider font-head">Trust & Contact</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/privacy" className="hover:text-text transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-text transition-colors">Terms of Service</Link></li>
              <li className="pt-2 text-xs">
                <span className="block text-muted">Support:</span>
                <a href="mailto:support@rankpilot.ai" className="text-accent hover:underline">
                  support@rankpilot.ai
                </a>
              </li>
              <li>
                <div className="flex items-center gap-1.5 text-xs text-primary font-medium mt-1">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Read-only safe integrations</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted gap-4">
          <p>© {new Date().getFullYear()} RankPilot AI. All rights reserved.</p>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span className="tnum">Clean Rank v1.0</span>
            <span className="text-border">|</span>
            <span className="text-primary">WCAG AA Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
