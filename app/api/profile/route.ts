import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthContext, getAdminSupabase } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  try {
    const auth = await getServerAuthContext(req);
    if (!auth.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: auth.user,
      isAdmin: auth.isAdmin,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getServerAuthContext(req);
    if (!auth.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    const { fullName } = body;

    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ success: false, error: 'Full name is required.' }, { status: 400 });
    }

    const admin = getAdminSupabase();
    if (admin) {
      await admin
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', auth.user.id);
    }

    return NextResponse.json({
      success: true,
      user: {
        ...auth.user,
        fullName: fullName.trim(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
