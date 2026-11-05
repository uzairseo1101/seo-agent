import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { analyzeGscKeywords, GSC_REGEX_PRESETS, REGEX_SYNTAX_HELP, DATASET_SCOPE_LIMITATION_NOTE } from '@/lib/gsc/regex-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const websiteId = searchParams.get('websiteId') || undefined;
    const customRegex = searchParams.get('regex') || undefined;
    const presetFilter = (searchParams.get('preset') as any) || 'all';
    const minImpressions = searchParams.get('minImp') ? parseInt(searchParams.get('minImp')!, 10) : undefined;
    const minClicks = searchParams.get('minClicks') ? parseInt(searchParams.get('minClicks')!, 10) : undefined;
    const zeroClicksOnly = searchParams.get('zeroClicks') === 'true';
    const pageFilter = searchParams.get('page') || undefined;
    const positionBracket = (searchParams.get('posBracket') as any) || 'all';

    if (!websiteId) {
      return NextResponse.json({ success: false, error: 'websiteId is required.' }, { status: 400 });
    }

    const site = await db.getWebsiteById(websiteId, req);
    const brandNamesParam = searchParams.get('brands');
    const brandNames = brandNamesParam
      ? brandNamesParam.split(',').map(b => b.trim()).filter(Boolean)
      : [site?.name, site?.domain?.replace(/\..*$/, '')].filter(Boolean) as string[];

    const competitorNamesParam = searchParams.get('competitors');
    const competitorNames = competitorNamesParam
      ? competitorNamesParam.split(',').map(c => c.trim()).filter(Boolean)
      : [];

    const rows = await db.getGscMetrics(websiteId, req);

    const result = analyzeGscKeywords(rows, {
      customRegex,
      presetFilter,
      brandConfig: { brandNames, competitorNames },
      minImpressions,
      minClicks,
      zeroClicksOnly,
      pageFilter,
      positionBracket,
    });

    return NextResponse.json({
      success: true,
      websiteId,
      ...result,
      presets: GSC_REGEX_PRESETS,
      syntaxHelp: REGEX_SYNTAX_HELP,
      datasetScopeNote: DATASET_SCOPE_LIMITATION_NOTE,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      websiteId,
      customRegex,
      presetFilter = 'all',
      brandNames,
      competitorNames = [],
      minImpressions,
      minClicks,
      zeroClicksOnly,
      pageFilter,
      positionBracket = 'all',
    } = body;

    if (!websiteId) {
      return NextResponse.json({ success: false, error: 'websiteId is required.' }, { status: 400 });
    }

    const site = await db.getWebsiteById(websiteId, req);
    const resolvedBrands = (brandNames && Array.isArray(brandNames) && brandNames.length > 0)
      ? brandNames
      : [site?.name, site?.domain?.replace(/\..*$/, '')].filter(Boolean) as string[];

    const rows = await db.getGscMetrics(websiteId, req);

    const result = analyzeGscKeywords(rows, {
      customRegex,
      presetFilter,
      brandConfig: {
        brandNames: resolvedBrands,
        competitorNames: competitorNames || [],
      },
      minImpressions,
      minClicks,
      zeroClicksOnly,
      pageFilter,
      positionBracket,
    });

    return NextResponse.json({
      success: true,
      websiteId,
      ...result,
      presets: GSC_REGEX_PRESETS,
      syntaxHelp: REGEX_SYNTAX_HELP,
      datasetScopeNote: DATASET_SCOPE_LIMITATION_NOTE,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
