'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Menu, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MarketingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'How it works', href: '/how-it-works' },
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
  ];

  return (
    <>
      {/* Skip to Content for WCAG AA Keyboard Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:shadow-pop"
      >
        Skip to main content
      </a>

      <header
        className={cn(
          'sticky top-0 z-50 bg-card/95 backdrop-blur-md transition-all duration-200',
          isScrolled ? 'border-b border-border shadow-xs' : 'border-b border-transparent'
        )}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-md">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white shadow-xs">
                <Compass className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-head font-bold text-lg text-text tracking-tight leading-none">
                  RankPilot <span className="text-primary font-semibold">AI</span>
                </span>
                <span className="text-[10px] text-muted font-medium tracking-wider uppercase mt-0.5">
                  AI SEO Agent
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-7 text-sm font-medium" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      'transition-colors py-1',
                      isActive
                        ? 'text-primary font-semibold border-b-2 border-primary'
                        : 'text-muted hover:text-text'
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* CTAs: Sign in (ghost), Start free (single green primary button) */}
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/signin"
                className="text-sm font-medium text-muted hover:text-text px-3.5 h-10 inline-flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-white bg-primary hover:bg-primary-hover px-4 h-10 rounded-md shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              >
                <span>Start free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-muted hover:text-text hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-card px-4 pt-3 pb-6 space-y-3 animate-in fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'block text-sm font-medium py-2',
                  pathname === link.href ? 'text-primary font-semibold' : 'text-muted hover:text-text'
                )}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <Link
                href="/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-xs font-medium h-10 flex items-center justify-center rounded-md border border-border text-text bg-card hover:bg-slate-50"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-xs font-medium h-10 flex items-center justify-center rounded-md bg-primary hover:bg-primary-hover text-white shadow-xs"
              >
                Start free
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
