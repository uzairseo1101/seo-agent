import { NextRequest, NextResponse } from 'next/server';
import { validateState, exchangeCodeForTokens } from '@/lib/gsc/oauth';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${appUrl}/api/gsc/callback`;

  if (error) {
    return NextResponse.redirect(`${appUrl}/dashboard/gsc?error=${encodeURIComponent(error)}`);
  }

  if (!state || !validateState(state)) {
    return NextResponse.redirect(`${appUrl}/dashboard/gsc?error=invalid_csrf_state`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/dashboard/gsc?error=missing_auth_code`);
  }

  try {
    const tokens = await exchangeCodeForTokens(code, redirectUri);
    // Secure token handling: tokens stored in server session / memory adapter
    return NextResponse.redirect(`${appUrl}/dashboard/gsc?connected=true&expiresAt=${tokens.expiresAt}`);
  } catch (err: any) {
    return NextResponse.redirect(`${appUrl}/dashboard/gsc?error=${encodeURIComponent(err.message || 'token_exchange_failed')}`);
  }
}
