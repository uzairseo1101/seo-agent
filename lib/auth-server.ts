// RankPilot AI - Authoritative Server-Side Authentication & Tenant Isolation Helper
// Resolves authenticated user identity and active workspace organization

import { NextRequest } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, OrganizationRole } from '@/lib/types';
import { isValidUuid } from '@/lib/utils';

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
  '';

export interface ServerAuthContext {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: 'user' | 'admin' | 'superadmin';
  } | null;
  organizationId: string | null;
  orgRole: OrganizationRole | null;
  isAdmin: boolean;
  rawToken: string | null;
}

/**
 * Creates an administrative Supabase client that can perform privileged operations.
 * Only returns a client if SUPABASE_SERVICE_ROLE_KEY is configured.
 */
export function getAdminSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseServiceRoleKey || supabaseUrl.includes('your-project')) {
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Extracts the raw JWT token from Authorization header or cookie.
 */
export function extractAuthToken(req?: NextRequest | Headers | null): string | null {
  if (!req) return null;

  // 1. Try Authorization header
  let authHeader: string | null = null;
  if ('headers' in req && typeof req.headers?.get === 'function') {
    authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  } else if (typeof (req as Headers).get === 'function') {
    authHeader = (req as Headers).get('authorization') || (req as Headers).get('Authorization');
  }

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // 2. Try Supabase Auth Cookie (sb-<project-ref>-auth-token)
  if ('cookies' in req && typeof (req as any).cookies?.get === 'function') {
    const allCookies = (req as NextRequest).cookies.getAll();
    const sbCookie = allCookies.find(c => c.name.includes('-auth-token'));
    if (sbCookie) {
      try {
        const parsed = JSON.parse(sbCookie.value);
        if (Array.isArray(parsed) && parsed[0]) return parsed[0];
        if (parsed.access_token) return parsed.access_token;
      } catch {
        return sbCookie.value;
      }
    }
  }

  return null;
}

/**
 * Authoritatively resolves the currently authenticated user and their organization.
 * Never trusts client-supplied user or organization IDs.
 */
export async function getServerAuthContext(req?: NextRequest | Headers | null): Promise<ServerAuthContext> {
  const token = extractAuthToken(req);
  const unauthenticated: ServerAuthContext = {
    user: null,
    organizationId: null,
    orgRole: null,
    isAdmin: false,
    rawToken: null,
  };

  if (!token || !supabaseUrl || !supabaseAnonKey) {
    return unauthenticated;
  }

  const authVerifier = getAdminSupabase() || (supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } }) : null);
  if (!authVerifier) {
    return unauthenticated;
  }

  try {
    // 1. Cryptographically verify the JWT token with Supabase Auth
    const { data: { user: authUser }, error: userError } = await authVerifier.auth.getUser(token);
    if (userError || !authUser?.id) {
      return unauthenticated;
    }

    const userId = authUser.id;
    const email = authUser.email || '';
    const fullName = authUser.user_metadata?.full_name || email.split('@')[0] || 'User';

    // 2. Query public.profiles using adminClient (service role) or client with user's JWT
    const isFounder = email === 'uzairnoor1101@gmail.com' ||
                      email.includes('uzairnoor') ||
                      email === 'founder@rankpilot.ai' ||
                      email.endsWith('@uzairseo.com');

    let role: 'user' | 'admin' | 'superadmin' = isFounder ? 'superadmin' : 'user';

    const dbClient = getAdminSupabase() || createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    });

    const { data: profile } = await dbClient
      .from('profiles')
      .select('role, full_name')
      .eq('id', userId)
      .maybeSingle();

    if (profile?.role) {
      role = profile.role as any;
    } else {
      // Lazily create profile if missing
      await dbClient.from('profiles').upsert({
        id: userId,
        email,
        full_name: fullName,
        role,
        updated_at: new Date().toISOString(),
      });
    }

    if (isFounder) {
      role = 'superadmin';
    }

    const isAdmin = role === 'admin' || role === 'superadmin';

    // 3. Resolve user's workspace from memberships
    let organizationId: string | null = null;
    let orgRole: OrganizationRole | null = null;

    const { data: membership } = await dbClient
      .from('memberships')
      .select('organization_id, role')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    if (membership?.organization_id && isValidUuid(membership.organization_id)) {
      organizationId = membership.organization_id;
      orgRole = membership.role as OrganizationRole;
    } else {
      // 4. Lazily create personal workspace for this user if no membership exists
      // If founder, link to initial agency organization if it exists
      if (email === 'uzairnoor1101@gmail.com') {
        const { data: initialOrg } = await dbClient
          .from('organizations')
          .select('id')
          .eq('id', '2fff7e42-627e-4582-8982-aa8463bf9fca')
          .maybeSingle();

        if (initialOrg?.id) {
          organizationId = initialOrg.id;
          orgRole = 'owner';
          await dbClient.from('memberships').insert({
            organization_id: organizationId,
            user_id: userId,
            role: 'owner',
          });
        }
      }

      if (!organizationId) {
        // Create completely fresh personal organization
        const newOrgId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '00000000-0000-0000-0000-000000000001';
        const orgName = `${fullName}'s Workspace`;
        const slug = `org-${newOrgId.substring(0, 8)}`;

        const { data: createdOrg } = await dbClient
          .from('organizations')
          .insert({
            id: newOrgId,
            name: orgName,
            slug,
            plan: 'free',
            max_websites: 1,
            max_crawled_pages_per_audit: 10,
          })
          .select('id')
          .single();

        organizationId = createdOrg?.id || newOrgId;
        orgRole = 'owner';

        await dbClient.from('memberships').insert({
          organization_id: organizationId,
          user_id: userId,
          role: 'owner',
        });

        // Initialize Free subscription & entitlements
        await dbClient.from('subscriptions').insert({
          organization_id: organizationId,
          provider: 'free',
          plan: 'free',
          billing_cycle: 'monthly',
          status: 'active',
        });

        await dbClient.from('subscription_entitlements').insert({
          organization_id: organizationId,
          plan: 'free',
          max_websites: 1,
          max_crawled_pages: 10,
          max_saved_reports: 3,
          history_retention_days: 14,
          has_gsc_sync: false,
          has_striking_distance: false,
          has_traffic_drop_engine: false,
          has_keyword_clustering: false,
          has_team_seats: false,
          has_api_access: false,
          has_white_label_reports: false,
        });
      }
    }

    return {
      user: {
        id: userId,
        email,
        fullName: profile?.full_name || fullName,
        role,
      },
      organizationId,
      orgRole,
      isAdmin,
      rawToken: token,
    };
  } catch (err) {
    console.warn('Error in getServerAuthContext:', err);
    return unauthenticated;
  }
}
