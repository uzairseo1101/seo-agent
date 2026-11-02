import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Website } from '@/lib/types';
import { validateEntitlement, getOrganizationEntitlements } from '@/lib/entitlements';
import { getSupabaseServerClient, createAdminClient, createServerClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  try {
    const websites = await db.getWebsites(req);
    // Filter out any legacy mock placeholder websites if any linger
    const cleanWebsites = websites.filter(
      (w: Website) =>
        !['web-1', 'web-2', 'web-3'].includes(w.id) &&
        !['SaaSFlow Analytics', 'Nordic Clean Living', 'Zenith Legal Partners'].includes(w.name) &&
        !['saasflow.io', 'nordicclean.com', 'zenithlaw.co.uk'].includes(w.domain)
    );

    // Resolve organization entitlements
    const orgId = cleanWebsites[0]?.organizationId || null;
    const entitlements = await getOrganizationEntitlements(orgId);

    return NextResponse.json({
      success: true,
      websites: cleanWebsites,
      plan: entitlements.plan,
      maxWebsites: entitlements.maxWebsites,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve websites.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, domain, url, organizationId } = body;

    if (!name || !domain || !url) {
      return NextResponse.json(
        { success: false, error: 'Name, domain, and URL are required.' },
        { status: 400 }
      );
    }

    // Resolve organization ID for entitlement validation
    let resolvedOrgId = organizationId;
    if (!resolvedOrgId) {
      const client = getSupabaseServerClient(req) || createAdminClient() || createServerClient();
      if (client) {
        try {
          const { data: authData } = await client.auth.getUser();
          if (authData?.user?.id) {
            const { data: member } = await client
              .from('memberships')
              .select('organization_id')
              .eq('user_id', authData.user.id)
              .limit(1)
              .maybeSingle();
            if (member?.organization_id) resolvedOrgId = member.organization_id;
          }
          if (!resolvedOrgId) {
            const { data: org } = await client.from('organizations').select('id').limit(1).maybeSingle();
            if (org?.id) resolvedOrgId = org.id;
          }
        } catch {
          // Fall through to default
        }
      }
    }

    // Server-Side Entitlement Check: enforce website limit
    const validation = await validateEntitlement(resolvedOrgId, 'websites');
    if (!validation.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
          upgradePrompt: validation.upgradePrompt,
          limit: validation.limit,
          currentCount: validation.currentCount,
          plan: validation.plan,
        },
        { status: 403 }
      );
    }

    const newWebsite = await db.createWebsite(
      {
        name: name.trim(),
        domain: domain.trim(),
        url: url.trim(),
        organizationId: resolvedOrgId,
      },
      req
    );

    return NextResponse.json({ success: true, website: newWebsite });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add website.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required.' }, { status: 400 });
    }

    const deleted = await db.deleteWebsite(id, req);
    return NextResponse.json({ success: true, deleted });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete website.' },
      { status: 500 }
    );
  }
}
