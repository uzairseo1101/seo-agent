import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthContext } from '@/lib/auth-server';
import { db } from '@/lib/db';
import { getOrganizationEntitlements } from '@/lib/entitlements';
import { startBackgroundCrawlJob } from '@/lib/crawler/background-runner';

export async function POST(req: NextRequest) {
  try {
    const auth = await getServerAuthContext(req);
    const body = await req.json();
    const { websiteId, maxPages, maxDepth, url, domain, name } = body;

    if (!websiteId && !url) {
      return NextResponse.json(
        { success: false, error: 'A valid websiteId or URL is required to start an audit.' },
        { status: 400 }
      );
    }

    // 1. Resolve Website and verify ownership
    let website = null;
    if (websiteId) {
      website = await db.getWebsiteById(websiteId, req);
    }

    const orgId = website?.organizationId || auth.organizationId;
    const entitlements = await getOrganizationEntitlements(orgId);
    const maxAllowedPages = entitlements.maxCrawledPages;

    // Enforce plan limits
    const requestedPages = typeof maxPages === 'number' ? maxPages : 10;
    const effectiveMaxPages = Math.min(Math.max(requestedPages, 1), maxAllowedPages);
    const effectiveMaxDepth = typeof maxDepth === 'number' ? Math.min(Math.max(maxDepth, 1), 3) : 2;

    // 2. Start durable background crawl job
    const job = await startBackgroundCrawlJob({
      websiteId: websiteId || (website?.id as string),
      organizationId: orgId || undefined,
      maxPages: effectiveMaxPages,
      maxDepth: effectiveMaxDepth,
      plan: entitlements.plan,
      targetUrl: url || website?.url,
      targetDomain: domain || website?.domain,
      targetName: name || website?.name,
      req,
    });

    return NextResponse.json({
      success: true,
      job,
      plan: entitlements.plan,
      maxAllowedPages,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to start audit job.' },
      { status: 400 }
    );
  }
}
