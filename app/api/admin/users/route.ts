import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createAdminClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  try {
    const users = await db.getProfiles();
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
    const body = await req.json();
    const { id, role } = body;

    if (!id || !role || !['user', 'admin', 'superadmin'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Valid id and role (user, admin, superadmin) are required.' },
        { status: 400 }
      );
    }

    const updated = await db.updateProfileRole(id, role);
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
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'User id is required.' }, { status: 400 });
    }

    const admin = createAdminClient();
    if (admin) {
      // Delete user from auth.users (cascades to profile and memberships)
      await admin.auth.admin.deleteUser(id);
    }

    await db.logActivity('user_deleted', 'profile', id);
    return NextResponse.json({ success: true, deleted: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete user.' },
      { status: 500 }
    );
  }
}
