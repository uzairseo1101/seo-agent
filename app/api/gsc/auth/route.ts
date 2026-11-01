import { NextRequest, NextResponse } from 'next/server';
import { generateAuthUrl, isGoogleOAuthConfigured } from '@/lib/gsc/oauth';
import { storage } from '@/lib/storage';

export async function GET(req: NextRequest) {
  try {
    const org = storage.getOrganization();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${appUrl}/api/gsc/callback`;

    const { url, state } = generateAuthUrl(org.id, redirectUri);

    return NextResponse.json({
      success: true,
      authUrl: url,
      isConfigured: isGoogleOAuthConfigured(),
      state,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
