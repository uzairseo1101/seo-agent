import React from 'react';
import Link from 'next/link';
import { Compass, ShieldCheck } from 'lucide-react';

export default function MarketingFooter() {
  return (
    <footer className="bg-navy text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                <Compass className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">RankPilot <span className="text-brand-400">AI</span></span>
            </Link>
            <p className="mt-4 text-sm text-slate-400 max-w-sm leading-relaxed">
              Connect your website. Discover SEO, GEO and AEO opportunities. Prioritize evidence-backed actions, monitor GSC performance, and verify fixes automatically.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-slate-400 bg-white/5 border border-white/10 rounded-lg p-2.5 max-w-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Evidence-Backed SaaS: No fabricated metrics, no hallucinated SEO scores, 100% transparent scoring.</span>
            </div>
          </div>

          {/* Solutions Column */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Core Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/seo-website-audit" className="hover:text-white transition-colors">SEO Website Audit</Link></li>
              <li><Link href="/geo-optimization" className="hover:text-white transition-colors">GEO Optimization</Link></li>
              <li><Link href="/aeo-optimization" className="hover:text-white transition-colors">AEO Optimization</Link></li>
              <li><Link href="/gsc-intelligence" className="hover:text-white transition-colors">GSC Intelligence</Link></li>
              <li><Link href="/seo-opportunity-finder" className="hover:text-white transition-colors">Opportunity Finder</Link></li>
            </ul>
          </div>

          {/* Workflow Column */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Workflows</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/traffic-drop-analysis" className="hover:text-white transition-colors">Traffic Drop Analysis</Link></li>
              <li><Link href="/action-management" className="hover:text-white transition-colors">SEO Action Management</Link></li>
              <li><Link href="/agency-reporting" className="hover:text-white transition-colors">Agency Reporting</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing & Plans</Link></li>
            </ul>
          </div>

          {/* Trust & Legal Column */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Trust & Compliance</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/trust-and-methodology" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Trust & Methodology</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Agency Login</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Create Account</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} RankPilot AI. Built for modern SEO agencies. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Read-Only Safe Architecture
            </span>
            <span>Zero Uncontrolled AI Hallucination</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
