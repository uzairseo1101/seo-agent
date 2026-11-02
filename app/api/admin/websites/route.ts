import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const websites = await db.getWebsites();
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
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Website id is required.' }, { status: 400 });
    }

    const deleted = await db.deleteWebsite(id);
    return NextResponse.json({ success: true, deleted });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete website.' },
      { status: 500 }
    );
  }
}
