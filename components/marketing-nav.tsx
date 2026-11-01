'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Compass, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';

export default function MarketingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-navy flex items-center justify-center text-white shadow-sm">
              <Compass className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-navy tracking-tight leading-none">RankPilot <span className="text-brand-600">AI</span></span>
              <span className="text-[10px] text-surface-muted font-medium tracking-wider uppercase mt-0.5">SEO & Action Platform</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-surface-muted">
            <Link href="/features" className="hover:text-navy transition-colors">Features</Link>
            <Link href="/how-it-works" className="hover:text-navy transition-colors">How It Works</Link>
            <Link href="/seo-website-audit" className="hover:text-navy transition-colors">Audit</Link>
            <Link href="/geo-optimization" className="hover:text-navy transition-colors">GEO</Link>
            <Link href="/aeo-optimization" className="hover:text-navy transition-colors">AEO</Link>
            <Link href="/gsc-intelligence" className="hover:text-navy transition-colors">GSC</Link>
            <Link href="/action-management" className="hover:text-navy transition-colors">Action Center</Link>
            <Link href="/pricing" className="hover:text-navy transition-colors">Pricing</Link>
            <Link href="/trust-and-methodology" className="flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold transition-colors">
              <ShieldCheck className="w-3.5 h-3.5" />
              Trust
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-surface-muted hover:text-navy px-3.5 py-2 rounded-lg transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-lg shadow-sm transition-all hover:shadow"
            >
              Open Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-surface-muted hover:text-navy hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-surface-border bg-white px-4 pt-3 pb-6 space-y-3">
          <Link href="/features" className="block text-sm font-medium py-2 text-surface-text hover:text-brand-600">Features</Link>
          <Link href="/how-it-works" className="block text-sm font-medium py-2 text-surface-text hover:text-brand-600">How It Works</Link>
          <Link href="/seo-website-audit" className="block text-sm font-medium py-2 text-surface-text hover:text-brand-600">SEO Website Audit</Link>
          <Link href="/geo-optimization" className="block text-sm font-medium py-2 text-surface-text hover:text-brand-600">GEO Optimization</Link>
          <Link href="/aeo-optimization" className="block text-sm font-medium py-2 text-surface-text hover:text-brand-600">AEO Optimization</Link>
          <Link href="/gsc-intelligence" className="block text-sm font-medium py-2 text-surface-text hover:text-brand-600">GSC Intelligence</Link>
          <Link href="/seo-opportunity-finder" className="block text-sm font-medium py-2 text-surface-text hover:text-brand-600">SEO Opportunity Finder</Link>
          <Link href="/traffic-drop-analysis" className="block text-sm font-medium py-2 text-surface-text hover:text-brand-600">Traffic Drop Analysis</Link>
          <Link href="/action-management" className="block text-sm font-medium py-2 text-surface-text hover:text-brand-600">SEO Action Management</Link>
          <Link href="/agency-reporting" className="block text-sm font-medium py-2 text-surface-text hover:text-brand-600">Agency Reporting</Link>
          <Link href="/pricing" className="block text-sm font-medium py-2 text-surface-text hover:text-brand-600">Pricing</Link>
          <Link href="/trust-and-methodology" className="block text-sm font-medium py-2 text-brand-600">Trust and Methodology</Link>
          <div className="pt-4 border-t border-surface-border flex flex-col gap-2">
            <Link href="/login" className="text-center text-sm font-medium py-2 rounded-lg border border-surface-border text-surface-text">
              Log in
            </Link>
            <Link href="/dashboard" className="text-center text-sm font-semibold py-2 rounded-lg bg-brand-600 text-white">
              Launch App
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
