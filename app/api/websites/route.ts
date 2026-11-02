import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Website } from '@/lib/types';
import { validateEntitlement, getOrganizationEntitlements } from '@/lib/entitlements';
import { getServerAuthContext } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  try {
    const auth = await getServerAuthContext(req);
    const websites = await db.getWebsites(req);

    // Filter out any legacy mock placeholder websites if any linger
    const cleanWebsites = websites.filter(
      (w: Website) =>
        !['web-1', 'web-2', 'web-3'].includes(w.id) &&
        !['SaaSFlow Analytics', 'Nordic Clean Living', 'Zenith Legal Partners'].includes(w.name) &&
        !['saasflow.io', 'nordicclean.com', 'zenithlaw.co.uk'].includes(w.domain)
    );

    const entitlements = await getOrganizationEntitlements(auth.organizationId);

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
    const auth = await getServerAuthContext(req);
    if (!auth.user || !auth.organizationId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to add a website.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, domain, url } = body;

    if (!name || !domain || !url) {
      return NextResponse.json(
        { success: false, error: 'Name, domain, and URL are required.' },
        { status: 400 }
      );
    }

    // Server-Side Entitlement Check: enforce website limit strictly against user's organization
    const validation = await validateEntitlement(auth.organizationId, 'websites');
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
        organizationId: auth.organizationId,
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
    const auth = await getServerAuthContext(req);
    if (!auth.user || !auth.organizationId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Website ID is required.' },
        { status: 400 }
      );
    }

    const deleted = await db.deleteWebsite(id, req);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Website not found or unauthorized to delete.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, deleted: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete website.' },
      { status: 500 }
    );
  }
}
