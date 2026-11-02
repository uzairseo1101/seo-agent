import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const websiteId = req.nextUrl.searchParams.get('websiteId') || undefined;
    const audits = await db.getAuditRuns(websiteId);
    return NextResponse.json({ success: true, audits });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch audits.' },
      { status: 500 }
    );
  }
}
