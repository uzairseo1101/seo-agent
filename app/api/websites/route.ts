import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Website } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    // If Supabase is configured, attempt to query from Supabase
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Map database snake_case to frontend camelCase
        const mappedWebsites: Website[] = data.map((row: any) => ({
          id: row.id,
          organizationId: row.organization_id,
          name: row.name,
          domain: row.domain,
          url: row.url,
          status: row.status || 'active',
          latestSeoScore: Number(row.latest_seo_score) || 0,
          latestGeoScore: Number(row.latest_geo_score) || 0,
          latestAeoScore: Number(row.latest_aeo_score) || 0,
          lastAuditedAt: row.last_audited_at || undefined,
          createdAt: row.created_at || new Date().toISOString(),
        }));
        return NextResponse.json({ success: true, websites: mappedWebsites });
      }
    }

    // Fallback to storage service
    const websites = storage.getWebsites();
    return NextResponse.json({ success: true, websites });
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

    const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim();
    const cleanUrl = url.startsWith('http') ? url.trim() : `https://${url.trim()}`;
    const generatedId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `web-${Date.now()}`;
    const org = storage.getOrganization();

    // If Supabase is configured, attempt to persist directly
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('websites')
        .insert({
          id: generatedId,
          organization_id: org.id,
          name: name.trim(),
          domain: cleanDomain,
          url: cleanUrl,
          status: 'active',
          latest_seo_score: 0,
          latest_geo_score: 0,
          latest_aeo_score: 0,
        })
        .select()
        .single();

      if (!error && data) {
        const newWebsite: Website = {
          id: data.id,
          organizationId: data.organization_id,
          name: data.name,
          domain: data.domain,
          url: data.url,
          status: data.status || 'active',
          latestSeoScore: 0,
          latestGeoScore: 0,
          latestAeoScore: 0,
          createdAt: data.created_at || new Date().toISOString(),
        };

        // Also sync into local storage cache
        storage.addWebsite({
          id: newWebsite.id,
          name: newWebsite.name,
          domain: newWebsite.domain,
          url: newWebsite.url,
        });

        return NextResponse.json({ success: true, website: newWebsite });
      }
    }

    // Fallback: save to storage service
    const added = storage.addWebsite({
      id: generatedId,
      name: name.trim(),
      domain: cleanDomain,
      url: cleanUrl,
    });

    return NextResponse.json({ success: true, website: added });
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

    if (isSupabaseConfigured && supabase) {
      await supabase.from('websites').delete().eq('id', id);
    }

    const deleted = storage.deleteWebsite(id);
    return NextResponse.json({ success: true, deleted });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete website.' },
      { status: 500 }
    );
  }
}
