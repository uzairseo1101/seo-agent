import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY || 
  process.env.SUPABASE_PUBLISHABLE_KEY || 
  '';
const supabaseServiceRoleKey = 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.SUPABASE_SERVICE_KEY || 
  process.env.SUPABASE_SECRET_KEY || 
  process.env.SB_SECRET_KEY || 
  '';

export const isServerSupabaseConfigured = Boolean(
  supabaseUrl && 
  (supabaseServiceRoleKey || supabaseAnonKey) && 
  !supabaseUrl.includes('your-project')
);

/**
 * Creates an administrative Supabase client using the SERVICE_ROLE_KEY (or anon key fallback).
 * NEVER expose this client to the browser.
 */
export function createAdminClient(): SupabaseClient | null {
  const key = supabaseServiceRoleKey || supabaseAnonKey;
  if (!supabaseUrl || !key || supabaseUrl.includes('your-project')) {
    return null;
  }

  return createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Creates a standard server Supabase client using the anon key.
 */
export function createServerClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project')) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
}

/**
 * Returns an appropriate server Supabase client for incoming API requests:
 * 1. If a service role / secret key exists, returns admin client (bypasses RLS).
 * 2. If the request contains an Authorization Bearer header, forward the user token so RLS evaluates the user.
 * 3. Fallback to standard server client.
 */
export function getSupabaseServerClient(req?: NextRequest | Headers | null): SupabaseClient | null {
  if (!supabaseUrl || supabaseUrl.includes('your-project')) {
    return null;
  }

  // 1. If service role key is present, use admin client
  if (supabaseServiceRoleKey) {
    return createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  // 2. Extract Authorization header if provided
  let authHeader: string | null = null;
  if (req) {
    if ('headers' in req && typeof req.headers?.get === 'function') {
      authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    } else if (typeof (req as Headers).get === 'function') {
      authHeader = (req as Headers).get('authorization') || (req as Headers).get('Authorization');
    }
  }

  if (authHeader && supabaseAnonKey) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
      auth: { persistSession: false },
    });
  }

  return createAdminClient() || createServerClient();
}
