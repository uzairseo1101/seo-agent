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
    <div className="min-h-screen bg-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center text-white shadow-xs">
            <Compass className="w-5 h-5" />
          </div>
          <span className="font-head font-bold text-2xl text-text tracking-tight">
            RankPilot <span className="text-primary font-semibold">AI</span>
          </span>
        </Link>
        <h2 className="text-xl font-bold font-head text-text">Reset your password</h2>
        <p className="mt-1 text-xs text-muted">
          Enter your registered email address to receive password reset instructions
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-card py-8 px-6 sm:px-8 rounded-lg border border-border shadow-pop">
          {submitted ? (
            <div className="text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-primary-tint text-primary flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold font-head text-text">Check your inbox</h3>
              <p className="text-xs text-muted leading-relaxed">
                If an account exists for <span className="font-semibold text-text">{email}</span>, you will receive password reset instructions.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="text-xs font-medium text-accent hover:underline flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@agency.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full h-10 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-medium rounded-md shadow-xs transition-colors"
              >
                Send Reset Link
              </button>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="text-xs font-medium text-muted hover:text-text flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
