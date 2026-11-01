import React from 'react';
import Link from 'next/link';
import { Compass, ArrowRight, Home, HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex flex-col justify-between text-text">
      <header className="h-16 border-b border-border bg-card flex items-center px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white shadow-xs">
            <Compass className="w-4.5 h-4.5" />
          </div>
          <span className="font-head font-bold text-lg text-text tracking-tight">
            RankPilot <span className="text-primary font-semibold">AI</span>
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-5 bg-card p-8 rounded-lg border border-border shadow-pop">
          <span className="text-5xl font-mono font-bold text-primary block">
            404
          </span>
          <h1 className="text-2xl font-bold font-head text-text">
            Page not found
          </h1>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            The SEO page or action tool you are looking for has been moved or does not exist.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto h-10 px-5 bg-primary hover:bg-primary-hover text-white text-xs font-medium rounded-md shadow-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Back to home</span>
            </Link>
            <Link
              href="/how-it-works"
              className="w-full sm:w-auto h-10 px-4 bg-card hover:bg-slate-50 border border-border text-xs font-medium text-text rounded-md shadow-xs flex items-center justify-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-muted" />
              <span>How it works</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="h-14 border-t border-border bg-card flex items-center justify-center text-xs text-muted">
        <p>© {new Date().getFullYear()} RankPilot AI. Clean Rank Design System.</p>
      </footer>
    </div>
  );
}
