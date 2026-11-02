import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Website } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const websites = await db.getWebsites(req);
    // Filter out any legacy mock placeholder websites if any linger
    const cleanWebsites = websites.filter(
      (w: Website) =>
        !['web-1', 'web-2', 'web-3'].includes(w.id) &&
        !['SaaSFlow Analytics', 'Nordic Clean Living', 'Zenith Legal Partners'].includes(w.name) &&
        !['saasflow.io', 'nordicclean.com', 'zenithlaw.co.uk'].includes(w.domain)
    );
    return NextResponse.json({ success: true, websites: cleanWebsites });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve websites.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, domain, url } = body;

    if (!name || !domain || !url) {
      return NextResponse.json(
        { success: false, error: 'Name, domain, and URL are required.' },
        { status: 400 }
      );
    }

    const newWebsite = await db.createWebsite(
      {
        name: name.trim(),
        domain: domain.trim(),
        url: url.trim(),
      },
      req
    );

    return NextResponse.json({ success: true, website: newWebsite });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add website.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required.' }, { status: 400 });
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
