import { NextRequest, NextResponse } from 'next/server';
import { cancelCrawlJob } from '@/lib/crawler/background-runner';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ success: false, error: 'jobId is required to cancel.' }, { status: 400 });
    }

    cancelCrawlJob(jobId);
    await db.updateCrawlJob(jobId, {
      status: 'cancelled',
      currentStage: 'Cancelled by user',
      completedAt: new Date().toISOString(),
    }, req);

    return NextResponse.json({ success: true, message: 'Crawl job cancelled.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
