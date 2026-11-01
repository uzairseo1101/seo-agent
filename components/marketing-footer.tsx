'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, ShieldCheck } from 'lucide-react';

export default function MarketingFooter() {
  return (
    <footer className="bg-card border-t border-border text-muted transition-colors">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white">
                <Compass className="w-4.5 h-4.5" />
              </div>
              <span className="font-head font-bold text-lg text-text tracking-tight">
                RankPilot <span className="text-primary font-semibold">AI</span>
              </span>
            </Link>
            <p className="mt-3.5 text-sm text-muted max-w-sm leading-relaxed">
              Connect your website. Discover SEO, GEO and AEO opportunities. Prioritize evidence-backed actions, monitor GSC performance, and verify fixes automatically.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs text-muted bg-bg border border-border rounded-md p-2.5 max-w-sm">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>Evidence-Backed SaaS: No fabricated metrics, no hallucinated SEO scores, 100% transparent scoring.</span>
            </div>
          </div>

          {/* Solutions Column */}
          <div>
            <h4 className="text-xs font-semibold text-text uppercase tracking-wider mb-3.5 font-head">Core Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/seo-website-audit" className="hover:text-text transition-colors">SEO Website Audit</Link></li>
              <li><Link href="/geo-optimization" className="hover:text-text transition-colors">GEO Optimization</Link></li>
              <li><Link href="/aeo-optimization" className="hover:text-text transition-colors">AEO Optimization</Link></li>
              <li><Link href="/gsc-intelligence" className="hover:text-text transition-colors">GSC Intelligence</Link></li>
              <li><Link href="/seo-opportunity-finder" className="hover:text-text transition-colors">Opportunity Finder</Link></li>
            </ul>
          </div>

          {/* Workflow Column */}
          <div>
            <h4 className="text-xs font-semibold text-text uppercase tracking-wider mb-3.5 font-head">Workflows</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/traffic-drop-analysis" className="hover:text-text transition-colors">Traffic Drop Analysis</Link></li>
              <li><Link href="/action-management" className="hover:text-text transition-colors">SEO Action Management</Link></li>
              <li><Link href="/agency-reporting" className="hover:text-text transition-colors">Agency Reporting</Link></li>
              <li><Link href="/how-it-works" className="hover:text-text transition-colors">How It Works</Link></li>
              <li><Link href="/pricing" className="hover:text-text transition-colors">Pricing & Plans</Link></li>
            </ul>
          </div>

          {/* Trust & Legal Column */}
          <div>
            <h4 className="text-xs font-semibold text-text uppercase tracking-wider mb-3.5 font-head">Trust & Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/trust-and-methodology" className="text-accent hover:text-accent/80 font-medium transition-colors">Trust & Methodology</Link></li>
              <li><Link href="/privacy" className="hover:text-text transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-text transition-colors">Terms of Service</Link></li>
              <li><Link href="/login" className="hover:text-text transition-colors">Agency Sign In</Link></li>
              <li><Link href="/register" className="hover:text-text transition-colors">Create Account</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted gap-4">
          <p>© {new Date().getFullYear()} RankPilot AI. Clean Rank Design System. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-primary font-medium">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Read-Only Safe Architecture
            </span>
            <span className="font-mono text-[11px]">tnum v1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
