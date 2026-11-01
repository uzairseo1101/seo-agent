'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Compass, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSupabaseConfigured && supabase) {
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              agency_name: agencyName,
            },
          },
        });
        if (authError) throw authError;
      }
      // Instant development redirect
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      setLoading(false);
    }
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
        <h2 className="text-xl font-bold font-head text-text">Create your Agency Workspace</h2>
        <p className="mt-1 text-xs text-muted">
          Complimentary pilot access • No credit card required
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-card py-8 px-6 sm:px-8 rounded-lg border border-border shadow-pop">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-error flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-text block mb-1">Your Full Name</label>
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
              <label className="text-xs font-semibold text-text block mb-1">Agency Name</label>
              <input
                type="text"
                required
                placeholder="Apex Digital Marketing"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full text-xs px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text block mb-1">Work Email</label>
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
              <label className="text-xs font-semibold text-text block mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 h-10 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-medium rounded-md shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Creating Workspace...' : 'Launch Free Agency Pilot'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border text-center text-xs text-muted">
            Already have an account?{' '}
            <Link href="/login" className="text-accent hover:underline font-medium">
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-muted flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>PostgreSQL Multi-Tenant Row Level Security Active</span>
        </div>
      </div>
    </div>
  );
}
