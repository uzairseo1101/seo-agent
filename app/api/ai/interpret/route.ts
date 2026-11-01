import { NextRequest, NextResponse } from 'next/server';
import { interpretAuditWithAi, isGeminiConfigured } from '@/lib/ai/gemini-provider';
import { storage } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { websiteId } = body;

    const websites = storage.getWebsites();
    const website = websites.find(w => w.id === websiteId) || websites[0];

    if (!website) {
      return NextResponse.json({ success: false, error: 'Website not found' }, { status: 404 });
    }

    const findings = storage.getFindings(website.id);

    const interpretation = await interpretAuditWithAi(
      website.name,
      website.domain,
      findings,
      website.latestSeoScore || 84.5,
      website.latestGeoScore || 78.0,
      website.latestAeoScore || 88.5
    );

    return NextResponse.json({
      success: true,
      interpretation,
      isAiConfigured: isGeminiConfigured(),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
