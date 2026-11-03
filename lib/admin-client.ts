import { supabase } from '@/lib/supabase';

/**
 * Client-side fetch wrapper for Admin API routes.
 * Automatically attaches the active session's Bearer token so the backend
 * can cryptographically verify admin credentials and apply PostgreSQL RLS bypass.
 */
export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let accessToken: string | null = null;

  if (supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        accessToken = session.access_token;
      }
    } catch (e) {
      // Ignore session retrieval error
    }
  }

  const headers = new Headers(options.headers || {});
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
