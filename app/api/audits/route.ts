import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const websiteId = req.nextUrl.searchParams.get('websiteId') || undefined;
    const auditRunId = req.nextUrl.searchParams.get('auditRunId') || undefined;

    const [auditRuns, findings] = await Promise.all([
      db.getAuditRuns(websiteId, req),
      db.getFindings(auditRunId, websiteId, req),
    ]);

    return NextResponse.json({
      success: true,
      auditRuns,
      findings,
      latestRun: auditRuns[0] || null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve audits.' },
      { status: 500 }
    );
  }
}
