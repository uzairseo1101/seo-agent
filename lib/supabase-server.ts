import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

export const isServerSupabaseConfigured = Boolean(
  supabaseUrl && 
  (supabaseServiceRoleKey || supabaseAnonKey) && 
  !supabaseUrl.includes('your-project')
);

/**
 * Creates an administrative Supabase client using the SERVICE_ROLE_KEY.
 * Bypasses RLS for admin operations, background sync, and system triggers.
 * NEVER expose this client to the browser.
 */
export function createAdminClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseServiceRoleKey || supabaseUrl.includes('your-project')) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
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
