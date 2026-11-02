import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerAuthContext } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  try {
    const auth = await getServerAuthContext(req);
    if (!auth.isAdmin) {
      return NextResponse.json({ success: false, error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const websiteId = req.nextUrl.searchParams.get('websiteId') || undefined;
    const audits = await db.getAuditRuns(websiteId, req);
    return NextResponse.json({ success: true, audits });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch audits.' },
      { status: 500 }
    );
  }
}
