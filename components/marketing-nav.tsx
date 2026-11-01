'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Compass, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';

export default function MarketingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border transition-colors">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white shadow-xs">
              <Compass className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-head font-bold text-lg text-text tracking-tight leading-none">
                RankPilot <span className="text-primary font-semibold">AI</span>
              </span>
              <span className="text-[10px] text-muted font-medium tracking-wider uppercase mt-0.5">
                SEO & Action Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-muted">
            <Link href="/features" className="hover:text-text transition-colors">Features</Link>
            <Link href="/how-it-works" className="hover:text-text transition-colors">How It Works</Link>
            <Link href="/seo-website-audit" className="hover:text-text transition-colors">Audits</Link>
            <Link href="/geo-optimization" className="hover:text-text transition-colors">GEO</Link>
            <Link href="/aeo-optimization" className="hover:text-text transition-colors">AEO</Link>
            <Link href="/gsc-intelligence" className="hover:text-text transition-colors">GSC</Link>
            <Link href="/action-management" className="hover:text-text transition-colors">Tasks</Link>
            <Link href="/pricing" className="hover:text-text transition-colors">Pricing</Link>
            <Link href="/trust-and-methodology" className="flex items-center gap-1 text-accent hover:text-accent/80 font-medium transition-colors">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Trust</span>
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted hover:text-text px-3.5 h-10 inline-flex items-center justify-center rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover px-4 h-10 rounded-md shadow-xs transition-colors"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-muted hover:text-text hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-card px-4 pt-3 pb-6 space-y-2">
          <Link href="/features" className="block text-sm font-medium py-1.5 text-text hover:text-primary">Features</Link>
          <Link href="/how-it-works" className="block text-sm font-medium py-1.5 text-text hover:text-primary">How It Works</Link>
          <Link href="/seo-website-audit" className="block text-sm font-medium py-1.5 text-text hover:text-primary">SEO Website Audit</Link>
          <Link href="/geo-optimization" className="block text-sm font-medium py-1.5 text-text hover:text-primary">GEO Optimization</Link>
          <Link href="/aeo-optimization" className="block text-sm font-medium py-1.5 text-text hover:text-primary">AEO Optimization</Link>
          <Link href="/gsc-intelligence" className="block text-sm font-medium py-1.5 text-text hover:text-primary">GSC Intelligence</Link>
          <Link href="/action-management" className="block text-sm font-medium py-1.5 text-text hover:text-primary">Action Center</Link>
          <Link href="/pricing" className="block text-sm font-medium py-1.5 text-text hover:text-primary">Pricing</Link>
          <Link href="/trust-and-methodology" className="block text-sm font-medium py-1.5 text-accent">Trust & Methodology</Link>
          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <Link href="/login" className="text-center text-sm font-medium h-10 flex items-center justify-center rounded-md border border-border text-text bg-card hover:bg-slate-50">
              Sign In
            </Link>
            <Link href="/dashboard" className="text-center text-sm font-medium h-10 flex items-center justify-center rounded-md bg-primary hover:bg-primary-hover text-white shadow-xs">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
