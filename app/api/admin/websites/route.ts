import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerAuthContext } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  try {
    const auth = await getServerAuthContext(req);
    if (!auth.isAdmin) {
      return NextResponse.json({ success: false, error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const websites = await db.getWebsites(req);
    return NextResponse.json({ success: true, websites });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch websites.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await getServerAuthContext(req);
    if (!auth.isAdmin) {
      return NextResponse.json({ success: false, error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Website id is required.' }, { status: 400 });
    }

    const deleted = await db.deleteWebsite(id, req);
    return NextResponse.json({ success: true, deleted });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete website.' },
      { status: 500 }
    );
  }
}
