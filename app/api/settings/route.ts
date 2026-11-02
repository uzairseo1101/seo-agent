import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthContext, getAdminSupabase } from '@/lib/auth-server';
import { isValidUuid } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const auth = await getServerAuthContext(req);
    if (!auth.user || !auth.organizationId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const admin = getAdminSupabase();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Database service unavailable' },
        { status: 503 }
      );
    }

    const { data: org, error } = await admin
      .from('organizations')
      .select('id, name, slug, plan, max_websites, max_crawled_pages_per_audit, created_at')
      .eq('id', auth.organizationId)
      .maybeSingle();

    if (error || !org) {
      return NextResponse.json(
        { success: false, error: 'Organization workspace not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        plan: org.plan || 'free',
        maxWebsites: org.max_websites || 1,
        maxCrawledPagesPerAudit: org.max_crawled_pages_per_audit || 10,
        createdAt: org.created_at,
        role: auth.orgRole || 'owner',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getServerAuthContext(req);
    if (!auth.user || !auth.organizationId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only owners and admins can update workspace settings
    if (!auth.isAdmin && auth.orgRole !== 'owner' && auth.orgRole !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to update workspace settings' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Workspace name is required' },
        { status: 400 }
      );
    }

    const admin = getAdminSupabase();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Database service unavailable' },
        { status: 503 }
      );
    }

    const cleanName = name.trim().slice(0, 80);

    const { data: updatedOrg, error } = await admin
      .from('organizations')
      .update({
        name: cleanName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', auth.organizationId)
      .select('id, name, slug, plan, max_websites, max_crawled_pages_per_audit')
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to update organization' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      organization: {
        id: updatedOrg.id,
        name: updatedOrg.name,
        slug: updatedOrg.slug,
        plan: updatedOrg.plan,
        maxWebsites: updatedOrg.max_websites,
        maxCrawledPagesPerAudit: updatedOrg.max_crawled_pages_per_audit,
        role: auth.orgRole,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update organization settings' },
      { status: 500 }
    );
  }
}
