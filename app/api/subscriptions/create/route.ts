import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient, createAdminClient, createServerClient } from '@/lib/supabase-server';
import { PlanTier, BillingCycle } from '@/lib/types';
import { PLAN_LIMITS_MAP, PlanId } from '@/lib/pricing-config';
import { isValidUuid } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plan, billingCycle = 'monthly', provider = 'free' } = body;

    const validPlans: PlanId[] = ['free', 'freelancer', 'agency', 'team'];
    if (!plan || !validPlans.includes(plan)) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan selected. Must be free, freelancer, agency, or team.' },
        { status: 400 }
      );
    }

    const client = getSupabaseServerClient(req) || createAdminClient() || createServerClient();
    if (!client) {
      return NextResponse.json({ success: true, plan, mode: 'local' });
    }

    // 1. Resolve user and organization
    let userId: string | null = null;
    let orgId: string | null = null;

    try {
      const { data: authData } = await client.auth.getUser();
      if (authData?.user?.id) {
        userId = authData.user.id;
        const { data: member } = await client
          .from('memberships')
          .select('organization_id')
          .eq('user_id', userId)
          .limit(1)
          .maybeSingle();

        if (member?.organization_id && isValidUuid(member.organization_id)) {
          orgId = member.organization_id;
        }
      }
    } catch {
      // Proceed with fallback
    }

    // If no org found, locate or create an organization
    if (!orgId) {
      const { data: existingOrg } = await client
        .from('organizations')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existingOrg?.id && isValidUuid(existingOrg.id)) {
        orgId = existingOrg.id;
      } else {
        const newOrgId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '00000000-0000-0000-0000-000000000001';
        const { data: created } = await client
          .from('organizations')
          .insert({
            id: newOrgId,
            name: 'Workspace Organization',
            slug: `ws-${Date.now()}`,
            plan,
          })
          .select('id')
          .maybeSingle();
        orgId = created?.id || newOrgId;

        // If user logged in, create membership
        if (userId) {
          await client.from('memberships').insert({
            organization_id: orgId,
            user_id: userId,
            role: 'owner',
          });
        }
      }
    }

    // 2. Update organization's plan and limits
    const limits = PLAN_LIMITS_MAP[plan as PlanId];
    await client
      .from('organizations')
      .update({
        plan,
        max_websites: limits.maxWebsites,
        max_crawled_pages_per_audit: limits.maxCrawledPages,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orgId);

    // 3. Upsert subscription record in subscriptions table
    const periodEnd = new Date();
    if (billingCycle === 'annual') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    try {
      await client
        .from('subscriptions')
        .insert({
          organization_id: orgId,
          plan,
          billing_cycle: billingCycle,
          provider: provider || 'free',
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: periodEnd.toISOString(),
          cancel_at_period_end: false,
        });
    } catch {
      // If table migration not yet run, organizations.plan update is already complete
    }

    // 4. Upsert subscription_entitlements
    try {
      await client
        .from('subscription_entitlements')
        .upsert(
          {
            organization_id: orgId,
            plan,
            max_websites: limits.maxWebsites,
            max_crawled_pages: limits.maxCrawledPages,
            max_saved_reports: limits.maxSavedReports,
            history_retention_days: limits.historyRetentionDays,
            has_gsc_sync: limits.hasGscSync,
            has_striking_distance: limits.hasStrikingDistance,
            has_traffic_drop_engine: limits.hasTrafficDropEngine,
            has_keyword_clustering: limits.hasKeywordClustering,
            has_team_seats: limits.hasTeamSeats,
            has_api_access: limits.hasApiAccess,
            has_white_label_reports: limits.hasWhiteLabelReports,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'organization_id' }
        );
    } catch {
      // Continue
    }

    return NextResponse.json({
      success: true,
      organizationId: orgId,
      plan,
      billingCycle,
      limits,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create subscription.' },
      { status: 500 }
    );
  }
}
