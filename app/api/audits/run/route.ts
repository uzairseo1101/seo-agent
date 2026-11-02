import { NextRequest, NextResponse } from 'next/server';
import { executeWebsiteAudit } from '@/lib/analyzer/audit-engine';
import { db } from '@/lib/db';
import { getOrganizationEntitlements } from '@/lib/entitlements';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { websiteId, maxPages, maxDepth, url, domain, name } = body;

    if (!websiteId && !url) {
      return NextResponse.json({ success: false, error: 'websiteId or url is required.' }, { status: 400 });
    }

    // Resolve website's organization to get exact server-enforced crawl limits
    let orgId: string | null = null;
    if (websiteId) {
      const site = await db.getWebsiteById(websiteId, req);
      if (site?.organizationId) {
        orgId = site.organizationId;
      }
    }

    const entitlements = await getOrganizationEntitlements(orgId);
    const maxAllowedPages = entitlements.maxCrawledPages; // 10 for Free, 25 for Freelancer, 100 for Agency, 500 for Team

    // Safe clamp: requested pages cannot exceed the subscription allowance
    const requestedPages = typeof maxPages === 'number' ? maxPages : 10;
    const effectiveMaxPages = Math.min(Math.max(requestedPages, 1), maxAllowedPages);
    const effectiveMaxDepth = typeof maxDepth === 'number' ? Math.min(Math.max(maxDepth, 1), 3) : 2;

    const result = await executeWebsiteAudit(websiteId || `web-${Date.now()}`, {
      maxPages: effectiveMaxPages,
      maxDepth: effectiveMaxDepth,
      targetUrl: url,
      targetDomain: domain,
      targetName: name,
    });

    return NextResponse.json({
      success: true,
      plan: entitlements.plan,
      maxAllowedPages,
      pagesCrawled: result.auditRun.pagesCrawled,
      auditRun: result.auditRun,
      findings: result.findings,
      findingsCount: result.findings.length,
      scores: {
        seo: result.auditRun.seoScore,
        geo: result.auditRun.geoScore,
        aeo: result.auditRun.aeoScore,
      },
      tasksCreatedCount: result.tasksCreatedCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Audit execution encountered a failure.',
      },
      { status: 400 }
    );
  }
}
