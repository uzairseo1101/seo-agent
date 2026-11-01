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
    <div className="min-h-screen bg-surface-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center text-white shadow-sm">
            <Compass className="w-6 h-6 text-indigo-400" />
          </div>
          <span className="font-extrabold text-2xl text-navy tracking-tight">RankPilot <span className="text-brand-600">AI</span></span>
        </Link>
        <h2 className="text-xl font-bold text-navy">Create your Agency Workspace</h2>
        <p className="mt-1 text-xs text-surface-muted">
          14-day free trial on Agency Plan • No credit card required
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-2xl border border-surface-border shadow-sm">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-navy block mb-1">Your Full Name</label>
              <input
                type="text"
                required
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-surface-border outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-navy block mb-1">Agency Name</label>
              <input
                type="text"
                required
                placeholder="Apex Digital Marketing"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-surface-border outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-navy block mb-1">Work Email</label>
              <input
                type="email"
                required
                placeholder="jane@agency.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-surface-border outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-navy block mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-surface-border outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Setting up Workspace...' : 'Create Agency Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-surface-border text-center text-xs text-surface-muted">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-brand-600 hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
