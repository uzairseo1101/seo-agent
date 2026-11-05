import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerAuthContext } from '@/lib/auth-server';
import { AuditFinding, AuditRun } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const jobId = req.nextUrl.searchParams.get('jobId');
    const websiteId = req.nextUrl.searchParams.get('websiteId');

    let job = null;
    if (jobId) {
      job = await db.getCrawlJobById(jobId, req);
    } else if (websiteId) {
      job = await db.getLatestCrawlJob(websiteId, req);
    }

    if (!job) {
      return NextResponse.json({
        success: true,
        job: null,
      });
    }

    // If job has completed or partially completed, fetch the audit run and findings
    let auditRun: AuditRun | null = null;
    let findings: AuditFinding[] = [];

    if (['completed', 'partially_completed'].includes(job.status)) {
      if (job.auditRunId) {
        const runs = await db.getAuditRuns(job.websiteId, req);
        auditRun = runs.find(r => r.id === job!.auditRunId) || runs[0] || null;
        if (auditRun) {
          findings = await db.getFindings(auditRun.id, job.websiteId, req);
        }
      } else {
        const runs = await db.getAuditRuns(job.websiteId, req);
        auditRun = runs[0] || null;
        if (auditRun) {
          findings = await db.getFindings(auditRun.id, job.websiteId, req);
        }
      }
    }

    return NextResponse.json({
      success: true,
      job,
      auditRun,
      findings,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve audit job status.' },
      { status: 500 }
    );
  }
}
