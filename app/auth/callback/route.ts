import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const next = requestUrl.searchParams.get('next') || '/onboarding/plan-selection';
  const origin = requestUrl.origin;

  if (errorDescription) {
    return NextResponse.redirect(
      `${origin}/signin?error=${encodeURIComponent(errorDescription)}`
    );
  }

  const supabase = createServerClient();
  if (supabase) {
    if (code) {
      await supabase.auth.exchangeCodeForSession(code);
    } else if (token_hash && type) {
      await supabase.auth.verifyOtp({
        token_hash,
        type: type as any,
      });
    }
  }

  // URL to redirect to after confirmation / sign-in process completes
  return NextResponse.redirect(`${origin}${next}`);
}
