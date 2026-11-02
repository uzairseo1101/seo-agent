'use client';

import React, { useState, useEffect } from 'react';
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
  Mail,
  Loader2
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendStatus, setResendStatus] = useState('');

  // Handle resend countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isSupabaseConfigured && supabase) {
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://seoagent.uzairseo.com';
        const redirectUrl = `${origin}/auth/callback?next=/onboarding/plan-selection`;

        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
            emailRedirectTo: redirectUrl,
          },
        });

        if (authError) throw authError;

        // If email confirmation is required, session is null until confirmed
        if (data?.user && !data?.session) {
          setConfirmationSent(true);
          setResendCooldown(60);
          setLoading(false);
          return;
        }
      }

      // If already confirmed or local mode, proceed to plan selection
      router.push('/onboarding/plan-selection');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details and try again.');
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || !email) return;
    setResendStatus('Resending verification email...');
    try {
      if (supabase) {
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://seoagent.uzairseo.com';
        const { error: resendErr } = await supabase.auth.resend({
          type: 'signup',
          email: email.trim(),
          options: {
            emailRedirectTo: `${origin}/auth/callback?next=/onboarding/plan-selection`,
          },
        });
        if (resendErr) throw resendErr;
        setResendStatus('Verification email resent! Please check your inbox.');
        setResendCooldown(60);
      }
    } catch (err: any) {
      setResendStatus(err.message || 'Failed to resend verification email.');
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');
    try {
      if (isSupabaseConfigured && supabase) {
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://seoagent.uzairseo.com';
        const { error: googleError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${origin}/auth/callback?next=/onboarding/plan-selection`,
          },
        });
        if (googleError) throw googleError;
      } else {
        router.push('/onboarding/plan-selection');
      }
    } catch (err: any) {
      setError(err.message || 'Google sign-up encountered an issue.');
      setLoading(false);
    }
  };

  return (
    <>
      <head>
        <meta name="robots" content="noindex, follow" />
      </head>

      <div className="min-h-screen bg-bg flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl bg-card rounded-xl border border-border shadow-pop overflow-hidden grid grid-cols-1 lg:grid-cols-2">
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
                <h1 className="text-xl sm:text-2xl font-bold font-head text-text">Create your account</h1>
                <p className="text-xs text-muted mt-1">
                  Start auditing websites, identifying ranking opportunities, and verifying fixes.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-error flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {confirmationSent ? (
                <div className="space-y-5 py-6 text-center animate-in fade-in">
                  <div className="w-14 h-14 rounded-full bg-primary-tint text-primary flex items-center justify-center mx-auto border border-emerald-200">
                    <Mail className="w-7 h-7" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg font-bold font-head text-text">Confirm your email address</h2>
                    <p className="text-xs text-muted leading-relaxed max-w-sm mx-auto">
                      We have sent a confirmation email to <strong className="text-text">{email}</strong>.
                    </p>
                    <p className="text-xs text-muted leading-relaxed max-w-sm mx-auto">
                      Click the secure link in the email to verify your address and choose your plan.
                    </p>
                  </div>

                  {resendStatus && (
                    <p className="text-[11px] text-primary font-medium">{resendStatus}</p>
                  )}

                  <div className="pt-2 flex flex-col gap-2 max-w-sm mx-auto">
                    <button
                      type="button"
                      disabled={resendCooldown > 0}
                      onClick={handleResendVerification}
                      className="w-full h-10 px-4 bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-text border border-border text-xs font-semibold rounded-md shadow-xs transition-colors disabled:opacity-50"
                    >
                      {resendCooldown > 0 ? `Resend email in ${resendCooldown}s` : 'Resend confirmation email'}
                    </button>

                    <Link
                      href="/signin"
                      className="w-full h-10 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Already confirmed? Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {/* Registration Form */}
                  <form onSubmit={handleRegister} className="space-y-3.5">
                    <div>
                      <label className="text-xs font-semibold text-text block mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Jane Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full text-xs px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-text block mb-1">
                        Work Email
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="jane@agency.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full text-xs px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-text block mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="At least 8 characters"
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

                    <div>
                      <label className="text-xs font-semibold text-text block mb-1">
                        Confirm Password
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full text-xs px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>

                    {/* Terms Checkbox */}
                    <div className="flex items-start gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={agreedTerms}
                        onChange={(e) => setAgreedTerms(e.target.checked)}
                        className="mt-0.5 rounded-sm border-border text-primary focus:ring-primary/20"
                      />
                      <label htmlFor="terms" className="text-[11px] text-muted leading-tight">
                        I agree to the{' '}
                        <Link href="/terms" className="text-accent underline">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-accent underline">
                          Privacy Policy
                        </Link>.
                      </label>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-10 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Creating account...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Account</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Google Button */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleGoogleSignUp}
                      disabled={loading}
                      className="w-full h-10 px-4 bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-text border border-border text-xs font-medium rounded-md shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
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
                      <span>Continue with Google</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted">
              <span>Already have an account?</span>
              <Link href="/signin" className="text-accent hover:underline font-semibold">
                Sign in →
              </Link>
            </div>
          </div>

          {/* Right Column: High-Value Features & Social Proof */}
          <div className="bg-slate-50 dark:bg-slate-900/40 p-6 sm:p-10 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-border">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
                  The SEO Action Engine
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-head text-text mt-1.5">
                  Audit, prioritize, and verify SEO fixes with precision
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-md bg-primary-tint text-primary flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-text">Multi-Dimensional SEO Scoring</h3>
                    <p className="text-[11px] text-muted mt-0.5">
                      Combines Technical SEO, Generative Engine (GEO), and Answer Engine (AEO) readiness in one comprehensive audit.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-md bg-primary-tint text-primary flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-text">GSC Striking Distance Discovery</h3>
                    <p className="text-[11px] text-muted mt-0.5">
                      Automatically surfaces keywords ranking in positions 11–20 with high impression volume ready for rapid traffic gains.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-md bg-primary-tint text-primary flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-text">Closed-Loop Verification Engine</h3>
                    <p className="text-[11px] text-muted mt-0.5">
                      Re-crawls affected URLs after developer fixes and confirms issue resolution with verifiable before/after evidence.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border/80 flex items-center gap-2 text-xs text-muted">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>Safe multi-tenant architecture with Row-Level Security</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
