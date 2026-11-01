'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Compass, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center text-white shadow-sm">
            <Compass className="w-6 h-6 text-indigo-400" />
          </div>
          <span className="font-extrabold text-2xl text-navy tracking-tight">RankPilot <span className="text-brand-600">AI</span></span>
        </Link>
        <h2 className="text-xl font-bold text-navy">Reset your password</h2>
        <p className="mt-1 text-xs text-surface-muted">
          Enter your registered email address to receive password reset instructions
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-2xl border border-surface-border shadow-sm">
          {submitted ? (
            <div className="text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-navy">Check your inbox</h3>
              <p className="text-xs text-surface-muted leading-relaxed">
                If an account exists for <span className="font-semibold text-navy">{email}</span>, you will receive password reset instructions.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-brand-600 hover:underline flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-navy block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@agency.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-surface-border outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
              >
                Send Reset Link
              </button>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="text-xs font-medium text-surface-muted hover:text-navy flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
