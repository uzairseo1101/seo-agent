'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Compass, Lock, ShieldCheck } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      // If Supabase is not configured (offline / local dev mode without credentials), allow access
      if (!isSupabaseConfigured || !supabase) {
        if (mounted) {
          setIsAuthorized(true);
          setIsLoading(false);
        }
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          // Unauthenticated -> redirect to signin
          if (mounted) {
            router.replace(`/signin?redirect=${encodeURIComponent(pathname)}`);
          }
          return;
        }

        // Check Admin privilege if required
        if (requireAdmin) {
          const email = session.user.email || '';
          const isFounderEmail =
            email === 'founder@rankpilot.ai' ||
            email.endsWith('@uzairseo.com') ||
            email.includes('uzairnoor');

          // Query role from profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          const hasAdminRole =
            profile?.role === 'admin' ||
            profile?.role === 'superadmin' ||
            isFounderEmail;

          if (!hasAdminRole) {
            // Standard client user trying to access /admin -> redirect to user dashboard
            if (mounted) {
              router.replace('/dashboard');
            }
            return;
          }
        }

        if (mounted) {
          setIsAuthorized(true);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        if (mounted) {
          router.replace(`/signin?redirect=${encodeURIComponent(pathname)}`);
        }
      }
    };

    checkAuth();

    // Listen for auth state transitions (e.g. user signs out in another tab)
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.replace(`/signin?redirect=${encodeURIComponent(pathname)}`);
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, [pathname, requireAdmin, router]);

  // Loading Screen while verifying session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
        <div className="bg-card rounded-lg border border-border p-8 shadow-card flex flex-col items-center space-y-4 max-w-sm w-full text-center">
          <div className="w-12 h-12 rounded-md bg-primary flex items-center justify-center text-white shadow-xs animate-pulse">
            <Compass className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-head text-text">RankPilot AI Security</h2>
            <p className="text-xs text-muted mt-1 font-mono">
              Verifying session and security permissions...
            </p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-2/3 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Not authorized (redirecting)
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
