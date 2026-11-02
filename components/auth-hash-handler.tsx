'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function AuthHashHandler() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');

      if (accessToken && supabase) {
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        }).then(({ data, error }) => {
          if (!error && data.session) {
            // Remove hash from URL to keep address bar clean
            window.history.replaceState(null, '', window.location.pathname);

            if (type === 'recovery') {
              router.push('/dashboard/settings');
            } else if (type === 'signup') {
              router.push('/onboarding/plan-selection');
            } else {
              router.push('/dashboard');
            }
          }
        });
      }
    }
  }, [router]);

  return null;
}
