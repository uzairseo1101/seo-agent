// RankPilot AI - Central Server-Side Entitlement & Subscription Engine
// Strictly enforces subscription plan limits across all API endpoints

import { getSupabaseServerClient, createAdminClient, createServerClient } from '@/lib/supabase-server';
import { PLAN_LIMITS_MAP, PlanId } from '@/lib/pricing-config';
import { PlanTier, SubscriptionEntitlements } from '@/lib/types';
import { storage } from '@/lib/storage';

export interface EntitlementValidationResult {
  allowed: boolean;
  feature: string;
  plan: PlanTier;
  limit: number | boolean;
  currentCount?: number;
  error?: string;
  upgradePrompt?: string;
}

/**
 * Returns static fallback limits for a given plan tier
 */
export function getPlanLimits(plan: PlanTier) {
  const normalizedPlan: PlanId = (
    plan === 'freelancer' || plan === 'solo' ? 'freelancer' :
    plan === 'agency' ? 'agency' :
    plan === 'team' || plan === 'enterprise' ? 'team' : 'free'
  );
  return PLAN_LIMITS_MAP[normalizedPlan] || PLAN_LIMITS_MAP.free;
}

/**
 * Retrieves the effective entitlements for an organization:
 * 1. Queries Supabase `subscription_entitlements` table.
 * 2. If table doesn't exist or record missing, queries `organizations.plan`.
 * 3. Falls back to Free tier limits if no organization is found.
 */
export async function getOrganizationEntitlements(organizationId?: string | null): Promise<SubscriptionEntitlements> {
  const defaultFree: SubscriptionEntitlements = {
    id: 'default-free',
    organizationId: organizationId || 'default',
    plan: 'free',
    ...PLAN_LIMITS_MAP.free,
  };

  if (!organizationId) {
    return defaultFree;
  }

  const client = getSupabaseServerClient() || createAdminClient() || createServerClient();
  if (client) {
    try {
      // 1. Try querying dedicated subscription_entitlements table
      const { data: entData, error: entError } = await client
        .from('subscription_entitlements')
        .select('*')
        .eq('organization_id', organizationId)
        .maybeSingle();

      if (!entError && entData) {
        return {
          id: entData.id,
          organizationId: entData.organization_id,
          plan: entData.plan as PlanTier,
          maxWebsites: entData.max_websites,
          maxCrawledPages: entData.max_crawled_pages,
          maxSavedReports: entData.max_saved_reports,
          historyRetentionDays: entData.history_retention_days,
          hasGscSync: entData.has_gsc_sync,
          hasStrikingDistance: entData.has_striking_distance,
          hasTrafficDropEngine: entData.has_traffic_drop_engine,
          hasKeywordClustering: entData.has_keyword_clustering,
          hasTeamSeats: entData.has_team_seats,
          hasApiAccess: entData.has_api_access,
          hasWhiteLabelReports: entData.has_white_label_reports,
        };
      }

      // 2. Fallback to querying public.organizations.plan
      const { data: orgData } = await client
        .from('organizations')
        .select('plan')
        .eq('id', organizationId)
        .maybeSingle();

      if (orgData?.plan) {
        const limits = getPlanLimits(orgData.plan as PlanTier);
        return {
          id: `org-plan-${organizationId}`,
          organizationId,
          plan: orgData.plan as PlanTier,
          ...limits,
        };
      }
    } catch (err) {
      console.warn('Entitlements resolution error, falling back to limits map:', err);
    }
  }

  return defaultFree;
}

/**
 * Central Server-Side Entitlement Validator
 * Enforces tier restrictions for website additions, crawl runs, and advanced tools.
 */
