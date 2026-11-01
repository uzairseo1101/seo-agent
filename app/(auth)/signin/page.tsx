'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('founder@rankpilot.ai');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSupabaseConfigured && supabase) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
      }
      // Successful authentication -> redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <>
      {/* Exclude auth pages from search engine index */}
      <head>
        <meta name="robots" content="noindex, follow" />
      </head>

      <div className="min-h-screen bg-bg flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl bg-card rounded-lg border border-border shadow-pop overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          {/* Left Column: Form */}
          <div className="p-6 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <Link href="/" className="inline-flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white shadow-xs">
                  <Compass className="w-4.5 h-4.5" />
                </div>
                <span className="font-head font-bold text-xl text-text tracking-tight">
                  RankPilot <span className="text-primary font-semibold">AI</span>
                </span>
              </Link>

              <div>
                <h1 className="text-xl sm:text-2xl font-bold font-head text-text">Sign in to your account</h1>
                <p className="text-xs text-muted mt-1">
                  Enter your credentials to access your agency dashboard and audits.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-error flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-text">
                      Password
                    </label>
                    <Link href="/forgot-password" className="text-xs text-accent hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-xs px-3 pr-10 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Single Primary CTA */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-medium rounded-md shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Google Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="w-full h-10 px-4 bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-text border border-border text-xs font-medium rounded-md shadow-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.76-2.1-6.71-4.94H1.26v3.15C3.25 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.29 14.26c-.25-.72-.38-1.49-.38-2.26s.13-1.54.38-2.26V6.59H1.26C.46 8.18 0 9.99 0 12s.46 3.82 1.26 5.41l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.26 6.59l4.03 3.15c.95-2.84 3.59-4.99 6.71-4.99z"
                    />
                  </svg>
                  Continue with Google
                </button>
              </div>
            </div>

            <p className="text-xs text-muted text-center pt-4">
              Don't have an account?{' '}
              <Link href="/signup" className="text-accent font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          {/* Right Column: Benefits + Dashboard Mockup */}
          <div className="hidden lg:flex flex-col justify-between bg-bg/70 p-8 border-l border-border space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider">
                RankPilot AI Workspace
              </span>
              <h2 className="text-xl font-bold font-head text-text">
                Autonomous SEO intelligence for high-performing teams
              </h2>
              <ul className="space-y-2.5 text-xs text-muted">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Free plan available, no credit card required</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>First full-site audit ready in minutes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Automated re-crawl fix verification</span>
                </li>
              </ul>
            </div>

            {/* Small Dashboard Visual Mockup */}
            <div className="bg-card rounded-md border border-border p-4 shadow-card space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-border">
                <span className="font-semibold text-text">Primary Domain Overview</span>
                <span className="font-mono text-primary text-[10px] bg-primary-tint px-2 py-0.5 rounded-full">
                  84/100 SEO Score
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                <div className="p-2 rounded-sm bg-bg border border-border">
                  <span className="text-[10px] text-muted block">Tasks Verified</span>
                  <span className="font-bold text-text">12 Done</span>
                </div>
                <div className="p-2 rounded-sm bg-bg border border-border">
                  <span className="text-[10px] text-muted block">GSC Clicks</span>
                  <span className="font-bold text-accent">+24.6%</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-muted flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Read-only safe Google Search Console integration</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
