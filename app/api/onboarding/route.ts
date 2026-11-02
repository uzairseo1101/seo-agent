import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient, createAdminClient, createServerClient } from '@/lib/supabase-server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, companyName, userType, primaryWebsite, timeZone } = body;

    const client = getSupabaseServerClient(req) || createAdminClient() || createServerClient();

    let userId: string | null = null;
    let orgId: string | null = null;

    if (client) {
      try {
        const { data: authData } = await client.auth.getUser();
        if (authData?.user?.id) {
          userId = authData.user.id;
          // Update profile
          await client.from('profiles').upsert({
            id: userId,
            email: authData.user.email,
            full_name: fullName,
            created_at: authData.user.created_at,
            updated_at: new Date().toISOString(),
          });

          // Resolve organization
          const { data: member } = await client
            .from('memberships')
            .select('organization_id')
            .eq('user_id', userId)
            .limit(1)
            .maybeSingle();

          if (member?.organization_id) {
            orgId = member.organization_id;
            if (companyName) {
              await client
                .from('organizations')
                .update({ name: companyName.trim(), updated_at: new Date().toISOString() })
                .eq('id', orgId);
            }
          }
        }
      } catch (e) {
        console.warn('Profile onboarding update error:', e);
      }
    }

    // If primary website provided, create it in database
    if (primaryWebsite && primaryWebsite.trim()) {
      try {
        const cleanDomain = primaryWebsite.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim();
        const cleanUrl = primaryWebsite.startsWith('http') ? primaryWebsite.trim() : `https://${primaryWebsite.trim()}`;
        const siteName = companyName?.trim() || cleanDomain;

        await db.createWebsite(
          {
            name: siteName,
            domain: cleanDomain,
            url: cleanUrl,
            organizationId: orgId || undefined,
          },
          req
        );
      } catch (siteErr) {
        console.warn('Onboarding primary website creation note:', siteErr);
      }
    }

    return NextResponse.json({
      success: true,
      userId,
      organizationId: orgId,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Onboarding update failed.' },
      { status: 500 }
    );
  }
}