export async function validateEntitlement(
  organizationId: string | null | undefined,
  feature: 'websites' | 'crawled_pages' | 'gsc_sync' | 'striking_distance' | 'traffic_drop' | 'keyword_clustering' | 'white_label',
  requestedCount?: number
): Promise<EntitlementValidationResult> {
  const entitlements = await getOrganizationEntitlements(organizationId);
  const plan = entitlements.plan;

  switch (feature) {
    case 'websites': {
      // Count current active websites for the organization
      let currentCount = 0;
      const client = getSupabaseServerClient() || createAdminClient() || createServerClient();
      if (client && organizationId) {
        try {
          const { count, error } = await client
            .from('websites')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', organizationId)
            .neq('status', 'archived');
          if (!error && typeof count === 'number') {
            currentCount = count;
          }
        } catch {
          currentCount = storage.getWebsites().length;
        }
      } else {
        currentCount = storage.getWebsites().length;
      }

      const limit = entitlements.maxWebsites;
      const willExceed = currentCount >= limit;

      if (willExceed) {
        return {
          allowed: false,
          feature: 'websites',
          plan,
          limit,
          currentCount,
          error: `Website limit reached (${currentCount}/${limit} websites on the ${plan.toUpperCase()} plan).`,
          upgradePrompt: plan === 'free' 
            ? 'Upgrade to Freelancer ($39/mo) to monitor up to 3 client websites.'
            : plan === 'freelancer'
            ? 'Upgrade to Agency ($99/mo) to monitor up to 15 client websites.'
            : 'Upgrade to Team ($149/mo) to monitor up to 50 client websites.',
        };
      }

      return {
        allowed: true,
        feature: 'websites',
        plan,
        limit,
        currentCount,
      };
    }

    case 'crawled_pages': {
      const requested = requestedCount || 10;
      const limit = entitlements.maxCrawledPages;

      if (requested > limit) {
        return {
          allowed: false,
          feature: 'crawled_pages',
          plan,
          limit,
          currentCount: requested,
          error: `Audit crawl limit exceeded. Your ${plan.toUpperCase()} plan allows a maximum of ${limit} crawled pages per audit.`,
          upgradePrompt: plan === 'free'
            ? 'Upgrade to Freelancer ($39/mo) for 25 crawled pages per audit.'
            : plan === 'freelancer'
            ? 'Upgrade to Agency ($99/mo) for 100 crawled pages per audit.'
            : 'Upgrade to Team ($149/mo) for 500 crawled pages per audit.',
        };
      }

      return {
        allowed: true,
        feature: 'crawled_pages',
        plan,
        limit,
      };
    }

    case 'gsc_sync': {
      if (!entitlements.hasGscSync) {
        return {
          allowed: false,
          feature: 'gsc_sync',
          plan,
          limit: false,
          error: 'Google Search Console OAuth connection is not available on the Free plan.',
          upgradePrompt: 'Upgrade to Freelancer ($39/mo) or higher to connect Search Console and sync live search performance.',
        };
      }
      return { allowed: true, feature: 'gsc_sync', plan, limit: true };
    }

    case 'striking_distance': {
      if (!entitlements.hasStrikingDistance) {
        return {
          allowed: false,
          feature: 'striking_distance',
          plan,
          limit: false,
          error: 'Striking Distance Opportunity Finder (positions 11-20) is exclusive to Agency and Team plans.',
          upgradePrompt: 'Upgrade to Agency ($99/mo) to unlock striking distance keyword opportunities and instant traffic wins.',
        };
      }
      return { allowed: true, feature: 'striking_distance', plan, limit: true };
    }

    case 'traffic_drop': {
      if (!entitlements.hasTrafficDropEngine) {
        return {
          allowed: false,
          feature: 'traffic_drop',
          plan,
          limit: false,
          error: 'Traffic Drop Investigation Engine is exclusive to Agency and Team plans.',
          upgradePrompt: 'Upgrade to Agency ($99/mo) to monitor algorithmic drops and 40-day baseline deviations.',
        };
      }
      return { allowed: true, feature: 'traffic_drop', plan, limit: true };
    }

    case 'keyword_clustering': {
      if (!entitlements.hasKeywordClustering) {
        return {
          allowed: false,
          feature: 'keyword_clustering',
          plan,
          limit: false,
          error: 'Semantic Keyword Clustering and Search Intent Mapping is exclusive to the Team plan.',
          upgradePrompt: 'Upgrade to Team ($149/mo) to unlock enterprise keyword clustering and SERP intelligence.',
        };
      }
      return { allowed: true, feature: 'keyword_clustering', plan, limit: true };
    }

    case 'white_label': {
      if (!entitlements.hasWhiteLabelReports) {
        return {
          allowed: false,
          feature: 'white_label',
          plan,
          limit: false,
          error: 'White-label executive client reports with custom branding are exclusive to Agency and Team plans.',
          upgradePrompt: 'Upgrade to Agency ($99/mo) to remove RankPilot branding and export agency-branded client reports.',
        };
      }
      return { allowed: true, feature: 'white_label', plan, limit: true };
    }

    default:
      return { allowed: true, feature, plan, limit: true };
  }
}
