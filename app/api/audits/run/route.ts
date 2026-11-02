import { NextRequest, NextResponse } from 'next/server';
import { executeWebsiteAudit } from '@/lib/analyzer/audit-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { websiteId, maxPages, maxDepth, url, domain, name } = body;

    if (!websiteId && !url) {
      return NextResponse.json({ success: false, error: 'websiteId or url is required.' }, { status: 400 });
    }

    const result = await executeWebsiteAudit(websiteId || `web-${Date.now()}`, {
      maxPages: typeof maxPages === 'number' ? Math.min(maxPages, 25) : 15,
      maxDepth: typeof maxDepth === 'number' ? Math.min(maxDepth, 2) : 1,
      targetUrl: url,
      targetDomain: domain,
      targetName: name,
    });

    return NextResponse.json({
      success: true,
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
