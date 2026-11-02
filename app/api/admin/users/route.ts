import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createAdminClient } from '@/lib/supabase-server';
import { getServerAuthContext } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  try {
    const auth = await getServerAuthContext(req);
    if (!auth.isAdmin) {
      return NextResponse.json({ success: false, error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const users = await db.getProfiles(req);
    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch users.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getServerAuthContext(req);
    if (!auth.isAdmin) {
      return NextResponse.json({ success: false, error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { id, role } = body;

    if (!id || !role || !['user', 'admin', 'superadmin'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Valid id and role (user, admin, superadmin) are required.' },
        { status: 400 }
      );
    }

    const updated = await db.updateProfileRole(id, role, req);
    return NextResponse.json({ success: true, updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update user role.' },
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
      return NextResponse.json({ success: false, error: 'User id is required.' }, { status: 400 });
    }

    const admin = createAdminClient();
    if (admin) {
      // Delete user from auth.users (cascades to profile and memberships)
      await admin.auth.admin.deleteUser(id);
    }

    return NextResponse.json({ success: true, message: 'User deleted.' });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete user.' },
      { status: 500 }
    );
  }
}
