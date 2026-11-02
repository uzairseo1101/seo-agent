import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY || 
  process.env.SUPABASE_PUBLISHABLE_KEY || 
  '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

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
