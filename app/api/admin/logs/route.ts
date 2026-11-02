import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerAuthContext } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  try {
    const auth = await getServerAuthContext(req);
    if (!auth.isAdmin) {
      return NextResponse.json({ success: false, error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const limit = Number(req.nextUrl.searchParams.get('limit')) || 20;
    const logs = await db.getActivityLogs(limit, req);
    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch logs.' },
      { status: 500 }
    );
  }
}
